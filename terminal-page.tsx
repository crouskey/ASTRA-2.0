// pages/terminal.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../client/components/Layout';
import Terminal from '../client/components/Terminal';

export default function TerminalPage() {
  const [currentEmotion, setCurrentEmotion] = useState('focused');
  const [userId, setUserId] = useState('default-user');
  const [showConfirmation, setShowConfirmation] = useState(true);

  // In a real implementation, this would fetch user data
  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = async () => {
      try {
        // This would be an API call in a real implementation
        // const response = await fetch('/api/user/profile');
        // const data = await response.json();
        
        // For demo purposes, use placeholder data
        setUserId('default-user');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Simulate getting current emotion
    const fetchCurrentEmotion = async () => {
      try {
        // This would be an API call in a real implementation
        // const response = await fetch('/api/emotion/current');
        // const data = await response.json();
        
        // For demo purposes, use placeholder data
        setCurrentEmotion('focused');
      } catch (error) {
        console.error('Error fetching current emotion:', error);
      }
    };

    fetchUserData();
    fetchCurrentEmotion();
  }, []);

  const handleConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <Head>
        <title>Terminal - Astra</title>
        <meta name="description" content="Terminal access for Astra" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout currentEmotion={currentEmotion}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Terminal</h1>
          
          {showConfirmation ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Terminal Access Warning</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      The terminal provides direct access to the server environment. 
                      This is a powerful feature that should be used with caution. 
                      Any commands executed here will run directly on the server.
                    </p>
                    <p className="mt-2">
                      Some commands and operations may be restricted for security reasons. 
                      Do not attempt to exceed your permissions or modify system files 
                      unless you know what you're doing.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={handleConfirmation}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        I understand, proceed to terminal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Terminal userId={userId} />
          )}
        </div>
      </Layout>
    </>
  );
}
