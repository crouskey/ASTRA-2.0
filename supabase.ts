// server/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a singleton Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to get the current user ID
export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Not authenticated');
  }
  
  return user.id;
};

// Type-safe database access functions

// Messages
export const getRecentMessages = async (limit = 50) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

export const saveMessage = async (role: 'user' | 'assistant' | 'system', content: string, sessionId?: string, sentimentScore?: number) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      role,
      content,
      session_id: sessionId,
      sentiment_score: sentimentScore
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Knowledge graph
export const getKnowledgeNodes = async (type?: string) => {
  const userId = await getCurrentUserId();
  
  let query = supabase
    .from('knowledge_nodes')
    .select('*')
    .eq('user_id', userId);
    
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const addKnowledgeNode = async (type: string, name: string, content?: string, source?: string) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('knowledge_nodes')
    .insert({
      user_id: userId,
      type,
      name,
      content,
      source
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const addKnowledgeRelation = async (sourceId: string, targetId: string, relationType: string) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('knowledge_relations')
    .insert({
      user_id: userId,
      source_id: sourceId,
      target_id: targetId,
      relation_type: relationType
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Files
export const saveFileMetadata = async (name: string, type: string, size: number, filePath: string, summary?: string) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      name,
      type,
      size,
      file_path: filePath,
      summary
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getFiles = async () => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
};

// Embeddings
export const saveEmbedding = async (sourceType: string, sourceId: string, content: string, embedding: number[]) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('embeddings')
    .insert({
      user_id: userId,
      source_type: sourceType,
      source_id: sourceId,
      content,
      embedding
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const searchEmbeddings = async (embedding: number[], limit = 5) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .rpc('match_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id: userId
    });
    
  if (error) throw error;
  return data;
};

// Emotion logs
export const logEmotion = async (emotion: string, sentimentScore: number, sessionId?: string) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('emotion_logs')
    .insert({
      user_id: userId,
      session_id: sessionId,
      emotion,
      sentiment_score: sentimentScore
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Daily summaries
export const getDailySummary = async (date: string) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "row not found"
  return data;
};

export const saveDailySummary = async (
  date: string,
  chatSummary?: string,
  knowledgeSummary?: string,
  emotionSummary?: string,
  emailSummary?: string,
  calendarSummary?: string,
  codeChanges?: string
) => {
  const userId = await getCurrentUserId();
  
  // Check if a summary already exists for this date
  const existingSummary = await getDailySummary(date);
  
  if (existingSummary) {
    // Update existing summary
    const { data, error } = await supabase
      .from('daily_summaries')
      .update({
        chat_summary: chatSummary ?? existingSummary.chat_summary,
        knowledge_summary: knowledgeSummary ?? existingSummary.knowledge_summary,
        emotion_summary: emotionSummary ?? existingSummary.emotion_summary,
        email_summary: emailSummary ?? existingSummary.email_summary,
        calendar_summary: calendarSummary ?? existingSummary.calendar_summary,
        code_changes: codeChanges ?? existingSummary.code_changes
      })
      .eq('id', existingSummary.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    // Create new summary
    const { data, error } = await supabase
      .from('daily_summaries')
      .insert({
        user_id: userId,
        date,
        chat_summary: chatSummary,
        knowledge_summary: knowledgeSummary,
        emotion_summary: emotionSummary,
        email_summary: emailSummary,
        calendar_summary: calendarSummary,
        code_changes: codeChanges
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Code changes
export const logCodeChange = async (filePath: string, diff: string, reasoning: string, status: 'proposed' | 'applied' | 'reverted' | 'rejected') => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('code_changes')
    .insert({
      user_id: userId,
      file_path: filePath,
      diff,
      reasoning,
      status
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Events log
export const logEvent = async (
  type: string,
  description: string,
  relatedEntityId?: string,
  relatedEntityType?: string,
  tags?: string[]
) => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      type,
      description,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      tags
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Shared resources
export const shareResource = async (resourceType: string, resourceId: string, sharedWithId?: string, permissions: string = 'read') => {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('shared_resources')
    .insert({
      owner_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      shared_with_id: sharedWithId,
      permissions
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
