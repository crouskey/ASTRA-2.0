// server/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string
          session_id: string | null
          sentiment_score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          created_at?: string
          session_id?: string | null
          sentiment_score?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
          created_at?: string
          session_id?: string | null
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      message_summaries: {
        Row: {
          id: string
          user_id: string
          summary: string
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          summary: string
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          summary?: string
          start_time?: string
          end_time?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_summaries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_nodes: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          content: string | null
          source: string | null
          created_at: string
          last_accessed: string
          shared: boolean
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          content?: string | null
          source?: string | null
          created_at?: string
          last_accessed?: string
          shared?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          content?: string | null
          source?: string | null
          created_at?: string
          last_accessed?: string
          shared?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_nodes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_relations: {
        Row: {
          id: string
          user_id: string
          source_id: string
          target_id: string
          relation_type: string
          created_at: string
          shared: boolean
        }
        Insert: {
          id?: string
          user_id: string
          source_id: string
          target_id: string
          relation_type: string
          created_at?: string
          shared?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          source_id?: string
          target_id?: string
          relation_type?: string
          created_at?: string
          shared?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relations_source_id_fkey"
            columns: ["source_id"]
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relations_target_id_fkey"
            columns: ["target_id"]
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          size: number
          file_path: string
          summary: string | null
          created_at: string
          shared: boolean
          shared_with: string[]
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          size: number
          file_path: string
          summary?: string | null
          created_at?: string
          shared?: boolean
          shared_with?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          size?: number
          file_path?: string
          summary?: string | null
          created_at?: string
          shared?: boolean
          shared_with?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      embeddings: {
        Row: {
          id: string
          user_id: string
          source_type: string
          source_id: string
          content: string
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: string
          source_id: string
          content: string
          embedding: number[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: string
          source_id?: string
          content?: string
          embedding?: number[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      emotion_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          emotion: string
          sentiment_score: number
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          emotion: string
          sentiment_score: number
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          emotion?: string
          sentiment_score?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          date: string
          chat_summary: string | null
          knowledge_summary: string | null
          emotion_summary: string | null
          email_summary: string | null
          calendar_summary: string | null
          code_changes: string | null
          created_at: string
          email_sent: boolean
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          chat_summary?: string | null
          knowledge_summary?: string | null
          emotion_summary?: string | null
          email_summary?: string | null
          calendar_summary?: string | null
          code_changes?: string | null
          created_at?: string
          email_sent?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          chat_summary?: string | null
          knowledge_summary?: string | null
          emotion_summary?: string | null
          email_summary?: string | null
          calendar_summary?: string | null
          code_changes?: string | null
          created_at?: string
          email_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      code_changes: {
        Row: {
          id: string
          user_id: string
          file_path: string
          diff: string
          reasoning: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          diff: string
          reasoning: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          diff?: string
          reasoning?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_changes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          user_id: string
          type: string
          description: string
          related_entity_id: string | null
          related_entity_type: string | null
          timestamp: string
          tags: string[]
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          description: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          timestamp?: string
          tags?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          description?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          timestamp?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_resources: {
        Row: {
          id: string
          owner_id: string
          resource_type: string
          resource_id: string
          shared_with_id: string | null
          permissions: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          resource_type: string
          resource_id: string
          shared_with_id?: string | null
          permissions: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          resource_type?: string
          resource_id?: string
          shared_with_id?: string | null
          permissions?: string
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_resources_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_resources_shared_with_id_fkey"
            columns: ["shared_with_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      match_embeddings: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          user_id: string
        }
        Returns: {
          id: string
          content: string
          similarity: number
          source_id: string
          source_type: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
