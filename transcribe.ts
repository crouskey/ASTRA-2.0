// pages/api/voice/transcribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { transcribeSpeech } from '../../../server/services/elevenlabs';
import { getCurrentUserId } from '../../../server/utils/supabase';
import { logEvent } from '../../../server/utils/supabase';
import formidable from 'formidable';
import fs from 'fs';

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the form data
    const form = new formidable.IncomingForm();
    
    // Process the form and audio file
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to parse form' });
      }
      
      // Check if an audio file was uploaded
      const file = files.audio;
      if (!file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }
      
      try {
        // Read the file content
        const audioBuffer = fs.readFileSync(file.filepath);
        
        // Transcribe the speech
        const text = await transcribeSpeech(audioBuffer);
        
        // Log the event
        await logEvent(
          'voice_input',
          'Voice input transcribed',
          undefined,
          'voice',
          ['voice', 'transcription']
        );
        
        // Return the transcribed text
        return res.status(200).json({
          text,
        });
      } catch (error) {
        console.error('Error processing audio:', error);
        return res.status(500).json({ error: 'Failed to transcribe audio' });
      } finally {
        // Clean up the temporary file
        if (file && file.filepath) {
          fs.unlinkSync(file.filepath);
        }
      }
    });
  } catch (error) {
    console.error('Error in voice transcribe API:', error);
    return res.status(500).json({ error: 'Failed to process voice input' });
  }
}
