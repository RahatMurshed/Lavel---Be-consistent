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
      badges: {
        Row: {
          badge_key: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_key: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_key?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      behavior_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          friction_trigger: string | null
          habit_id: string
          id: string
          log_date: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          friction_trigger?: string | null
          habit_id: string
          id?: string
          log_date?: string
          notes?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          friction_trigger?: string | null
          habit_id?: string
          id?: string
          log_date?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          current_value: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "group_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      consistency_scores: {
        Row: {
          completion_ratio: number
          created_at: string
          energy_alignment: number
          id: string
          overall_score: number
          recovery_speed: number
          resilience_index: number
          score_date: string
          trend_stability: number
          user_id: string
        }
        Insert: {
          completion_ratio?: number
          created_at?: string
          energy_alignment?: number
          id?: string
          overall_score?: number
          recovery_speed?: number
          resilience_index?: number
          score_date?: string
          trend_stability?: number
          user_id: string
        }
        Update: {
          completion_ratio?: number
          created_at?: string
          energy_alignment?: number
          id?: string
          overall_score?: number
          recovery_speed?: number
          resilience_index?: number
          score_date?: string
          trend_stability?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy: number
          id: string
          mood: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy: number
          id?: string
          mood?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy?: number
          id?: string
          mood?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      group_challenges: {
        Row: {
          active: boolean | null
          ai_generated: boolean | null
          challenge_type: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          group_id: string
          id: string
          start_date: string
          target_value: number
          title: string
        }
        Insert: {
          active?: boolean | null
          ai_generated?: boolean | null
          challenge_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string
          group_id: string
          id?: string
          start_date?: string
          target_value?: number
          title: string
        }
        Update: {
          active?: boolean | null
          ai_generated?: boolean | null
          challenge_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          group_id?: string
          id?: string
          start_date?: string
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      growth_reports: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          report_data?: Json
          report_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          active: boolean | null
          created_at: string
          cue_trigger: string | null
          full_version: string
          id: string
          identity_id: string | null
          impact_weight: number | null
          min_version: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          cue_trigger?: string | null
          full_version: string
          id?: string
          identity_id?: string | null
          impact_weight?: number | null
          min_version: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          cue_trigger?: string | null
          full_version?: string
          id?: string
          identity_id?: string | null
          impact_weight?: number | null
          min_version?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          alignment_pct: number | null
          color: string | null
          created_at: string
          emoji: string | null
          id: string
          label: string
          logo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment_pct?: number | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          label: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment_pct?: number | null
          color?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          label?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      identity_drift_alerts: {
        Row: {
          alert_type: string
          alignment_pct: number
          corrective_plan: Json | null
          created_at: string
          dismissed: boolean | null
          id: string
          identity_id: string
          previous_pct: number
          severity: string
          user_id: string
        }
        Insert: {
          alert_type?: string
          alignment_pct?: number
          corrective_plan?: Json | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          identity_id: string
          previous_pct?: number
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          alignment_pct?: number
          corrective_plan?: Json | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          identity_id?: string
          previous_pct?: number
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_drift_alerts_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          leaderboard_opt_in: boolean | null
          onboarding_completed: boolean | null
          timezone: string | null
          tour_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          leaderboard_opt_in?: boolean | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          tour_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          leaderboard_opt_in?: boolean | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          tour_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seasonal_modes: {
        Row: {
          active: boolean | null
          ended_at: string | null
          id: string
          mode: string
          started_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          ended_at?: string | null
          id?: string
          mode: string
          started_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          ended_at?: string | null
          id?: string
          mode?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_milestones: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_count: number | null
          description: string | null
          id: string
          skill_id: string | null
          target_count: number | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_count?: number | null
          description?: string | null
          id?: string
          skill_id?: string | null
          target_count?: number | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_count?: number | null
          description?: string | null
          id?: string
          skill_id?: string | null
          target_count?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_milestones_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_recommendations: {
        Row: {
          generated_at: string
          id: string
          recommendations: Json
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          recommendations?: Json
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          recommendations?: Json
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          date_learned: string
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date_learned?: string
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date_learned?: string
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          category: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          current_streak: number
          id: string
          longest_streak: number
          prestige_level: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          longest_streak?: number
          prestige_level?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          longest_streak?: number
          prestige_level?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          id: string
          report_content: Json
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_content?: Json
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          report_content?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          id: string
          source: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          source: string
          user_id: string
          xp_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          source?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
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
