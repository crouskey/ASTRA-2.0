// server/services/elevenlabs.ts
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logEvent } from '../utils/supabase';

// ElevenLabs API configuration
const API_KEY = process.env.ELEVENLABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // A default voice ID

// Make sure we have a directory to save audio files
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/**
 * Transcribe speech to text
 * @param audioBuffer - Audio data as a Buffer
 * @returns Transcribed text
 */
export const transcribeSpeech = async (audioBuffer: Buffer): Promise<string> => {
  try {
    // Create a temporary file to save the audio
    const tempFilePath = path.join(AUDIO_DIR, `temp-${uuidv4()}.mp3`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Create a form data with the audio file
    const formData = new FormData();
    formData.append('file', new Blob([fs.readFileSync(tempFilePath)]));
    formData.append('model_id', 'scribe'); // Use ElevenLabs' Scribe model
    
    // Call the ElevenLabs API
    const response = await fetch(`${BASE_URL}/speech-to-text/transcribe`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY!,
      },
      body: formData,
    });

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { text: string };
    
    // Log the event
    await logEvent('transcription', 'Audio transcribed to text');
    
    return data.text;
  } catch (error) {
    console.error('Error transcribing speech:', error);
    throw error;
  }
};

/**
 * Convert text to speech
 * @param text - Text to convert to speech
 * @param voiceId - Voice ID to use (optional, uses default if not provided)
 * @returns URL to the generated audio file
 */
export const textToSpeech = async (
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<string> => {
  try {
    // Call the ElevenLabs API to generate speech
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // Save the audio file
    const audioBuffer = await response.arrayBuffer();
    const fileName = `speech-${uuidv4()}.mp3`;
    const filePath = path.join(AUDIO_DIR, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    
    // Log the event
    await logEvent('speech_synthesis', 'Text converted to speech');
    
    // Return the URL path to the audio file
    return `/audio/${fileName}`;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

/**
 * Get available voices from ElevenLabs
 * @returns List of available voices
 */
export const getVoices = async () => {
  try {
    const response = await fetch(`${BASE_URL}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error getting voices:', error);
    throw error;
  }
};

/**
 * Stream text to speech for lower latency
 * This is a more advanced implementation that could be used in production
 * to start playing audio before the entire file is generated
 */
export const streamTextToSpeech = async (
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<ReadableStream> => {
  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    // Log the event
    await logEvent('speech_streaming', 'Streamed text to speech');
    
    // Return the stream directly
    return response.body!;
  } catch (error) {
    console.error('Error streaming text to speech:', error);
    throw error;
  }
};

export default {
  transcribeSpeech,
  textToSpeech,
  getVoices,
  streamTextToSpeech,
};
