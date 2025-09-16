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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      company_settings: {
        Row: {
          address: string
          cnpj: string
          company_name: string
          created_at: string
          email: string
          id: string
          notifications_enabled: boolean
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string
          cnpj?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          notifications_enabled?: boolean
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string
          cnpj?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          notifications_enabled?: boolean
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_dailies: {
        Row: {
          additional_value: number | null
          created_at: string
          daily_value: number
          description: string | null
          employee_id: string
          event_id: string | null
          id: string
          service_date: string
          status: string
          updated_at: string
        }
        Insert: {
          additional_value?: number | null
          created_at?: string
          daily_value?: number
          description?: string | null
          employee_id: string
          event_id?: string | null
          id?: string
          service_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          additional_value?: number | null
          created_at?: string
          daily_value?: number
          description?: string | null
          employee_id?: string
          event_id?: string | null
          id?: string
          service_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_dailies_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_dailies_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          employee_id: string
          id: string
          payment_date: string
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
          payment_date: string
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
          payment_date?: string
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          additional_value: number | null
          created_at: string
          daily_rate: number | null
          event_name: string | null
          events_this_month: number | null
          fixed_salary: number | null
          hire_date: string | null
          id: string
          name: string
          position: string | null
          type: string
          updated_at: string
        }
        Insert: {
          additional_value?: number | null
          created_at?: string
          daily_rate?: number | null
          event_name?: string | null
          events_this_month?: number | null
          fixed_salary?: number | null
          hire_date?: string | null
          id?: string
          name: string
          position?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          additional_value?: number | null
          created_at?: string
          daily_rate?: number | null
          event_name?: string | null
          events_this_month?: number | null
          fixed_salary?: number | null
          hire_date?: string | null
          id?: string
          name?: string
          position?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          available_quantity: number
          category: string
          created_at: string
          dimensions: string
          id: string
          maintenance_quantity: number | null
          name: string
          total_quantity: number
          unavailable_quantity: number | null
          updated_at: string
          weight: number
        }
        Insert: {
          available_quantity?: number
          category: string
          created_at?: string
          dimensions: string
          id?: string
          maintenance_quantity?: number | null
          name: string
          total_quantity?: number
          unavailable_quantity?: number | null
          updated_at?: string
          weight: number
        }
        Update: {
          available_quantity?: number
          category?: string
          created_at?: string
          dimensions?: string
          id?: string
          maintenance_quantity?: number | null
          name?: string
          total_quantity?: number
          unavailable_quantity?: number | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      equipment_units: {
        Row: {
          created_at: string
          current_event_id: string | null
          equipment_id: string
          id: string
          status: string
          unit_identifier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_event_id?: string | null
          equipment_id: string
          id?: string
          status?: string
          unit_identifier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_event_id?: string | null
          equipment_id?: string
          id?: string
          status?: string
          unit_identifier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_units_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      event_equipment: {
        Row: {
          created_at: string
          equipment_unit_id: string
          event_id: string
          id: string
        }
        Insert: {
          created_at?: string
          equipment_unit_id: string
          event_id: string
          id?: string
        }
        Update: {
          created_at?: string
          equipment_unit_id?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_equipment_equipment_unit_id_fkey"
            columns: ["equipment_unit_id"]
            isOneToOne: false
            referencedRelation: "equipment_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_equipment_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_equipment_items: {
        Row: {
          created_at: string
          equipment_id: string
          event_id: string
          id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          event_id: string
          id?: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          event_id?: string
          id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          client_name: string
          created_at: string
          created_by: string | null
          event_date: string
          event_location: string
          id: string
          notes: string | null
          setup_date: string
          setup_time: string | null
          status: string
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by?: string | null
          event_date: string
          event_location: string
          id?: string
          notes?: string | null
          setup_date: string
          setup_time?: string | null
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string | null
          event_date?: string
          event_location?: string
          id?: string
          notes?: string | null
          setup_date?: string
          setup_time?: string | null
          status?: string
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_equipment_quantities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
