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
      analytics_events: {
        Row: {
          created_at: string
          event_name: string | null
          event_type: string
          gclid: string | null
          id: string
          metadata: Json | null
          page_path: string | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          event_name?: string | null
          event_type: string
          gclid?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string | null
          event_type?: string
          gclid?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      blocked_emails: {
        Row: {
          created_at: string
          email_normalized: string
          id: string
          source_lead_id: string | null
        }
        Insert: {
          created_at?: string
          email_normalized: string
          id?: string
          source_lead_id?: string | null
        }
        Update: {
          created_at?: string
          email_normalized?: string
          id?: string
          source_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_emails_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_phones: {
        Row: {
          created_at: string
          id: string
          phone_normalized: string
          source_lead_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          phone_normalized: string
          source_lead_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phone_normalized?: string
          source_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_phones_source_lead_id_fkey"
            columns: ["source_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          ai_enriched_data: Json | null
          buyer_id: string | null
          company_description: string | null
          created_at: string | null
          id: string
          license_number: string | null
          logo_url: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          ai_enriched_data?: Json | null
          buyer_id?: string | null
          company_description?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          ai_enriched_data?: Json | null
          buyer_id?: string | null
          company_description?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          logo_url?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: true
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
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
      homeowner_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          linked_lead_ids: string[] | null
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          linked_lead_ids?: string[] | null
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          linked_lead_ids?: string[] | null
          phone?: string | null
          user_id?: string
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
      lead_feedback: {
        Row: {
          created_at: string
          hired_plumber: boolean | null
          id: string
          lead_id: string
          rating: number | null
          review_text: string | null
          submitted_at: string | null
          token: string
        }
        Insert: {
          created_at?: string
          hired_plumber?: boolean | null
          id?: string
          lead_id: string
          rating?: number | null
          review_text?: string | null
          submitted_at?: string | null
          token: string
        }
        Update: {
          created_at?: string
          hired_plumber?: boolean | null
          id?: string
          lead_id?: string
          rating?: number | null
          review_text?: string | null
          submitted_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_feedback_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_nurture_emails: {
        Row: {
          created_at: string
          email_type: string
          id: string
          lead_id: string
          scheduled_at: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          lead_id: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          lead_id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_nurture_emails_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_authenticity_reason: string | null
          ai_authenticity_score: number | null
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
          ai_authenticity_reason?: string | null
          ai_authenticity_score?: number | null
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
          ai_authenticity_reason?: string | null
          ai_authenticity_score?: number | null
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
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          thumbnail_url: string | null
          title: string | null
          type: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      post_metrics: {
        Row: {
          id: number
          ip_hash: string | null
          post_id: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: never
          ip_hash?: string | null
          post_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: never
          ip_hash?: string | null
          post_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_versions: {
        Row: {
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          post_id: string
          saved_by: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          post_id: string
          saved_by?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          post_id?: string
          saved_by?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          canonical_url: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          external_id: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_height: number | null
          og_image_width: number | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          source: string
          status: string
          tags: string[] | null
          title: string
          twitter_card_type: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          external_id?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_height?: number | null
          og_image_width?: number | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          source?: string
          status?: string
          tags?: string[] | null
          title: string
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          external_id?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_height?: number | null
          og_image_width?: number | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          source?: string
          status?: string
          tags?: string[] | null
          title?: string
          twitter_card_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string | null
          buyer_responded_at: string | null
          buyer_response: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          lead_id: string | null
          rating: number
          review_text: string | null
          reviewer_user_id: string
        }
        Insert: {
          buyer_id?: string | null
          buyer_responded_at?: string | null
          buyer_response?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          lead_id?: string | null
          rating: number
          review_text?: string | null
          reviewer_user_id: string
        }
        Update: {
          buyer_id?: string | null
          buyer_responded_at?: string | null
          buyer_response?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          lead_id?: string | null
          rating?: number
          review_text?: string | null
          reviewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
