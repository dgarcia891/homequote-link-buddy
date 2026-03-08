export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          business_name: string
          contact_name: string
          created_at: string
          daily_lead_cap: number | null
          email: string
          id: string
          is_active: boolean
          notes: string | null
          phone: string
          service_areas: string[] | null
          supported_service_types: string[] | null
          updated_at: string
          vertical: string
        }
        Insert: {
          business_name: string
          contact_name: string
          created_at?: string
          daily_lead_cap?: number | null
          email: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone: string
          service_areas?: string[] | null
          supported_service_types?: string[] | null
          updated_at?: string
          vertical?: string
        }
        Update: {
          business_name?: string
          contact_name?: string
          created_at?: string
          daily_lead_cap?: number | null
          email?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string
          service_areas?: string[] | null
          supported_service_types?: string[] | null
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          event_detail: string | null
          event_type: string
          id: string
          lead_id: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          event_detail?: string | null
          event_type: string
          id?: string
          lead_id: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          event_detail?: string | null
          event_type?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_buyer_id: string | null
          city: string | null
          consent_to_contact: boolean
          created_at: string
          description: string | null
          duplicate_flag: boolean
          email: string | null
          email_normalized: string | null
          full_name: string | null
          gclid: string | null
          id: string
          is_test: boolean
          landing_page: string | null
          lead_score: number | null
          notes: string | null
          phone: string
          phone_normalized: string | null
          preferred_contact_method: string
          referrer: string | null
          review_reason: string | null
          service_type: string | null
          source: string | null
          spam_flag: boolean
          status: string
          updated_at: string
          urgency: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          vertical: string
          zip_code: string | null
        }
        Insert: {
          assigned_buyer_id?: string | null
          city?: string | null
          consent_to_contact?: boolean
          created_at?: string
          description?: string | null
          duplicate_flag?: boolean
          email?: string | null
          email_normalized?: string | null
          full_name?: string | null
          gclid?: string | null
          id?: string
          is_test?: boolean
          landing_page?: string | null
          lead_score?: number | null
          notes?: string | null
          phone: string
          phone_normalized?: string | null
          preferred_contact_method?: string
          referrer?: string | null
          review_reason?: string | null
          service_type?: string | null
          source?: string | null
          spam_flag?: boolean
          status?: string
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vertical?: string
          zip_code?: string | null
        }
        Update: {
          assigned_buyer_id?: string | null
          city?: string | null
          consent_to_contact?: boolean
          created_at?: string
          description?: string | null
          duplicate_flag?: boolean
          email?: string | null
          email_normalized?: string | null
          full_name?: string | null
          gclid?: string | null
          id?: string
          is_test?: boolean
          landing_page?: string | null
          lead_score?: number | null
          notes?: string | null
          phone?: string
          phone_normalized?: string | null
          preferred_contact_method?: string
          referrer?: string | null
          review_reason?: string | null
          service_type?: string | null
          source?: string | null
          spam_flag?: boolean
          status?: string
          updated_at?: string
          urgency?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vertical?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_buyer_id_fkey"
            columns: ["assigned_buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          excerpt: string | null
          external_id: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          excerpt?: string | null
          external_id?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          excerpt?: string | null
          external_id?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      routing_settings: {
        Row: {
          after_hours_behavior: string | null
          business_hours: Json | null
          buyer_id: string
          city: string
          created_at: string
          id: string
          is_active: boolean
          max_daily_leads: number | null
          service_type: string
          updated_at: string
          vertical: string
        }
        Insert: {
          after_hours_behavior?: string | null
          business_hours?: Json | null
          buyer_id: string
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_daily_leads?: number | null
          service_type: string
          updated_at?: string
          vertical?: string
        }
        Update: {
          after_hours_behavior?: string | null
          business_hours?: Json | null
          buyer_id?: string
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_daily_leads?: number | null
          service_type?: string
          updated_at?: string
          vertical?: string
        }
        Relationships: [
          {
            foreignKeyName: "routing_settings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
