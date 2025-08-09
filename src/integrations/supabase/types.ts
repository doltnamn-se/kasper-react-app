export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_changes: {
        Row: {
          change_count: number
          changelog: Json | null
          id: number
          last_updated: string | null
          major: number
          minor: number
          patch: number
        }
        Insert: {
          change_count?: number
          changelog?: Json | null
          id?: number
          last_updated?: string | null
          major?: number
          minor?: number
          patch?: number
        }
        Update: {
          change_count?: number
          changelog?: Json | null
          id?: number
          last_updated?: string | null
          major?: number
          minor?: number
          patch?: number
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          requires_subscription_plan: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          requires_subscription_plan?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          requires_subscription_plan?: string[] | null
          title?: string
        }
        Relationships: []
      }
      customer_checklist_progress: {
        Row: {
          address: string | null
          address_history: Json[] | null
          city: string | null
          completed_at: string | null
          completed_guides: string[] | null
          created_at: string
          customer_id: string
          deleted_at: string | null
          is_address_hidden: boolean | null
          password_updated: boolean | null
          personal_number: string | null
          postal_code: string | null
          removal_urls: string[] | null
          selected_sites: Database["public"]["Enums"]["hiding_site"][] | null
          street_address: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_history?: Json[] | null
          city?: string | null
          completed_at?: string | null
          completed_guides?: string[] | null
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          is_address_hidden?: boolean | null
          password_updated?: boolean | null
          personal_number?: string | null
          postal_code?: string | null
          removal_urls?: string[] | null
          selected_sites?: Database["public"]["Enums"]["hiding_site"][] | null
          street_address?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_history?: Json[] | null
          city?: string | null
          completed_at?: string | null
          completed_guides?: string[] | null
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          is_address_hidden?: boolean | null
          password_updated?: boolean | null
          personal_number?: string | null
          postal_code?: string | null
          removal_urls?: string[] | null
          selected_sites?: Database["public"]["Enums"]["hiding_site"][] | null
          street_address?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_checklist_progress_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_site_statuses: {
        Row: {
          customer_id: string
          id: string
          site_name: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          customer_id: string
          id?: string
          site_name: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          customer_id?: string
          id?: string
          site_name?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_site_statuses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          checklist_completed: boolean | null
          checklist_step: number | null
          completed_guides: string[] | null
          coupon_code: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string
          has_address_alert: boolean | null
          id: string
          identification_info: Json | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
        }
        Insert: {
          checklist_completed?: boolean | null
          checklist_step?: number | null
          completed_guides?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string
          has_address_alert?: boolean | null
          id: string
          identification_info?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Update: {
          checklist_completed?: boolean | null
          checklist_step?: number | null
          completed_guides?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string
          has_address_alert?: boolean | null
          id?: string
          identification_info?: Json | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_type: string
          id: string
          last_updated: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type: string
          id?: string
          last_updated?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string
          id?: string
          last_updated?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      hiding_preferences: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          site_name: string
          site_type: Database["public"]["Enums"]["hiding_site"] | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          site_name: string
          site_type?: Database["public"]["Enums"]["hiding_site"] | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          site_name?: string
          site_type?: Database["public"]["Enums"]["hiding_site"] | null
        }
        Relationships: [
          {
            foreignKeyName: "hiding_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      id_verifications: {
        Row: {
          created_at: string
          customer_id: string
          document_path: string | null
          id: string
          notes: string | null
          requested_by: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_path?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_path?: string | null
          id?: string
          notes?: string | null
          requested_by?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      monitoring_urls: {
        Row: {
          admin_user_id: string | null
          created_at: string
          customer_id: string
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["monitoring_url_status"]
          updated_at: string
          url: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["monitoring_url_status"]
          updated_at?: string
          url: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["monitoring_url_status"]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          in_app_notifications: boolean | null
          last_email_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          last_email_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          last_email_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          mrkoll_removal_checked_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          mrkoll_removal_checked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          mrkoll_removal_checked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_codes: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          code: string
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          code: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          code?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotional_codes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      removal_urls: {
        Row: {
          created_at: string
          current_status: Database["public"]["Enums"]["url_status_step"] | null
          customer_id: string | null
          display_in_incoming: boolean | null
          id: string
          status: string | null
          status_history: Json[] | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          current_status?: Database["public"]["Enums"]["url_status_step"] | null
          customer_id?: string | null
          display_in_incoming?: boolean | null
          id?: string
          status?: string | null
          status_history?: Json[] | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          current_status?: Database["public"]["Enums"]["url_status_step"] | null
          customer_id?: string | null
          display_in_incoming?: boolean | null
          id?: string
          status?: string | null
          status_history?: Json[] | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "removal_urls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_pricing: {
        Row: {
          created_at: string
          currency: string
          id: string
          plan: string
          price_sek: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          plan: string
          price_sek: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          plan?: string
          price_sek?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          status: Database["public"]["Enums"]["presence_status"]
          updated_at: string | null
          user_id: string
          web_device_type: Database["public"]["Enums"]["web_device_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
          user_id: string
          web_device_type?:
            | Database["public"]["Enums"]["web_device_type"]
            | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
          user_id?: string
          web_device_type?:
            | Database["public"]["Enums"]["web_device_type"]
            | null
        }
        Relationships: []
      }
      user_url_limits: {
        Row: {
          additional_urls: number
          created_at: string
          customer_id: string
        }
        Insert: {
          additional_urls?: number
          created_at?: string
          customer_id: string
        }
        Update: {
          additional_urls?: number
          created_at?: string
          customer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_url_limits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      version_logs: {
        Row: {
          changes: Json
          created_at: string
          id: string
          release_date: string
          updated_at: string
          version_string: string
        }
        Insert: {
          changes?: Json
          created_at?: string
          id?: string
          release_date?: string
          updated_at?: string
          version_string: string
        }
        Update: {
          changes?: Json
          created_at?: string
          id?: string
          release_date?: string
          updated_at?: string
          version_string?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_cache: {
        Row: {
          id: string | null
        }
        Relationships: []
      }
      user_roles_cache: {
        Row: {
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_promotional_code: {
        Args: { code_id: string; customer_id: string; code_value: string }
        Returns: undefined
      }
      can_update_site_status: {
        Args: { user_id: string; customer_id: string }
        Returns: boolean
      }
      get_promotional_codes_with_customers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      insert_promotional_codes: {
        Args: { codes: Json }
        Returns: undefined
      }
      is_super_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      request_id_verification: {
        Args: { p_customer_id: string; p_requested_by: string }
        Returns: string
      }
      test_push_notification: {
        Args: {
          user_id: string
          title: string
          message: string
          notification_type?: string
        }
        Returns: Json
      }
      update_user_password: {
        Args: { user_id: string; new_password: string }
        Returns: undefined
      }
    }
    Enums: {
      hiding_site:
        | "eniro"
        | "hitta"
        | "birthday"
        | "ratsit"
        | "merinfo"
        | "mrkoll"
        | "upplysning"
      monitoring_url_status: "pending" | "approved" | "rejected"
      presence_status: "online" | "offline" | "device_type"
      subscription_plan:
        | "1_month"
        | "6_months"
        | "12_months"
        | "24_months"
        | "3_months"
        | "personskydd_1_year"
        | "parskydd_1_year"
        | "familjeskydd_1_year"
        | "personskydd_2_years"
        | "parskydd_2_years"
        | "familjeskydd_2_years"
      url_status_step:
        | "received"
        | "case_started"
        | "request_submitted"
        | "removal_approved"
      user_role: "super_admin" | "customer"
      web_device_type: "desktop" | "mobile" | "tablet"
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
    Enums: {
      hiding_site: [
        "eniro",
        "hitta",
        "birthday",
        "ratsit",
        "merinfo",
        "mrkoll",
        "upplysning",
      ],
      monitoring_url_status: ["pending", "approved", "rejected"],
      presence_status: ["online", "offline", "device_type"],
      subscription_plan: [
        "1_month",
        "6_months",
        "12_months",
        "24_months",
        "3_months",
        "personskydd_1_year",
        "parskydd_1_year",
        "familjeskydd_1_year",
        "personskydd_2_years",
        "parskydd_2_years",
        "familjeskydd_2_years",
      ],
      url_status_step: [
        "received",
        "case_started",
        "request_submitted",
        "removal_approved",
      ],
      user_role: ["super_admin", "customer"],
      web_device_type: ["desktop", "mobile", "tablet"],
    },
  },
} as const
