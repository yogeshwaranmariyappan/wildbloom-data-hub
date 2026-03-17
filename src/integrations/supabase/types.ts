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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      habitats: {
        Row: {
          area_hectares: number | null
          biodiversity_index: number | null
          created_at: string
          description: string | null
          habitat_type: string
          id: string
          location: string
          name: string
          threat_level: string
        }
        Insert: {
          area_hectares?: number | null
          biodiversity_index?: number | null
          created_at?: string
          description?: string | null
          habitat_type: string
          id?: string
          location: string
          name: string
          threat_level?: string
        }
        Update: {
          area_hectares?: number | null
          biodiversity_index?: number | null
          created_at?: string
          description?: string | null
          habitat_type?: string
          id?: string
          location?: string
          name?: string
          threat_level?: string
        }
        Relationships: []
      }
      observations: {
        Row: {
          created_at: string
          habitat_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          observation_date: string
          observer_name: string
          quantity: number
          species_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          habitat_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          observation_date?: string
          observer_name: string
          quantity?: number
          species_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          habitat_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          observation_date?: string
          observer_name?: string
          quantity?: number
          species_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_habitat_id_fkey"
            columns: ["habitat_id"]
            isOneToOne: false
            referencedRelation: "habitats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
        ]
      }
      researchers: {
        Row: {
          active_surveys: number
          created_at: string
          email: string
          field_experience_years: number
          id: string
          institution: string
          name: string
          specialization: string
        }
        Insert: {
          active_surveys?: number
          created_at?: string
          email: string
          field_experience_years?: number
          id?: string
          institution: string
          name: string
          specialization: string
        }
        Update: {
          active_surveys?: number
          created_at?: string
          email?: string
          field_experience_years?: number
          id?: string
          institution?: string
          name?: string
          specialization?: string
        }
        Relationships: []
      }
      species: {
        Row: {
          common_name: string
          conservation_status: string
          created_at: string
          description: string | null
          id: string
          kingdom: string
          population_estimate: number | null
          scientific_name: string
        }
        Insert: {
          common_name: string
          conservation_status?: string
          created_at?: string
          description?: string | null
          id?: string
          kingdom?: string
          population_estimate?: number | null
          scientific_name: string
        }
        Update: {
          common_name?: string
          conservation_status?: string
          created_at?: string
          description?: string | null
          id?: string
          kingdom?: string
          population_estimate?: number | null
          scientific_name?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          created_at: string
          end_date: string | null
          habitat_id: string | null
          id: string
          lead_researcher: string
          methodology: string | null
          species_count: number
          start_date: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          habitat_id?: string | null
          id?: string
          lead_researcher: string
          methodology?: string | null
          species_count?: number
          start_date?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          habitat_id?: string | null
          id?: string
          lead_researcher?: string
          methodology?: string | null
          species_count?: number
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_habitat_id_fkey"
            columns: ["habitat_id"]
            isOneToOne: false
            referencedRelation: "habitats"
            referencedColumns: ["id"]
          },
        ]
      }
      threats: {
        Row: {
          affected_area: string
          category: string
          created_at: string
          description: string | null
          id: string
          mitigation_plan: string | null
          name: string
          reported_date: string
          severity: string
        }
        Insert: {
          affected_area: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          mitigation_plan?: string | null
          name: string
          reported_date?: string
          severity?: string
        }
        Update: {
          affected_area?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          mitigation_plan?: string | null
          name?: string
          reported_date?: string
          severity?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
