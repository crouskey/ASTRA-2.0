// pages/settings.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../client/components/Layout';

export default function SettingsPage() {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    dailySummary: true,
    voiceEnabled: true,
    voiceId: 'default',
    maxTokens: 2000,
    temperature: 0.7,
    timezone: 'America/Los_Angeles',
  });

  // In a real implementation, this would fetch settings data
  useEffect(() => {
    // Simulate fetching settings
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        
        // This would be an API call in a real implementation
        // const response = await fetch('/api/settings');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, use placeholder data
        setFormData({
          emailNotifications: true,
          dailySummary: true,
          voiceEnabled: true,
          voiceId: 'default',
          maxTokens: 2000,
          temperature: 0.7,
          timezone: 'America/Los_Angeles',
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate getting current emotion
    const fetchCurrentEmotion = async () => {
      try {
        // This would be an API call in a real implementation
        // const response = await fetch('/api/emotion/current');
        // const data = await response.json();
        
        // For demo purposes, use placeholder data
        setCurrentEmotion('neutral');
      } catch (error) {
        console.error('Error fetching current emotion:', error);
      }
    };

    fetchSettings();
    fetchCurrentEmotion();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle range input changes
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // This would be an API call in a real implementation
      // const response = await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Available voice options
  const voiceOptions = [
    { id: 'default', name: 'Default (Neutral)' },
    { id: 'masculine', name: 'Masculine' },
    { id: 'feminine', name: 'Feminine' },
    { id: 'british', name: 'British' },
    { id: 'australian', name: 'Australian' },
  ];

  // Available timezone options
  const timezoneOptions = [
    { id: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
    { id: 'America/Denver', name: 'Mountain Time (MT)' },
    { id: 'America/Chicago', name: 'Central Time (CT)' },
    { id: 'America/New_York', name: 'Eastern Time (ET)' },
    { id: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
    { id: 'Europe/Paris', name: 'Central European Time (CET)' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time (JST)' },
    { id: 'Australia/Sydney', name: 'Australian Eastern Time (AET)' },
  ];

  return (
    <>
      <Head>
        <title>Settings - Astra</title>
        <meta name="description" content="Configure Astra settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout currentEmotion={currentEmotion}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Notifications Section */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Notifications
                  </h3>
                  <div className="mt-5">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                            Email notifications
                          </label>
                          <p className="text-gray-500">
                            Receive email notifications for important events and updates.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="dailySummary"
                            name="dailySummary"
                            type="checkbox"
                            checked={formData.dailySummary}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="dailySummary" className="font-medium text-gray-700">
                            Daily summary email
                          </label>
                          <p className="text-gray-500">
                            Receive a daily summary email at 6am with activity recap and insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Voice Settings */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Voice
                  </h3>
                  <div className="mt-5">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="voiceEnabled"
                            name="voiceEnabled"
                            type="checkbox"
                            checked={formData.voiceEnabled}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="voiceEnabled" className="font-medium text-gray-700">
                            Enable voice
                          </label>
                          <p className="text-gray-500">
                            Allow Astra to speak responses using text-to-speech.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="voiceId" className="block text-sm font-medium text-gray-700">
                          Voice Type
                        </label>
                        <select
                          id="voiceId"
                          name="voiceId"
                          value={formData.voiceId}
                          onChange={handleInputChange}
                          disabled={!formData.voiceEnabled}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:opacity-50"
                        >
                          {voiceOptions.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Settings */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    AI Behavior
                  </h3>
                  <div className="mt-5">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                          Temperature: {formData.temperature.toFixed(1)}
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          Lower values make responses more focused and deterministic. Higher values make responses more creative and varied.
                        </p>
                        <input
                          id="temperature"
                          name="temperature"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={formData.temperature}
                          onChange={handleRangeChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Focused (0.0)</span>
                          <span>Balanced (0.5)</span>
                          <span>Creative (1.0)</span>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
                          Max Response Length: {formData.maxTokens}
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          Maximum length of Astra's responses in tokens.
                        </p>
                        <input
                          id="maxTokens"
                          name="maxTokens"
                          type="range"
                          min="500"
                          max="4000"
                          step="100"
                          value={formData.maxTokens}
                          onChange={handleRangeChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Short (500)</span>
                          <span>Medium (2000)</span>
                          <span>Long (4000)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timezone Settings */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Timezone
                  </h3>
                  <div className="mt-5">
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <p className="text-sm text-gray-500 mb-2">
                        Set your timezone for scheduling and daily summary emails.
                      </p>
                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {timezoneOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Layout>
    </>
  );
}
