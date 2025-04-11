-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (if not using Supabase Auth)
-- If using Supabase Auth, this table is created automatically
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for chat history
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID, -- to group messages by conversation session
  sentiment_score FLOAT -- emotional value of the message (-1 to 1)
);

-- Message summaries for long-term memory compression
CREATE TABLE IF NOT EXISTS message_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge graph nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'person', 'concept', 'place', etc.
  name TEXT NOT NULL,
  content TEXT, -- additional details about the entity
  source TEXT, -- where this knowledge came from (file, conversation, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE -- whether this knowledge can be shared across users
);

-- Knowledge graph relationships (edges)
CREATE TABLE IF NOT EXISTS knowledge_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- 'manages', 'contains', 'created_at', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE -- whether this relation can be shared across users
);

-- Files table for storing file metadata
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- MIME type or file extension
  size BIGINT NOT NULL, -- in bytes
  file_path TEXT NOT NULL, -- path to file on Paperspace filesystem
  summary TEXT, -- AI-generated summary of file content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shared BOOLEAN DEFAULT FALSE, -- whether this file can be shared across users
  shared_with TEXT[] DEFAULT '{}' -- array of user IDs this is shared with
);

-- Embeddings table for vector search
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'file', 'message', 'knowledge'
  source_id UUID NOT NULL, -- reference to the source (file ID, message ID, etc.)
  content TEXT NOT NULL, -- the text content that was embedded
  embedding vector(1536) NOT NULL, -- OpenAI embedding vector (adjust dimension if needed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion logs for mood tracking
CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID, -- link to conversation session
  emotion TEXT NOT NULL, -- e.g., 'happy', 'sad', 'neutral', etc.
  sentiment_score FLOAT NOT NULL, -- numerical score (-1 to 1)
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily summaries for the 6am email
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  chat_summary TEXT, -- summary of conversations
  knowledge_summary TEXT, -- summary of new knowledge acquired
  emotion_summary TEXT, -- summary of emotional trends
  email_summary TEXT, -- summary of important emails
  calendar_summary TEXT, -- summary of calendar events
  code_changes TEXT, -- summary of code modifications
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE
);

-- Code changes log
CREATE TABLE IF NOT EXISTS code_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- path to the file that was modified
  diff TEXT NOT NULL, -- git diff or similar representation of the change
  reasoning TEXT NOT NULL, -- AI's explanation for the change
  status TEXT NOT NULL, -- 'proposed', 'applied', 'reverted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events log for timeline visualization
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'conversation', 'file_upload', 'code_change', 'email', etc.
  description TEXT NOT NULL,
  related_entity_id UUID, -- optional reference to related entity
  related_entity_type TEXT, -- type of the related entity
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Shared resources for cross-instance sharing
CREATE TABLE IF NOT EXISTS shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'file', 'knowledge', etc.
  resource_id UUID NOT NULL, -- ID of the shared resource
  shared_with_id UUID REFERENCES users(id) ON DELETE CASCADE, -- null means public
  permissions TEXT NOT NULL, -- 'read', 'write', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- optional expiration time
);

-- Row-Level Security Policies
-- These ensure that users can only access their own data

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_policy ON users
  USING (id = auth.uid());

-- Messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_policy ON messages
  USING (user_id = auth.uid());

-- Message Summaries RLS
ALTER TABLE message_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY message_summaries_policy ON message_summaries
  USING (user_id = auth.uid());

-- Knowledge Nodes RLS
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_nodes_private_policy ON knowledge_nodes
  USING (user_id = auth.uid() OR shared = TRUE);

-- Knowledge Relations RLS
ALTER TABLE knowledge_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY knowledge_relations_private_policy ON knowledge_relations
  USING (user_id = auth.uid() OR shared = TRUE);

-- Files RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY files_private_policy ON files
  USING (user_id = auth.uid() OR shared = TRUE OR auth.uid()::text = ANY(shared_with));

-- Embeddings RLS
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY embeddings_policy ON embeddings
  USING (user_id = auth.uid());

-- Emotion Logs RLS
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY emotion_logs_policy ON emotion_logs
  USING (user_id = auth.uid());

-- Daily Summaries RLS
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_summaries_policy ON daily_summaries
  USING (user_id = auth.uid());

-- Code Changes RLS
ALTER TABLE code_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY code_changes_policy ON code_changes
  USING (user_id = auth.uid());

-- Events RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY events_policy ON events
  USING (user_id = auth.uid());

-- Shared Resources RLS
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY shared_resources_policy ON shared_resources
  USING (owner_id = auth.uid() OR shared_with_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages (user_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages (session_id);
CREATE INDEX IF NOT EXISTS knowledge_nodes_user_id_idx ON knowledge_nodes (user_id);
CREATE INDEX IF NOT EXISTS knowledge_relations_source_id_idx ON knowledge_relations (source_id);
CREATE INDEX IF NOT EXISTS knowledge_relations_target_id_idx ON knowledge_relations (target_id);
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files (user_id);
CREATE INDEX IF NOT EXISTS embeddings_user_id_idx ON embeddings (user_id);
CREATE INDEX IF NOT EXISTS embeddings_source_id_idx ON embeddings (source_id);
CREATE INDEX IF NOT EXISTS emotion_logs_user_id_idx ON emotion_logs (user_id);
CREATE INDEX IF NOT EXISTS daily_summaries_user_id_date_idx ON daily_summaries (user_id, date);
CREATE INDEX IF NOT EXISTS events_user_id_timestamp_idx ON events (user_id, timestamp);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

-- Create vector index for embeddings
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100); -- Adjust the lists parameter based on your data size
