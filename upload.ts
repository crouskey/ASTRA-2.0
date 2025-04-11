// pages/api/files/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUserId } from '../../../server/utils/supabase';
import { processFile } from '../../../server/services/file';
import formidable from 'formidable';
import fs from 'fs';

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user ID from the session
    const userId = await getCurrentUserId();

    // Parse the form data
    const form = new formidable.IncomingForm();
    
    // Process the form and file
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Failed to parse form' });
      }
      
      // Check if a file was uploaded
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      try {
        // Read the file content
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Get file details
        const fileName = file.originalFilename || 'unnamed_file';
        const fileType = file.mimetype || 'application/octet-stream';
        
        // Process the file
        const result = await processFile(
          fileBuffer,
          fileName,
          fileType,
          userId
        );
        
        // Return the result
        return res.status(200).json({
          id: result.id,
          fileName: result.fileName,
          summary: result.summary,
        });
      } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({ error: 'Failed to process file' });
      } finally {
        // Clean up the temporary file
        if (file && file.filepath) {
          fs.unlinkSync(file.filepath);
        }
      }
    });
  } catch (error) {
    console.error('Error in file upload API:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
