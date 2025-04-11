// server/services/google.ts
import { google, Auth, gmail_v1, calendar_v3 } from 'googleapis';
import { logEvent } from '../utils/supabase';

// Configure Google OAuth
const CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.GOOGLE_REDIRECT_URL,
};

// Scopes required for Gmail and Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Create an OAuth2 client
 */
const createOAuth2Client = (): Auth.OAuth2Client => {
  return new google.auth.OAuth2(
    CREDENTIALS.client_id,
    CREDENTIALS.client_secret,
    CREDENTIALS.redirect_uri
  );
};

/**
 * Generate an authentication URL for Google OAuth
 */
export const getAuthUrl = (): string => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokens = async (code: string): Promise<Auth.Credentials> => {
  const oauth2Client = createOAuth2Client();
  
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Create authenticated clients for Gmail and Calendar
 */
const createClients = (tokens: Auth.Credentials): {
  gmail: gmail_v1.Gmail;
  calendar: calendar_v3.Calendar;
} => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  return { gmail, calendar };
};

/**
 * Get recent emails from Gmail
 */
export const getRecentEmails = async (
  tokens: Auth.Credentials,
  maxResults: number = 10
): Promise<any[]> => {
  try {
    const { gmail } = createClients(tokens);
    
    // Get list of messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'in:inbox',
    });
    
    const messages = response.data.messages || [];
    const emails: any[] = [];
    
    // Get details for each message
    for (const message of messages) {
      const messageData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });
      
      const { payload, snippet, internalDate, id } = messageData.data;
      
      // Extract headers
      const headers = payload?.headers || [];
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const date = new Date(parseInt(internalDate || '0')).toISOString();
      
      emails.push({
        id,
        subject,
        from,
        date,
        snippet,
      });
    }
    
    // Log the event
    await logEvent(
      'email_fetch',
      `Retrieved ${emails.length} recent emails`,
      undefined,
      'gmail',
      ['gmail', 'fetch']
    );
    
    return emails;
  } catch (error) {
    console.error('Error getting recent emails:', error);
    throw error;
  }
};

/**
 * Send an email via Gmail
 */
export const sendEmail = async (
  tokens: Auth.Credentials,
  to: string,
  subject: string,
  body: string,
  isHtml: boolean = false
): Promise<string> => {
  try {
    const { gmail } = createClients(tokens);
    
    // Construct the email
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: ' + (isHtml ? 'text/html' : 'text/plain') + '; charset=utf-8',
      '',
      body,
    ];
    
    // Encode the email
    const email = Buffer.from(emailLines.join('\r\n')).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send the email
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: email,
      },
    });
    
    // Log the event
    await logEvent(
      'email_send',
      `Sent email with subject: ${subject}`,
      res.data.id,
      'gmail',
      ['gmail', 'send']
    );
    
    return res.data.id || '';
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Get today's calendar events
 */
export const getTodayEvents = async (
  tokens: Auth.Credentials
): Promise<any[]> => {
  try {
    const { calendar } = createClients(tokens);
    
    // Get start and end of today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    // Get events for today
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    
    // Log the event
    await logEvent(
      'calendar_fetch',
      `Retrieved ${events.length} calendar events for today`,
      undefined,
      'calendar',
      ['calendar', 'fetch']
    );
    
    return events.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      description: event.description,
    }));
  } catch (error) {
    console.error('Error getting today events:', error);
    throw error;
  }
};

/**
 * Create a new calendar event
 */
export const createCalendarEvent = async (
  tokens: Auth.Credentials,
  summary: string,
  startTime: string,
  endTime: string,
  description?: string,
  location?: string
): Promise<string> => {
  try {
    const { calendar } = createClients(tokens);
    
    // Create the event
    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
    
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    // Log the event
    await logEvent(
      'calendar_create',
      `Created calendar event: ${summary}`,
      res.data.id,
      'calendar',
      ['calendar', 'create']
    );
    
    return res.data.id || '';
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Get upcoming calendar events for the next N days
 */
export const getUpcomingEvents = async (
  tokens: Auth.Credentials,
  days: number = 7
): Promise<any[]> => {
  try {
    const { calendar } = createClients(tokens);
    
    // Get start and end dates
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + days);
    
    // Get events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    
    // Log the event
    await logEvent(
      'calendar_fetch',
      `Retrieved ${events.length} upcoming calendar events for the next ${days} days`,
      undefined,
      'calendar',
      ['calendar', 'fetch']
    );
    
    return events.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location,
      description: event.description,
    }));
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    throw error;
  }
};

