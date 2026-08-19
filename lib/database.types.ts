// Hand-authored types mirroring the Supabase schema (Phase 0 migration 0001_init).
// Kept in sync manually — see the migration applied via the Supabase MCP tools.

export type ChatMessage = {
  role: "user" | "model";
  content: string;
  ts: string;
};

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          session_id: string;
          messages: ChatMessage[];
          message_count: number;
          ip_hash: string | null;
          user_agent: string | null;
          flag: "complaint" | null;
          started_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          messages?: ChatMessage[];
          message_count?: number;
          ip_hash?: string | null;
          user_agent?: string | null;
          flag?: "complaint" | null;
          started_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          session_id: string | null;
          name: string;
          phone: string;
          preferred_time: string;
          status: "new" | "contacted" | "booked" | "closed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          name: string;
          phone: string;
          preferred_time: string;
          status?: "new" | "contacted" | "booked" | "closed";
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      cache: {
        Row: {
          id: string;
          question_hash: string;
          question_text: string;
          answer: string;
          source: "llm" | "intercept";
          hits: number;
          created_at: string;
          last_hit_at: string;
        };
        Insert: {
          id?: string;
          question_hash: string;
          question_text: string;
          answer: string;
          source?: "llm" | "intercept";
          hits?: number;
          created_at?: string;
          last_hit_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cache"]["Insert"]>;
        Relationships: [];
      };
      rate_limit_counters: {
        Row: {
          id: string;
          scope: "ip" | "global";
          scope_key: string;
          day: string;
          count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scope: "ip" | "global";
          scope_key: string;
          day?: string;
          count?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rate_limit_counters"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_rate_limit: {
        Args: { p_scope: string; p_scope_key: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
