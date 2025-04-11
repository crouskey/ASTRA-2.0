// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUserId } from '../../server/utils/supabase';
import { processMessage } from '../../server/services/openai';
import { textToSpeech } from '../../server/services/elevenlabs';
import { trackEmotion } from '../../server/services/emotion';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = await getCurrentUserId();

    // Extract message from request body
    const { message, sessionId: existingSessionId, generateSpeech = true } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use existing session ID or generate a new one
    const sessionId = existingSessionId || uuidv4();

    // Process the message using OpenAI
    const response = await processMessage(message, userId, sessionId);

    // Track emotion from the user's message
    const userEmotion = await trackEmotion(message, userId, sessionId);

    // Track emotion from the assistant's response
    const assistantEmotion = await trackEmotion(response.message, userId, sessionId);

    // Generate speech if requested
    let speechUrl = null;
    if (generateSpeech) {
      speechUrl = await textToSpeech(response.message);
    }

    // Return the response
    return res.status(200).json({
      message: response.message,
      sessionId: response.sessionId,
      speechUrl,
      userEmotion,
      assistantEmotion,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
}