/**
 * Search for emails by query
 */
export const searchEmails = async (
  tokens: Auth.Credentials,
  query: string,
  maxResults: number = 10
): Promise<any[]> => {
  try {
    const { gmail } = createClients(tokens);
    
    // Search for messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
    });
    
    const messages = response.data.messages || [];
    const emails: any[] = [];
    
    // Get details for each message
    for (const message of messages) {
      const messageData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });
      
      const { payload, snippet, internalDate, id } = messageData.data;
      
      // Extract headers
      const headers = payload?.headers || [];
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
      const date = new Date(parseInt(internalDate || '0')).toISOString();
      
      emails.push({
        id,
        subject,
        from,
        date,
        snippet,
      });
    }
    
    // Log the event
    await logEvent(
      'email_search',
      `Searched emails with query: ${query}`,
      undefined,
      'gmail',
      ['gmail', 'search']
    );
    
    return emails;
  } catch (error) {
    console.error('Error searching emails:', error);
    throw error;
  }
};

/**
 * Get detailed email content
 */
export const getEmailContent = async (
  tokens: Auth.Credentials,
  emailId: string
): Promise<{
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  isHtml: boolean;
}> => {
  try {
    const { gmail } = createClients(tokens);
    
    // Get the email
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full',
    });
    
    const { payload, internalDate, id } = response.data;
    
    // Extract headers
    const headers = payload?.headers || [];
    const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
    const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Unknown Sender';
    const to = headers.find(h => h.name?.toLowerCase() === 'to')?.value || 'Unknown Recipient';
    const date = new Date(parseInt(internalDate || '0')).toISOString();
    
    // Extract body
    let body = '';
    let isHtml = false;
    
    // Helper function to decode the body
    const decodeBody = (part: gmail_v1.Schema$MessagePart): string => {
      if (part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      return '';
    };
    
    // Extract body based on MIME type
    const extractBody = (part: gmail_v1.Schema$MessagePart): { body: string; isHtml: boolean } => {
      if (!part.mimeType) {
        return { body: '', isHtml: false };
      }
      
      if (part.mimeType === 'text/plain') {
        return { body: decodeBody(part), isHtml: false };
      }
      
      if (part.mimeType === 'text/html') {
        return { body: decodeBody(part), isHtml: true };
      }
      
      if (part.mimeType.startsWith('multipart/') && part.parts) {
        // Prefer HTML over plain text if available
        let plainText = '';
        let htmlText = '';
        
        for (const subPart of part.parts) {
          const result = extractBody(subPart);
          if (result.isHtml) {
            htmlText = result.body;
          } else if (!plainText) {
            plainText = result.body;
          }
        }
        
        if (htmlText) {
          return { body: htmlText, isHtml: true };
        }
        return { body: plainText, isHtml: false };
      }
      
      return { body: '', isHtml: false };
    };
    
    if (payload) {
      const result = extractBody(payload);
      body = result.body;
      isHtml = result.isHtml;
    }
    
    // Log the event
    await logEvent(
      'email_view',
      `Viewed email with subject: ${subject}`,
      id,
      'gmail',
      ['gmail', 'view']
    );
    
    return {
      id: id || '',
      subject,
      from,
      to,
      date,
      body,
      isHtml,
    };
  } catch (error) {
    console.error('Error getting email content:', error);
    throw error;
  }
};

export default {
  getAuthUrl,
  getTokens,
  getRecentEmails,
  sendEmail,
  getTodayEvents,
  createCalendarEvent,
  getUpcomingEvents,
  searchEmails,
  getEmailContent,
};
