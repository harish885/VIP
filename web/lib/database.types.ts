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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      [_ in never]: never
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
  vip: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          distinctive_assets: string | null
          id: string
          lifecycle_stage: string | null
          ma_exit_history: string | null
          nace_code: string | null
          name: string
          province: string | null
          sector: string | null
          stated_objective: string | null
          tax_code: string | null
          time_horizon: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          distinctive_assets?: string | null
          id?: string
          lifecycle_stage?: string | null
          ma_exit_history?: string | null
          nace_code?: string | null
          tax_code?: string | null
          name: string
          province?: string | null
          sector?: string | null
          stated_objective?: string | null
          time_horizon?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          distinctive_assets?: string | null
          id?: string
          lifecycle_stage?: string | null
          ma_exit_history?: string | null
          nace_code?: string | null
          tax_code?: string | null
          name?: string
          province?: string | null
          sector?: string | null
          stated_objective?: string | null
          time_horizon?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      context: {
        Row: {
          accounting_closing_date: string | null
          ateco_2007_code: string | null
          ateco_2007_description: string | null
          cciaa_number: string | null
          company_name: string
          created_at: string
          main_activity: string | null
          main_products_services: string | null
          nace_rev_2: string | null
          nace_rev_2_description: string | null
          peer_group_description: string | null
          peer_group_name: string | null
          peer_group_size: string | null
          primary_business_line: string | null
          province: string | null
          size_estimate: string | null
          tax_code: string
        }
        Insert: {
          accounting_closing_date?: string | null
          ateco_2007_code?: string | null
          ateco_2007_description?: string | null
          cciaa_number?: string | null
          company_name: string
          created_at?: string
          main_activity?: string | null
          main_products_services?: string | null
          nace_rev_2?: string | null
          nace_rev_2_description?: string | null
          peer_group_description?: string | null
          peer_group_name?: string | null
          peer_group_size?: string | null
          primary_business_line?: string | null
          province?: string | null
          size_estimate?: string | null
          tax_code: string
        }
        Update: {
          accounting_closing_date?: string | null
          ateco_2007_code?: string | null
          ateco_2007_description?: string | null
          cciaa_number?: string | null
          company_name?: string
          created_at?: string
          main_activity?: string | null
          main_products_services?: string | null
          nace_rev_2?: string | null
          nace_rev_2_description?: string | null
          peer_group_description?: string | null
          peer_group_name?: string | null
          peer_group_size?: string | null
          primary_business_line?: string | null
          province?: string | null
          size_estimate?: string | null
          tax_code?: string
        }
        Relationships: []
      }
      financial_capital: {
        Row: {
          created_at: string
          data: Json
          tax_code: string
        }
        Insert: {
          created_at?: string
          data?: Json
          tax_code: string
        }
        Update: {
          created_at?: string
          data?: Json
          tax_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "calibration_wide"
            referencedColumns: ["tax_code"]
          },
          {
            foreignKeyName: "financial_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "context"
            referencedColumns: ["tax_code"]
          },
        ]
      }
      human_organisational: {
        Row: {
          created_at: string
          data: Json
          tax_code: string
        }
        Insert: {
          created_at?: string
          data?: Json
          tax_code: string
        }
        Update: {
          created_at?: string
          data?: Json
          tax_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_organisational_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "calibration_wide"
            referencedColumns: ["tax_code"]
          },
          {
            foreignKeyName: "human_organisational_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "context"
            referencedColumns: ["tax_code"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          organisation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          organisation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          organisation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          capital_impact: string | null
          created_at: string
          description: string | null
          id: string
          rank: number
          rov_score: number | null
          time_horizon_months: number | null
          title: string
          user_id: string | null
          v_uplift_pct: number | null
          valuation_id: string
        }
        Insert: {
          capital_impact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rank: number
          rov_score?: number | null
          time_horizon_months?: number | null
          title: string
          user_id?: string | null
          v_uplift_pct?: number | null
          valuation_id: string
        }
        Update: {
          capital_impact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rank?: number
          rov_score?: number | null
          time_horizon_months?: number | null
          title?: string
          user_id?: string | null
          v_uplift_pct?: number | null
          valuation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      relational_capital: {
        Row: {
          created_at: string
          data: Json
          tax_code: string
        }
        Insert: {
          created_at?: string
          data?: Json
          tax_code: string
        }
        Update: {
          created_at?: string
          data?: Json
          tax_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "relational_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "calibration_wide"
            referencedColumns: ["tax_code"]
          },
          {
            foreignKeyName: "relational_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "context"
            referencedColumns: ["tax_code"]
          },
        ]
      }
      submissions: {
        Row: {
          business_scalability: number | null
          client_portfolio_quality: number | null
          company_id: string
          digital_maturity: number | null
          ebitda: number | null
          ebitda_margin_pct: number | null
          excluded_questions: string[]
          founder_dependency: number | null
          id: string
          management_structure: number | null
          network_partnerships: number | null
          override_ebitda: number | null
          override_recurring_revenue_pct: number | null
          override_revenue_y_1: number | null
          override_revenue_y_2: number | null
          override_revenue_y_3: number | null
          override_tech_investment_ratio_pct: number | null
          override_top3_client_concentration: number | null
          overrides_enabled: boolean
          q_automation: number | null
          q_distinctive_assets_score: number | null
          q_distinctive_tech_assets: number | null
          q_enabling_systems: number | null
          q_lifecycle_score: number | null
          q_ma_history: number | null
          q_process_maturity: number | null
          q_quality_of_growth: number | null
          q_reputation: number | null
          q_strategic_partnerships: number | null
          q_transferability: number | null
          recurring_revenue_pct: number | null
          revenue_cagr_pct: number | null
          revenue_y_1: number | null
          revenue_y_2: number | null
          revenue_y_3: number | null
          submitted_at: string
          tech_investment_ratio_pct: number | null
          top3_client_concentration: number | null
          user_id: string | null
        }
        Insert: {
          business_scalability?: number | null
          client_portfolio_quality?: number | null
          company_id: string
          digital_maturity?: number | null
          ebitda?: number | null
          ebitda_margin_pct?: number | null
          excluded_questions?: string[]
          founder_dependency?: number | null
          id?: string
          management_structure?: number | null
          network_partnerships?: number | null
          override_ebitda?: number | null
          override_recurring_revenue_pct?: number | null
          override_revenue_y_1?: number | null
          override_revenue_y_2?: number | null
          override_revenue_y_3?: number | null
          override_tech_investment_ratio_pct?: number | null
          override_top3_client_concentration?: number | null
          overrides_enabled?: boolean
          q_automation?: number | null
          q_distinctive_assets_score?: number | null
          q_distinctive_tech_assets?: number | null
          q_enabling_systems?: number | null
          q_lifecycle_score?: number | null
          q_ma_history?: number | null
          q_process_maturity?: number | null
          q_quality_of_growth?: number | null
          q_reputation?: number | null
          q_strategic_partnerships?: number | null
          q_transferability?: number | null
          recurring_revenue_pct?: number | null
          revenue_cagr_pct?: number | null
          revenue_y_1?: number | null
          revenue_y_2?: number | null
          revenue_y_3?: number | null
          submitted_at?: string
          tech_investment_ratio_pct?: number | null
          top3_client_concentration?: number | null
          user_id?: string | null
        }
        Update: {
          business_scalability?: number | null
          client_portfolio_quality?: number | null
          company_id?: string
          digital_maturity?: number | null
          ebitda?: number | null
          ebitda_margin_pct?: number | null
          excluded_questions?: string[]
          founder_dependency?: number | null
          id?: string
          management_structure?: number | null
          network_partnerships?: number | null
          override_ebitda?: number | null
          override_recurring_revenue_pct?: number | null
          override_revenue_y_1?: number | null
          override_revenue_y_2?: number | null
          override_revenue_y_3?: number | null
          override_tech_investment_ratio_pct?: number | null
          override_top3_client_concentration?: number | null
          overrides_enabled?: boolean
          q_automation?: number | null
          q_distinctive_assets_score?: number | null
          q_distinctive_tech_assets?: number | null
          q_enabling_systems?: number | null
          q_lifecycle_score?: number | null
          q_ma_history?: number | null
          q_process_maturity?: number | null
          q_quality_of_growth?: number | null
          q_reputation?: number | null
          q_strategic_partnerships?: number | null
          q_transferability?: number | null
          recurring_revenue_pct?: number | null
          revenue_cagr_pct?: number | null
          revenue_y_1?: number | null
          revenue_y_2?: number | null
          revenue_y_3?: number | null
          submitted_at?: string
          tech_investment_ratio_pct?: number | null
          top3_client_concentration?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      technological_capital: {
        Row: {
          created_at: string
          data: Json
          tax_code: string
        }
        Insert: {
          created_at?: string
          data?: Json
          tax_code: string
        }
        Update: {
          created_at?: string
          data?: Json
          tax_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "technological_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "calibration_wide"
            referencedColumns: ["tax_code"]
          },
          {
            foreignKeyName: "technological_capital_tax_code_fkey"
            columns: ["tax_code"]
            isOneToOne: true
            referencedRelation: "context"
            referencedColumns: ["tax_code"]
          },
        ]
      }
      valuations: {
        Row: {
          cap_financial: number | null
          cap_human: number | null
          cap_relational: number | null
          cap_technological: number | null
          company_id: string
          computed_at: string
          ebitda_norm: number | null
          flags: string[] | null
          gf: number | null
          id: string
          m_sector: number | null
          quality_score: number | null
          risk_index: string | null
          scalability_index: number | null
          sqf: number | null
          submission_id: string
          user_id: string | null
          v_current_eur: number | null
          v_high_eur: number | null
          v_low_eur: number | null
          v_potential_eur: number | null
          value_gap_pct: number | null
        }
        Insert: {
          cap_financial?: number | null
          cap_human?: number | null
          cap_relational?: number | null
          cap_technological?: number | null
          company_id: string
          computed_at?: string
          ebitda_norm?: number | null
          flags?: string[] | null
          gf?: number | null
          id?: string
          m_sector?: number | null
          quality_score?: number | null
          risk_index?: string | null
          scalability_index?: number | null
          sqf?: number | null
          submission_id: string
          user_id?: string | null
          v_current_eur?: number | null
          v_high_eur?: number | null
          v_low_eur?: number | null
          v_potential_eur?: number | null
          value_gap_pct?: number | null
        }
        Update: {
          cap_financial?: number | null
          cap_human?: number | null
          cap_relational?: number | null
          cap_technological?: number | null
          company_id?: string
          computed_at?: string
          ebitda_norm?: number | null
          flags?: string[] | null
          gf?: number | null
          id?: string
          m_sector?: number | null
          quality_score?: number | null
          risk_index?: string | null
          scalability_index?: number | null
          sqf?: number | null
          submission_id?: string
          user_id?: string | null
          v_current_eur?: number | null
          v_high_eur?: number | null
          v_low_eur?: number | null
          v_potential_eur?: number | null
          value_gap_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valuations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valuations_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      calibration_wide: {
        Row: {
          accounting_closing_date: string | null
          ateco_2007_code: string | null
          ateco_2007_description: string | null
          cciaa_number: string | null
          company_name: string | null
          created_at: string | null
          financial: Json | null
          human_organisational: Json | null
          main_activity: string | null
          main_products_services: string | null
          nace_rev_2: string | null
          nace_rev_2_description: string | null
          peer_group_description: string | null
          peer_group_name: string | null
          peer_group_size: string | null
          primary_business_line: string | null
          province: string | null
          relational: Json | null
          size_estimate: string | null
          tax_code: string | null
          technological: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      percentile_in_peer_group: {
        Args: {
          p_peer_group: string
          p_capital_table: string
          p_jsonb_path: string
          p_value: number
          p_higher_is_better?: boolean
        }
        Returns: number
      }
      percentile_in_nace_prefix: {
        Args: {
          p_nace_prefix: string
          p_capital_table: string
          p_jsonb_path: string
          p_value: number
          p_higher_is_better?: boolean
        }
        Returns: number
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
  vip: {
    Enums: {},
  },
} as const
