// client/components/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import PixelAvatar from './PixelAvatar';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage: (message: string) => Promise<any>;
  onStartRecording?: () => void;
  onStopRecording?: () => Promise<string>;
  isRecording?: boolean;
  isLoading?: boolean;
  currentEmotion?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialMessages = [],
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  isLoading = false,
  currentEmotion = 'neutral',
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // Send message to backend
      const response = await onSendMessage(inputValue);

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Play speech if available
      if (response.speechUrl) {
        const audio = new Audio(response.speechUrl);
        await audio.play();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRecordClick = async () => {
    if (isRecording && onStopRecording) {
      try {
        // Stop recording and get transcribed text
        const transcribedText = await onStopRecording();
        setInputValue(transcribedText);
        
        // Auto-send the transcribed message
        if (transcribedText.trim() !== '') {
          const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: transcribedText,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, userMessage]);
          setIsSending(true);
          
          // Send message to backend
          const response = await onSendMessage(transcribedText);
          
          // Add assistant response to chat
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Play speech if available
          if (response.speechUrl) {
            const audio = new Audio(response.speechUrl);
            await audio.play();
          }
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      } finally {
        setIsSending(false);
      }
    } else if (onStartRecording) {
      // Start recording
      onStartRecording();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Avatar and header */}
      <div className="flex items-center justify-center py-4">
        <div className="w-16 h-16">
          <PixelAvatar emotion={currentEmotion} size={64} />
        </div>
        <h1 className="ml-4 text-2xl font-semibold text-gray-800">Astra</h1>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start a conversation with Astra</p>
          </div>
        ) : (
          messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : message.role === 'system'
                    ? 'bg-gray-300 text-gray-800'
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 bg-white border rounded-lg">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending || isLoading}
          />
          
          {/* Record button */}
          <button
            onClick={handleRecordClick}
            className={`p-2 transition-colors duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            disabled={isSending || isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors duration-200"
            disabled={inputValue.trim() === '' || isSending || isLoading}
          >
            {isSending || isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
