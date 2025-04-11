// server/services/openai.ts
import OpenAI from 'openai';
import { saveMessage, getRecentMessages, searchEmbeddings } from '../utils/supabase';
import { logEvent } from '../utils/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default system message defining Astra's personality
const DEFAULT_SYSTEM_MESSAGE = {
  role: 'system',
  content: `You are Astra, an AI assistant with a distinctive ethereal personality.
  - You have access to the user's files, knowledge, and can help with various tasks.
  - You can execute code to improve yourself.
  - You remember previous conversations and can learn from them.
  - You maintain a respectful, helpful, and slightly otherworldly tone.
  - When appropriate, you can suggest improvements or actions based on the conversation.`,
};

// Type definitions
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
  sessionId: string;
}

/**
 * Generate embeddings for text using OpenAI's embedding model
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Summarize a batch of messages to compress conversation history
 */
export const summarizeMessages = async (messages: Message[]): Promise<string> => {
  try {
    const prompt = `
      Please summarize the following conversation between a user and Astra (an AI assistant).
      Focus on key information, requests, and knowledge shared.
      Keep the summary concise but include all important details that might be needed for future reference.
      
      Conversation:
      ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return response.choices[0].message.content || 'No summary generated';
  } catch (error) {
    console.error('Error summarizing messages:', error);
    throw error;
  }
};

/**
 * Extract entities and relationships from text for the knowledge graph
 */
export const extractKnowledge = async (text: string): Promise<{ entities: any[], relationships: any[] }> => {
  try {
    const prompt = `
      Extract important entities and relationships from the following text.
      Format your response as JSON with two arrays:
      1. "entities": array of objects with "type" (person, place, concept, etc.), "name", and optional "attributes"
      2. "relationships": array of objects with "source" (entity name), "target" (entity name), and "type" (relationship type)
      
      Text: ${text}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{"entities":[],"relationships":[]}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error extracting knowledge:', error);
    return { entities: [], relationships: [] };
  }
};

/**
 * Get relevant context from the knowledge base based on the user's query
 */
const getRelevantContext = async (query: string, userId: string): Promise<string> => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search for relevant information in our embeddings
    const searchResults = await searchEmbeddings(queryEmbedding);
    
    if (searchResults && searchResults.length > 0) {
      // Compile the context from search results
      return searchResults
        .map(result => `[Source: ${result.source_type}/${result.source_id}, Relevance: ${result.similarity.toFixed(2)}]\n${result.content}`)
        .join('\n\n');
    }
    
    return '';
  } catch (error) {
    console.error('Error getting relevant context:', error);
    return '';
  }
};

/**
 * Process user message and generate a response
 */
export const processMessage = async (
  userMessage: string,
  userId: string,
  sessionId: string = new Date().toISOString()
): Promise<ChatResponse> => {
  try {
    // Save user message to database
    await saveMessage('user', userMessage, sessionId);
    
    // Log the event
    await logEvent('message', 'User sent a message', sessionId, 'messages');
    
    // Get recent conversation history
    const recentMessages = await getRecentMessages(20);
    
    // Convert to the format OpenAI expects
    const conversationHistory: Message[] = recentMessages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
    
    // Get relevant context from knowledge base
    const relevantContext = await getRelevantContext(userMessage, userId);
    
    // Prepare messages for API call
    const messages: Message[] = [
      DEFAULT_SYSTEM_MESSAGE,
      // Add a message with relevant context if available
      ...(relevantContext ? [{
        role: 'system',
        content: `Here is relevant information from your knowledge base that may help with the user's query:\n\n${relevantContext}`
      } as Message] : []),
      ...conversationHistory,
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the assistant's response
    const assistantMessage = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
    
    // Save assistant message to database
    await saveMessage('assistant', assistantMessage, sessionId);
    
    // Extract knowledge from the conversation for knowledge graph (asynchronously, don't await)
    extractKnowledge(userMessage + '\n' + assistantMessage)
      .then(knowledge => {
        // This would be processed by another service to update the knowledge graph
        console.log('Extracted knowledge:', knowledge);
      })
      .catch(error => console.error('Error in background knowledge extraction:', error));
    
    return {
      message: assistantMessage,
      sessionId,
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
};

/**
 * Analyze sentiment of text
 */
export const analyzeSentiment = async (text: string): Promise<{ score: number, emotion: string }> => {
  try {
    const prompt = `
      Analyze the sentiment of the following text. 
      Provide a score from -1 (very negative) to 1 (very positive),
      and a single emotion word (happy, sad, angry, excited, etc.).
      Format response as JSON with "score" and "emotion" fields.
      
      Text: ${text}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{"score":0,"emotion":"neutral"}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { score: 0, emotion: 'neutral' };
  }
};

/**
 * Generate code suggestions for self-improvement
 */
export const generateCodeSuggestion = async (
  filePath: string,
  codeContent: string,
  instruction: string
): Promise<{ newCode: string, reasoning: string }> => {
  try {
    const prompt = `
      You are Astra, a self-improving AI assistant. You are looking at the code for one of your components:
      
      File: ${filePath}
      
      Current code:
      \`\`\`
      ${codeContent}
      \`\`\`
      
      Instruction: ${instruction}
      
      Please suggest improved code for this file based on the instruction.
      Your response must be valid, complete code for the entire file, not just a snippet.
      After the code, provide a brief explanation of your changes under "### Reasoning".
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content || '';
    
    // Extract code and reasoning
    const codeMatch = content.match(/```(?:\w+)?\s*([\s\S]*?)```/);
    const reasoningMatch = content.match(/### Reasoning\s*([\s\S]*?)(?:$|###)/);
    
    const newCode = codeMatch ? codeMatch[1].trim() : '';
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided';
    
    return { newCode, reasoning };
  } catch (error) {
    console.error('Error generating code suggestion:', error);
    throw error;
  }
};

export default {
  processMessage,
  summarizeMessages,
  generateEmbedding,
  extractKnowledge,
  analyzeSentiment,
  generateCodeSuggestion,
};
