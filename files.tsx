// pages/files.tsx
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../client/components/Layout';

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeFormatted: string;
  created: string;
  summary: string;
}

export default function FilesPage() {
  const [currentEmotion, setCurrentEmotion] = useState('curious');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format bytes to human-readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // In a real implementation, this would fetch files data
  useEffect(() => {
    // Simulate fetching files
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        
        // This would be an API call in a real implementation
        // const response = await fetch('/api/files');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, use placeholder data
        const mockFiles: File[] = [
          {
            id: '1',
            name: 'project-report.pdf',
            type: 'application/pdf',
            size: 2500000,
            sizeFormatted: formatBytes(2500000),
            created: new Date().toISOString(),
            summary: 'Quarterly project status report with timelines and milestones.',
          },
          {
            id: '2',
            name: 'data-analysis.xlsx',
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: 1800000,
            sizeFormatted: formatBytes(1800000),
            created: new Date().toISOString(),
            summary: 'Financial data analysis with quarterly projections and charts.',
          },
          {
            id: '3',
            name: 'meeting-notes.txt',
            type: 'text/plain',
            size: 15000,
            sizeFormatted: formatBytes(15000),
            created: new Date().toISOString(),
            summary: 'Notes from the team meeting discussing project goals and action items.',
          },
          {
            id: '4',
            name: 'presentation.pptx',
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            size: 3500000,
            sizeFormatted: formatBytes(3500000),
            created: new Date().toISOString(),
            summary: 'Investor presentation with company overview and growth metrics.',
          },
        ];
        
        setFiles(mockFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
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
        setCurrentEmotion('curious');
      } catch (error) {
        console.error('Error fetching current emotion:', error);
      }
    };

    fetchFiles();
    fetchCurrentEmotion();
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload progress (in a real implementation, this would use fetch with progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would be an API call in a real implementation
      // const response = await fetch('/api/files/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // Set progress to 100% when done
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Add the new file to the list (in a real implementation, this would use the API response)
      const newFile: File = {
        id: (files.length + 1).toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        created: new Date().toISOString(),
        summary: 'Newly uploaded file - processing content...',
      };
      
      setFiles(prev => [newFile, ...prev]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Wait a moment before hiding the progress bar
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload file. Please try again.');
    }
  };

  // Handle file click to show details
  const handleFileClick = (file: File) => {
    setActiveFile(file);
  };

  // Get the icon for a file based on its type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xlsx')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
        </svg>
      );
    } else if (type.includes('presentation') || type.includes('powerpoint') || type.includes('pptx')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
        </svg>
      );
    } else if (type.includes('text') || type.includes('txt')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <>
      <Head>
        <title>Files - Astra</title>
        <meta name="description" content="Manage and access your files with Astra" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Layout currentEmotion={currentEmotion}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Files</h1>
            
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </div>
          
          {/* Upload progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">
                {uploadProgress}%
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Files list */}
            <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your Files
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Files you've uploaded are automatically processed and learned from.
                </p>
              </div>
              
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No files uploaded yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <li
                      key={file.id}
                      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                        activeFile?.id === file.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {file.sizeFormatted} • {new Date(file.created).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* File details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  File Details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Information extracted from the selected file.
                </p>
              </div>
              
              {activeFile ? (
                <div className="p-6">
                  <div className="mb-6 flex justify-center">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {getFileIcon(activeFile.type)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-center mb-4">
                    {activeFile.name}
                  </h3>
                  
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {activeFile.type.split('/').pop()?.toUpperCase()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Size
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {activeFile.sizeFormatted}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Uploaded
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(activeFile.created).toLocaleString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Summary
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        {activeFile.summary}
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6 flex flex-col space-y-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ask Astra about this file
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Select a file to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
