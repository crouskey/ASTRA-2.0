// server/services/file.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveFileMetadata, 
  saveEmbedding,
  logEvent 
} from '../utils/supabase';
import { generateEmbedding } from './openai';
import { processTextForKnowledge } from './knowledge';

// File storage directory
const FILE_STORAGE_DIR = path.join(process.cwd(), 'storage', 'files');

// Make sure the storage directory exists
if (!fs.existsSync(FILE_STORAGE_DIR)) {
  fs.mkdirSync(FILE_STORAGE_DIR, { recursive: true });
}

/**
 * Process and store an uploaded file
 */
export const processFile = async (
  file: Buffer,
  fileName: string,
  fileType: string,
  userId: string
): Promise<{
  id: string;
  fileName: string;
  filePath: string;
  summary?: string;
}> => {
  try {
    // Generate a unique ID for the file
    const fileId = uuidv4();
    const fileExtension = path.extname(fileName);
    const sanitizedFileName = path.basename(fileName, fileExtension).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const storedFileName = `${sanitizedFileName}_${fileId}${fileExtension}`;
    const filePath = path.join(FILE_STORAGE_DIR, storedFileName);
    
    // Save the file to disk
    fs.writeFileSync(filePath, file);
    
    // Get the file size
    const fileSize = fs.statSync(filePath).size;
    
    // Extract text content from the file
    const textContent = await extractTextFromFile(filePath, fileType);
    
    // Generate a summary of the file
    const summary = await summarizeText(textContent);
    
    // Store file metadata in the database
    const fileRecord = await saveFileMetadata(
      fileName,
      fileType,
      fileSize,
      filePath,
      summary
    );
    
    // Generate embeddings for text chunks
    const textChunks = chunkText(textContent);
    
    // Process each chunk for embeddings and knowledge extraction
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      
      // Generate embedding for this chunk
      const embedding = await generateEmbedding(chunk);
      
      // Save the embedding with reference to the file
      await saveEmbedding(
        'file',
        fileRecord.id,
        chunk,
        embedding
      );
      
      // Process the text for knowledge extraction
      await processTextForKnowledge(
        chunk,
        `file:${fileName}#chunk${i}`,
        userId
      );
    }
    
    // Log the file ingestion event
    await logEvent(
      'file_upload',
      `Processed file: ${fileName}`,
      fileRecord.id,
      'file',
      ['upload', fileType]
    );
    
    return {
      id: fileRecord.id,
      fileName,
      filePath,
      summary,
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

/**
 * Extract text content from various file types
 */
const extractTextFromFile = async (
  filePath: string,
  fileType: string
): Promise<string> => {
  try {
    // In a real implementation, this would use different libraries based on file type
    // For example, pdf.js for PDFs, docx for Word documents, etc.
    
    // For simplicity, we'll just read text files directly
    // In a full implementation, you would add cases for PDF, DOCX, XLSX, etc.
    switch (fileType.toLowerCase()) {
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf-8');
        
      case 'application/pdf':
        // Placeholder for PDF extraction
        // In a real implementation, you would use a library like pdf.js
        console.log('PDF extraction not implemented in this example');
        return `Content from PDF file: ${path.basename(filePath)}`;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // Placeholder for DOCX extraction
        // In a real implementation, you would use a library like docx
        console.log('DOCX extraction not implemented in this example');
        return `Content from Word document: ${path.basename(filePath)}`;
        
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        // Placeholder for XLSX extraction
        // In a real implementation, you would use a library like xlsx
        console.log('XLSX extraction not implemented in this example');
        return `Content from Excel spreadsheet: ${path.basename(filePath)}`;
        
      case 'audio/mpeg':
      case 'audio/wav':
      case 'audio/mp4':
        // Placeholder for audio transcription
        // In a real implementation, you would use a service like ElevenLabs
        console.log('Audio transcription not implemented in this example');
        return `Transcript from audio file: ${path.basename(filePath)}`;
        
      case 'video/mp4':
        // Placeholder for video transcription
        // In a real implementation, you would extract audio and transcribe it
        console.log('Video transcription not implemented in this example');
        return `Transcript from video file: ${path.basename(filePath)}`;
        
      default:
        console.warn(`No extraction method for file type: ${fileType}`);
        return `Content from unsupported file type: ${path.basename(filePath)}`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
};

/**
 * Split text into manageable chunks for embedding
 */
const chunkText = (text: string, maxChunkSize: number = 8000): string[] => {
  if (!text || text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by paragraphs first to maintain context
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the chunk size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      
      // If the paragraph itself is too long, split it further
      if (paragraph.length > maxChunkSize) {
        const sentencesInParagraph = paragraph.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentencesInParagraph) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk);
              currentChunk = '';
            }
            
            // If the sentence is still too long, split by chunks directly
            if (sentence.length > maxChunkSize) {
              let i = 0;
              while (i < sentence.length) {
                chunks.push(sentence.slice(i, i + maxChunkSize));
                i += maxChunkSize;
              }
            } else {
              currentChunk = sentence;
            }
          } else {
            currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
          }
        }
      } else {
        // Start a new chunk with this paragraph
        currentChunk = paragraph;
      }
    } else {
      // Add this paragraph to the current chunk
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + paragraph;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

/**
 * Generate a summary for text content
 */
const summarizeText = async (text: string): Promise<string> => {
  // In a real implementation, this would use OpenAI's GPT to summarize the text
  // For simplicity, we'll return a placeholder
  // You would implement this using the OpenAI service
  
  if (!text || text.length === 0) {
    return 'No content to summarize';
  }
  
  const preview = text.slice(0, 100).trim();
  return `File contains text starting with: "${preview}${text.length > 100 ? '...' : ''}"`;
};

/**
 * Search for files based on query text
 */
export const searchFiles = async (
  query: string,
  userId: string,
  limit: number = 5
): Promise<any[]> => {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // This would use Supabase's pgvector extension to find similar content
    // For simplicity, returning a placeholder
    return [];
  } catch (error) {
    console.error('Error searching files:', error);
    throw error;
  }
};

export default {
  processFile,
  searchFiles,
};
