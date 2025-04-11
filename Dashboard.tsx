// client/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import chart components (in a real implementation, these would be separate components)
const EmotionChart = () => (
  <div className="h-64 bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Emotional Trends</h3>
    <div className="flex items-center justify-center h-full text-gray-400">
      Emotion chart visualization goes here
    </div>
  </div>
);

const KnowledgeGraph = () => (
  <div className="h-64 bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Knowledge Graph</h3>
    <div className="flex items-center justify-center h-full text-gray-400">
      Knowledge graph visualization goes here
    </div>
  </div>
);

const Timeline = () => (
  <div className="h-64 bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Activity Timeline</h3>
    <div className="overflow-auto h-full">
      {/* Example timeline items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex mb-2">
          <div className="w-12 text-xs text-gray-500">
            {new Date().toLocaleTimeString()}
          </div>
          <div className="w-8 flex justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm">
              {i % 2 === 0
                ? 'User sent a message'
                : 'File uploaded: document.pdf'}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SystemMetrics = () => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">System Metrics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-sm text-gray-500">CPU Usage</div>
        <div className="text-xl font-semibold">32%</div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div className="h-full bg-green-500 rounded" style={{ width: '32%' }}></div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-sm text-gray-500">Memory Usage</div>
        <div className="text-xl font-semibold">45%</div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div className="h-full bg-blue-500 rounded" style={{ width: '45%' }}></div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-sm text-gray-500">Storage</div>
        <div className="text-xl font-semibold">28%</div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div className="h-full bg-purple-500 rounded" style={{ width: '28%' }}></div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <div className="text-sm text-gray-500">Network</div>
        <div className="text-xl font-semibold">12 Mbps</div>
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div className="h-full bg-yellow-500 rounded" style={{ width: '12%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const FilesList = () => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Files</h3>
    <div className="overflow-auto max-h-64">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Name</th>
            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Type</th>
            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Size</th>
            <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody>
          {['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'notes.txt', 'presentation.pptx'].map((file, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="py-2 px-4 text-sm">{file}</td>
              <td className="py-2 px-4 text-sm text-gray-500">{file.split('.').pop()}</td>
              <td className="py-2 px-4 text-sm text-gray-500">{(Math.random() * 10).toFixed(1)} MB</td>
              <td className="py-2 px-4 text-sm text-gray-500">{new Date().toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CodeChanges = () => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Code Changes</h3>
    <div className="overflow-auto max-h-64">
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-4 border-b border-gray-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium">
              server/services/{i === 1 ? 'openai.ts' : i === 2 ? 'file.ts' : 'emotion.ts'}
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {i === 1
              ? 'Improved error handling in processMessage function'
              : i === 2
              ? 'Added support for XLSX file extraction'
              : 'Optimized sentiment analysis for better accuracy'}
          </div>
          <div className="mt-2 flex">
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
              +{Math.floor(Math.random() * 20) + 5} lines
            </div>
            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              -{Math.floor(Math.random() * 10) + 2} lines
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real implementation, these would fetch data from the API
  const [systemData, setSystemData] = useState<any>(null);
  const [emotionData, setEmotionData] = useState<any>(null);
  const [filesData, setFilesData] = useState<any>(null);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [codeChangesData, setCodeChangesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, these would be API calls
        // await Promise.all([
        //   fetch('/api/metrics/system').then(res => res.json()).then(setSystemData),
        //   fetch('/api/metrics/emotion').then(res => res.json()).then(setEmotionData),
        //   fetch('/api/files').then(res => res.json()).then(setFilesData),
        //   fetch('/api/knowledge').then(res => res.json()).then(setKnowledgeData),
        //   fetch('/api/events/timeline').then(res => res.json()).then(setTimelineData),
        //   fetch('/api/code/changes').then(res => res.json()).then(setCodeChangesData),
        // ]);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set placeholder data
        setSystemData({});
        setEmotionData({});
        setFilesData({});
        setKnowledgeData({});
        setTimelineData({});
        setCodeChangesData({});
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
  // Tab content mapping
  const tabContent = {
    overview: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmotionChart />
        <KnowledgeGraph />
        <Timeline />
        <SystemMetrics />
      </div>
    ),
    files: (
      <div className="grid grid-cols-1 gap-6">
        <FilesList />
      </div>
    ),
    knowledge: (
      <div className="grid grid-cols-1 gap-6">
        <KnowledgeGraph />
      </div>
    ),
    emotions: (
      <div className="grid grid-cols-1 gap-6">
        <EmotionChart />
      </div>
    ),
    system: (
      <div className="grid grid-cols-1 gap-6">
        <SystemMetrics />
        <CodeChanges />
      </div>
    ),
    activity: (
      <div className="grid grid-cols-1 gap-6">
        <Timeline />
      </div>
    ),
  };
  
  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'files', label: 'Files' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'emotions', label: 'Emotions' },
    { id: 'system', label: 'System' },
    { id: 'activity', label: 'Activity' },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {tabContent[activeTab as keyof typeof tabContent]}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;