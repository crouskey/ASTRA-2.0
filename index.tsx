// pages/index.tsx
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../client/components/Layout';
import ChatInterface from '../client/components/ChatInterface';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          generateSpeech: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Update emotion based on response
      if (data.assistantEmotion?.emotion) {
        setCurrentEmotion(data.assistantEmotion.emotion);
      }
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Start recording audio
  const handleStartRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Listen for data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording and transcribe the audio
  const handleStopRecording = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        setIsRecording(false);
        reject('No active recording');
        return;
      }
      
      // Stop the media recorder
      mediaRecorderRef.current.onstop = async () => {
        try {
          // Create a blob from the audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Create form data to send to the API
          const formData = new FormData();
          formData.append('audio', audioBlob);
          
          setIsLoading(true);
          
          // Send to transcription API
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }
          
          const data = await response.json();
          
          // Clean up
          setIsRecording(false);
          audioChunksRef.current = [];
          
          // Return the transcribed text
          resolve(data.text);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setIsRecording(false);
          reject('Failed to transcribe audio');
        } finally {
          setIsLoading(false);
        }
      };
      
      // Trigger stop
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    });
  };

  return (
    <>
      <Head>
        <title>Astra - AI Assistant</title>
        <meta name="description" content="Astra - Your AI assistant with voice, memory, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout currentEmotion={currentEmotion}>
        <div className="h-full flex flex-col">
          <ChatInterface
            onSendMessage={handleSendMessage}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            isRecording={isRecording}
            isLoading={isLoading}
            currentEmotion={currentEmotion}
          />
        </div>
      </Layout>
    </>
  );
}
