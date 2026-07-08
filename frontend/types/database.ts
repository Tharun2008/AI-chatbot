export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          owner_id?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: {
          role?: "owner" | "admin" | "member";
        };
      };
      whatsapp_numbers: {
        Row: {
          id: string;
          organization_id: string;
          phone_number: string;
          display_name: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          phone_number: string;
          display_name?: string | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          phone_number?: string;
          display_name?: string | null;
          is_primary?: boolean;
        };
      };
      knowledge_documents: {
        Row: {
          id: string;
          organization_id: string;
          uploaded_by: string | null;
          file_name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          status: "queued" | "processing" | "ready" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          uploaded_by?: string | null;
          file_name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: "queued" | "processing" | "ready" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          status?: "queued" | "processing" | "ready" | "failed";
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          whatsapp_number_id: string | null;
          customer_phone: string;
          customer_name: string | null;
          status: "open" | "waiting" | "resolved";
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          whatsapp_number_id?: string | null;
          customer_phone: string;
          customer_name?: string | null;
          status?: "open" | "waiting" | "resolved";
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_phone?: string;
          customer_name?: string | null;
          status?: "open" | "waiting" | "resolved";
          last_message_at?: string | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          organization_id: string;
          conversation_id: string;
          sender_type: "customer" | "assistant" | "agent" | "system";
          body: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          conversation_id: string;
          sender_type: "customer" | "assistant" | "agent" | "system";
          body: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          body?: string;
          metadata?: Json;
        };
      };
      business_settings: {
        Row: {
          organization_id: string;
          business_name: string;
          openai_api_key_encrypted: string | null;
          default_whatsapp_number_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          business_name: string;
          openai_api_key_encrypted?: string | null;
          default_whatsapp_number_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string;
          openai_api_key_encrypted?: string | null;
          default_whatsapp_number_id?: string | null;
          updated_at?: string;
        };
      };
    };
    Functions: {
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { org_id: string };
        Returns: boolean;
      };
    };
  };
};
