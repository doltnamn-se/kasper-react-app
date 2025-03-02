export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_changes: {
        Row: {
          change_count: number
          id: number
          last_updated: string | null
          major: number
          minor: number
          patch: number
        }
        Insert: {
          change_count?: number
          id?: number
          last_updated?: string | null
          major?: number
          minor?: number
          patch?: number
        }
        Update: {
          change_count?: number
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
      customers: {
        Row: {
          checklist_completed: boolean | null
          checklist_step: number | null
          completed_guides: string[] | null
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
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          in_app_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
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
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
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
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          status: Database["public"]["Enums"]["presence_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          status?: Database["public"]["Enums"]["presence_status"]
          updated_at?: string | null
          user_id?: string
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
      is_super_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
            }
            Returns: boolean
          }
      update_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
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
      presence_status: "online" | "offline"
      subscription_plan: "1_month" | "6_months" | "12_months" | "24_months"
      url_status_step:
        | "received"
        | "case_started"
        | "request_submitted"
        | "removal_approved"
      user_role: "super_admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
