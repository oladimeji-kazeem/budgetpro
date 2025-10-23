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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dim_account: {
        Row: {
          account_category: Database["public"]["Enums"]["account_category"]
          account_code: string
          account_id: string
          account_name: string
          created_at: string
          financial_statement: Database["public"]["Enums"]["financial_statement"]
          level: number
          parent_id: string | null
          postable: boolean
          status: boolean
          sub_category: string | null
          updated_at: string
        }
        Insert: {
          account_category: Database["public"]["Enums"]["account_category"]
          account_code: string
          account_id?: string
          account_name: string
          created_at?: string
          financial_statement: Database["public"]["Enums"]["financial_statement"]
          level?: number
          parent_id?: string | null
          postable?: boolean
          status?: boolean
          sub_category?: string | null
          updated_at?: string
        }
        Update: {
          account_category?: Database["public"]["Enums"]["account_category"]
          account_code?: string
          account_id?: string
          account_name?: string
          created_at?: string
          financial_statement?: Database["public"]["Enums"]["financial_statement"]
          level?: number
          parent_id?: string | null
          postable?: boolean
          status?: boolean
          sub_category?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dim_account_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "dim_account"
            referencedColumns: ["account_id"]
          },
        ]
      }
      dim_aum: {
        Row: {
          active_pin: number | null
          admin_fee: number | null
          asset_fee: number | null
          aum_id: string
          created_at: string
          date_id: string
          existing_pin_contribution: number | null
          fund_id: string
          inactive_pin: number | null
          investment_returns: number | null
          net_cash_flow: number | null
          never_funded_pin: number | null
          new_pin: number | null
          new_pin_contribution: number | null
          pencom_fee: number | null
          pfa_fee: number | null
          pfc_fee: number | null
          retiree_contributors: number | null
          scenario_id: string
          total_aum: number | null
          total_benefits_paid: number | null
          total_pin: number | null
          total_rsa_balance: number | null
          updated_at: string
        }
        Insert: {
          active_pin?: number | null
          admin_fee?: number | null
          asset_fee?: number | null
          aum_id?: string
          created_at?: string
          date_id: string
          existing_pin_contribution?: number | null
          fund_id: string
          inactive_pin?: number | null
          investment_returns?: number | null
          net_cash_flow?: number | null
          never_funded_pin?: number | null
          new_pin?: number | null
          new_pin_contribution?: number | null
          pencom_fee?: number | null
          pfa_fee?: number | null
          pfc_fee?: number | null
          retiree_contributors?: number | null
          scenario_id: string
          total_aum?: number | null
          total_benefits_paid?: number | null
          total_pin?: number | null
          total_rsa_balance?: number | null
          updated_at?: string
        }
        Update: {
          active_pin?: number | null
          admin_fee?: number | null
          asset_fee?: number | null
          aum_id?: string
          created_at?: string
          date_id?: string
          existing_pin_contribution?: number | null
          fund_id?: string
          inactive_pin?: number | null
          investment_returns?: number | null
          net_cash_flow?: number | null
          never_funded_pin?: number | null
          new_pin?: number | null
          new_pin_contribution?: number | null
          pencom_fee?: number | null
          pfa_fee?: number | null
          pfc_fee?: number | null
          retiree_contributors?: number | null
          scenario_id?: string
          total_aum?: number | null
          total_benefits_paid?: number | null
          total_pin?: number | null
          total_rsa_balance?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dim_aum_date_id_fkey"
            columns: ["date_id"]
            isOneToOne: false
            referencedRelation: "dim_date"
            referencedColumns: ["date_id"]
          },
          {
            foreignKeyName: "dim_aum_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "dim_fund"
            referencedColumns: ["fund_id"]
          },
          {
            foreignKeyName: "dim_aum_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "dim_scenario"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      dim_date: {
        Row: {
          created_at: string
          date: string
          date_id: string
          day: number
          half_year: number
          is_weekend: boolean
          month: number
          month_name: string
          month_short_name: string
          quarter: number
          year: number
          year_month: string
          year_quarter: string
        }
        Insert: {
          created_at?: string
          date: string
          date_id?: string
          day: number
          half_year: number
          is_weekend?: boolean
          month: number
          month_name: string
          month_short_name: string
          quarter: number
          year: number
          year_month: string
          year_quarter: string
        }
        Update: {
          created_at?: string
          date?: string
          date_id?: string
          day?: number
          half_year?: number
          is_weekend?: boolean
          month?: number
          month_name?: string
          month_short_name?: string
          quarter?: number
          year?: number
          year_month?: string
          year_quarter?: string
        }
        Relationships: []
      }
      dim_department: {
        Row: {
          created_at: string
          department_code: string | null
          department_id: string
          department_name: string
          hod: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_code?: string | null
          department_id?: string
          department_name: string
          hod?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_code?: string | null
          department_id?: string
          department_name?: string
          hod?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      dim_fund: {
        Row: {
          created_at: string
          eligibility: string | null
          fund_category: Database["public"]["Enums"]["fund_category"]
          fund_code: string | null
          fund_id: string
          fund_name: string
          is_active: boolean
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          updated_at: string
          variable_income_allocation: number | null
        }
        Insert: {
          created_at?: string
          eligibility?: string | null
          fund_category: Database["public"]["Enums"]["fund_category"]
          fund_code?: string | null
          fund_id?: string
          fund_name: string
          is_active?: boolean
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          updated_at?: string
          variable_income_allocation?: number | null
        }
        Update: {
          created_at?: string
          eligibility?: string | null
          fund_category?: Database["public"]["Enums"]["fund_category"]
          fund_code?: string | null
          fund_id?: string
          fund_name?: string
          is_active?: boolean
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          updated_at?: string
          variable_income_allocation?: number | null
        }
        Relationships: []
      }
      dim_location: {
        Row: {
          address: string | null
          created_at: string
          is_active: boolean
          location_id: string
          location_name: string
          region_id: string | null
          state_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          is_active?: boolean
          location_id?: string
          location_name: string
          region_id?: string | null
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          is_active?: boolean
          location_id?: string
          location_name?: string
          region_id?: string | null
          state_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dim_location_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "dim_region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "dim_location_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "dim_state"
            referencedColumns: ["state_id"]
          },
        ]
      }
      dim_region: {
        Row: {
          created_at: string
          region_id: string
          region_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          region_id?: string
          region_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          region_id?: string
          region_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dim_scenario: {
        Row: {
          created_at: string
          description: string | null
          fiscal_year: number
          is_active: boolean
          is_baseline: boolean
          scenario_code: string
          scenario_id: string
          scenario_name: string
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          fiscal_year: number
          is_active?: boolean
          is_baseline?: boolean
          scenario_code: string
          scenario_id?: string
          scenario_name: string
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          fiscal_year?: number
          is_active?: boolean
          is_baseline?: boolean
          scenario_code?: string
          scenario_id?: string
          scenario_name?: string
          scenario_type?: Database["public"]["Enums"]["scenario_type"]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      dim_sector: {
        Row: {
          created_at: string
          description: string | null
          is_active: boolean
          sector_code: string | null
          sector_id: string
          sector_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          sector_code?: string | null
          sector_id?: string
          sector_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_active?: boolean
          sector_code?: string | null
          sector_id?: string
          sector_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      dim_state: {
        Row: {
          created_at: string
          region_id: string | null
          state_id: string
          state_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          region_id?: string | null
          state_id?: string
          state_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          region_id?: string | null
          state_id?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dim_state_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "dim_region"
            referencedColumns: ["region_id"]
          },
        ]
      }
      fact_budget_forecast: {
        Row: {
          account_id: string
          actual_amount: number | null
          approval_date: string | null
          approved_by: string | null
          budget_amount: number | null
          budget_id: string
          budget_type: Database["public"]["Enums"]["budget_type"]
          created_at: string
          created_by: string | null
          date_id: string
          department_id: string | null
          forecast_amount: number | null
          fund_id: string | null
          location_id: string | null
          notes: string | null
          scenario_id: string
          updated_at: string
          variance_budget: number | null
          variance_forecast: number | null
          version_number: number
        }
        Insert: {
          account_id: string
          actual_amount?: number | null
          approval_date?: string | null
          approved_by?: string | null
          budget_amount?: number | null
          budget_id?: string
          budget_type: Database["public"]["Enums"]["budget_type"]
          created_at?: string
          created_by?: string | null
          date_id: string
          department_id?: string | null
          forecast_amount?: number | null
          fund_id?: string | null
          location_id?: string | null
          notes?: string | null
          scenario_id: string
          updated_at?: string
          variance_budget?: number | null
          variance_forecast?: number | null
          version_number?: number
        }
        Update: {
          account_id?: string
          actual_amount?: number | null
          approval_date?: string | null
          approved_by?: string | null
          budget_amount?: number | null
          budget_id?: string
          budget_type?: Database["public"]["Enums"]["budget_type"]
          created_at?: string
          created_by?: string | null
          date_id?: string
          department_id?: string | null
          forecast_amount?: number | null
          fund_id?: string | null
          location_id?: string | null
          notes?: string | null
          scenario_id?: string
          updated_at?: string
          variance_budget?: number | null
          variance_forecast?: number | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fact_budget_forecast_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "dim_account"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fact_budget_forecast_date_id_fkey"
            columns: ["date_id"]
            isOneToOne: false
            referencedRelation: "dim_date"
            referencedColumns: ["date_id"]
          },
          {
            foreignKeyName: "fact_budget_forecast_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "dim_department"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "fact_budget_forecast_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "dim_fund"
            referencedColumns: ["fund_id"]
          },
          {
            foreignKeyName: "fact_budget_forecast_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "dim_location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "fact_budget_forecast_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "dim_scenario"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      fact_gl_transaction: {
        Row: {
          account_id: string
          created_at: string
          created_by: string | null
          credit_amount: number | null
          date_id: string
          debit_amount: number | null
          department_id: string | null
          description: string | null
          fund_id: string | null
          location_id: string | null
          net_amount: number | null
          reference_number: string | null
          scenario_id: string
          transaction_id: string
          transaction_subtype: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number | null
          date_id: string
          debit_amount?: number | null
          department_id?: string | null
          description?: string | null
          fund_id?: string | null
          location_id?: string | null
          net_amount?: number | null
          reference_number?: string | null
          scenario_id: string
          transaction_id?: string
          transaction_subtype?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number | null
          date_id?: string
          debit_amount?: number | null
          department_id?: string | null
          description?: string | null
          fund_id?: string | null
          location_id?: string | null
          net_amount?: number | null
          reference_number?: string | null
          scenario_id?: string
          transaction_id?: string
          transaction_subtype?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_gl_transaction_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "dim_account"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fact_gl_transaction_date_id_fkey"
            columns: ["date_id"]
            isOneToOne: false
            referencedRelation: "dim_date"
            referencedColumns: ["date_id"]
          },
          {
            foreignKeyName: "fact_gl_transaction_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "dim_department"
            referencedColumns: ["department_id"]
          },
          {
            foreignKeyName: "fact_gl_transaction_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "dim_fund"
            referencedColumns: ["fund_id"]
          },
          {
            foreignKeyName: "fact_gl_transaction_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "dim_location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "fact_gl_transaction_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "dim_scenario"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_category: "asset" | "liability" | "equity" | "revenue" | "expense"
      budget_type: "original" | "revised" | "supplementary"
      financial_statement:
        | "balance_sheet"
        | "income_statement"
        | "cash_flow"
        | "statement_of_changes_in_equity"
      fund_category:
        | "rsa_i"
        | "rsa_ii"
        | "rsa_iii"
        | "rsa_iv"
        | "micro_pension"
        | "approved_existing_scheme"
      risk_profile: "conservative" | "moderate" | "aggressive"
      scenario_type:
        | "actual"
        | "budget"
        | "forecast"
        | "revised_budget"
        | "what_if"
      transaction_type: "actual" | "budget" | "forecast" | "adjustment"
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
      account_category: ["asset", "liability", "equity", "revenue", "expense"],
      budget_type: ["original", "revised", "supplementary"],
      financial_statement: [
        "balance_sheet",
        "income_statement",
        "cash_flow",
        "statement_of_changes_in_equity",
      ],
      fund_category: [
        "rsa_i",
        "rsa_ii",
        "rsa_iii",
        "rsa_iv",
        "micro_pension",
        "approved_existing_scheme",
      ],
      risk_profile: ["conservative", "moderate", "aggressive"],
      scenario_type: [
        "actual",
        "budget",
        "forecast",
        "revised_budget",
        "what_if",
      ],
      transaction_type: ["actual", "budget", "forecast", "adjustment"],
    },
  },
} as const
