// client/components/Terminal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  userId: string;
}

const Terminal: React.FC<TerminalProps> = ({ userId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [terminal, setTerminal] = useState<XTerm | null>(null);

  // Initialize terminal
  useEffect(() => {
    // Check if user is authorized to use terminal
    const checkAuthorization = async () => {
      try {
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/terminal/authorize');
        // const data = await response.json();
        // setIsAuthorized(data.authorized);
        
        // For demo purposes, always authorize
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking terminal authorization:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [userId]);

  // Setup terminal when authorized
  useEffect(() => {
    if (!isAuthorized || !terminalRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#f0f0f0',
        cursor: '#ffffff',
        selection: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#d0d0d0',
        brightBlack: '#808080',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff',
      },
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
    });

    // Add fit addon to ensure terminal fills container
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Open terminal in the container
    term.open(terminalRef.current);
    fitAddon.fit();

    // Setup WebSocket connection
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/terminal/socket`);

    ws.onopen = () => {
      setIsConnected(true);
      term.writeln('Connected to terminal server');
      term.writeln('Type "help" for a list of available commands');
      term.writeln('');
      term.focus();
    };

    ws.onclose = () => {
      setIsConnected(false);
      term.writeln('\r\nDisconnected from terminal server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      term.writeln('\r\nError connecting to terminal server');
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    // Send terminal input to server
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize events
    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        const { rows, cols } = term;
        ws.send(JSON.stringify({ type: 'resize', rows, cols }));
      }
    };

    window.addEventListener('resize', handleResize);

    // Store terminal and socket in state
    setTerminal(term);
    setSocket(ws);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthorized]);

  // Warning dialog for unauthorized users
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Terminal Access Restricted</h3>
          <p className="text-gray-600">
            You do not have permission to use the terminal. Please contact an administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Terminal header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center rounded-t-lg">
        <div className="text-sm font-medium">Terminal</div>
        <div className="flex space-x-1">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>
      
      {/* Terminal container */}
      <div 
        ref={terminalRef} 
        className="h-96 bg-gray-900 rounded-b-lg overflow-hidden"
      ></div>
      
      {/* Terminal info */}
      <div className="mt-2 text-xs text-gray-500">
        <p>
          Type 'clear' to clear the terminal. Use 'exit' to terminate the session.
        </p>
        <p>
          This terminal has limited permissions for security reasons. Some system commands may be restricted.
        </p>
      </div>
    </div>
  );
};

export default Terminal;
