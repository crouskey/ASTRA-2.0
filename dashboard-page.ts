// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../client/components/Layout';
import Dashboard from '../client/components/Dashboard';

export default function DashboardPage() {
  const [currentEmotion, setCurrentEmotion] = useState('focused');
  const [userId, setUserId] = useState('default-user');

  // In a real implementation, this would fetch user data and current state
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

  return (
    <>
      <Head>
        <title>Dashboard - Astra</title>
        <meta name="description" content="Astra's dashboard with analytics and insights" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout currentEmotion={currentEmotion}>
        <Dashboard userId={userId} />
      </Layout>
    </>
  );
}
