// pages/api/terminal/socket.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { getCurrentUserId } from '../../../server/utils/supabase';
import { logEvent } from '../../../server/utils/supabase';
import * as pty from 'node-pty';
import os from 'os';

// Extend the NextApiRequest type to include socket.io properties
interface SocketNextApiRequest extends NextApiRequest {
  socket: {
    server: any;
  };
}

// Setup WebSocket handler
export default async function handler(
  req: SocketNextApiRequest,
  res: NextApiResponse
) {
  // Check if this is a WebSocket request
  if (!req.socket.server.io) {
    console.log('Initializing socket.io server...');
    
    // Create a new socket.io server
    const io = new Server(req.socket.server, {
      path: '/api/terminal/socket',
    });
    
    // Store the socket.io server on the request object
    req.socket.server.io = io;
    
    // Handle socket connections
    io.on('connection', async (socket) => {
      try {
        // Authenticate the user
        // In a real implementation, this would use a token from the request
        const userId = 'demo-user'; // Placeholder
        
        // Log the connection
        await logEvent(
          'terminal_connection',
          `User connected to terminal`,
          socket.id,
          'terminal',
          ['terminal', 'connect']
        );
        
        console.log(`User ${userId} connected to terminal, socket ID: ${socket.id}`);
        
        // Determine shell to use based on OS
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        
        // Create terminal process
        const term = pty.spawn(shell, [], {
          name: 'xterm-color',
          cwd: process.cwd(), // Start in project directory
          env: process.env,
        });
        
        // Forward terminal output to the client
        term.onData((data) => {
          socket.emit('output', data);
        });
        
        // Handle client input
        socket.on('input', (data) => {
          term.write(data);
          
          // Log command execution (for sensitive commands only)
          if (data.includes('rm -rf') || data.includes('sudo') || data.includes('chmod')) {
            logEvent(
              'terminal_command',
              `Executed sensitive command: ${data.trim()}`,
              socket.id,
              'terminal',
              ['terminal', 'command', 'sensitive']
            ).catch(console.error);
          }
        });
        
        // Handle terminal resize
        socket.on('resize', (data) => {
          try {
            const { rows, cols } = data;
            term.resize(cols, rows);
          } catch (error) {
            console.error('Error resizing terminal:', error);
          }
        });
        
        // Handle client disconnect
        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected from terminal`);
          
          // Kill the terminal process
          term.kill();
          
          // Log the disconnection
          logEvent(
            'terminal_disconnection',
            `User disconnected from terminal`,
            socket.id,
            'terminal',
            ['terminal', 'disconnect']
          ).catch(console.error);
        });
      } catch (error) {
        console.error('Error setting up terminal connection:', error);
        socket.emit('error', 'Failed to initialize terminal session');
        socket.disconnect(true);
      }
    });
  }
  
  // Return OK response
  res.end();
}

// Configure Next.js to handle WebSocket connections
export const config = {
  api: {
    bodyParser: false,
  },
};
