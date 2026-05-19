// Auto-generated from the live aperture-skyfire Supabase project via the
// Supabase MCP `generate_typescript_types` tool. Regenerate with the same
// command after any migration. Do NOT hand-edit — edits get overwritten.

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
      contradictions: {
        Row: {
          agent_read: string
          conflicting_known: string
          created_at: string
          followup_recommended: Database["public"]["Enums"]["followup_kind"]
          id: string
          interviewee_statement: string
          known_fact_id: string | null
          question_id: string | null
          session_id: string
          severity: Database["public"]["Enums"]["contradiction_severity"]
          source_of_known: string
          triggering_message_id: string | null
        }
        Insert: {
          agent_read: string
          conflicting_known: string
          created_at?: string
          followup_recommended: Database["public"]["Enums"]["followup_kind"]
          id?: string
          interviewee_statement: string
          known_fact_id?: string | null
          question_id?: string | null
          session_id: string
          severity: Database["public"]["Enums"]["contradiction_severity"]
          source_of_known: string
          triggering_message_id?: string | null
        }
        Update: {
          agent_read?: string
          conflicting_known?: string
          created_at?: string
          followup_recommended?: Database["public"]["Enums"]["followup_kind"]
          id?: string
          interviewee_statement?: string
          known_fact_id?: string | null
          question_id?: string | null
          session_id?: string
          severity?: Database["public"]["Enums"]["contradiction_severity"]
          source_of_known?: string
          triggering_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contradictions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contradictions_triggering_message_id_fkey"
            columns: ["triggering_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          aperture_event_type:
            | Database["public"]["Enums"]["aperture_event_type"]
            | null
          created_at: string
          elapsed_seconds: number
          entities_mentioned: string[]
          id: string
          notes: Json
          numbers_mentioned: string[]
          question_id: string | null
          retrieval_chunks_used: string[]
          session_id: string
          speaker: Database["public"]["Enums"]["speaker"]
          text: string
          text_tsv: unknown
          turn_index: number
        }
        Insert: {
          aperture_event_type?:
            | Database["public"]["Enums"]["aperture_event_type"]
            | null
          created_at?: string
          elapsed_seconds: number
          entities_mentioned?: string[]
          id?: string
          notes?: Json
          numbers_mentioned?: string[]
          question_id?: string | null
          retrieval_chunks_used?: string[]
          session_id: string
          speaker: Database["public"]["Enums"]["speaker"]
          text: string
          text_tsv?: unknown
          turn_index: number
        }
        Update: {
          aperture_event_type?:
            | Database["public"]["Enums"]["aperture_event_type"]
            | null
          created_at?: string
          elapsed_seconds?: number
          entities_mentioned?: string[]
          id?: string
          notes?: Json
          numbers_mentioned?: string[]
          question_id?: string | null
          retrieval_chunks_used?: string[]
          session_id?: string
          speaker?: Database["public"]["Enums"]["speaker"]
          text?: string
          text_tsv?: unknown
          turn_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecards: {
        Row: {
          agent_notes: string
          confidence_shift: number
          constraint_tested: Database["public"]["Enums"]["constraint_id"]
          created_at: string
          driving_message_id: string | null
          driving_quote: string
          followup_recommended: Database["public"]["Enums"]["followup_kind"]
          id: string
          outcome: Database["public"]["Enums"]["scorecard_outcome"]
          probe_fired: boolean
          probe_resolved_thin: boolean
          question_id: string
          recorded_at_elapsed_seconds: number
          session_id: string
        }
        Insert: {
          agent_notes: string
          confidence_shift: number
          constraint_tested: Database["public"]["Enums"]["constraint_id"]
          created_at?: string
          driving_message_id?: string | null
          driving_quote: string
          followup_recommended?: Database["public"]["Enums"]["followup_kind"]
          id?: string
          outcome: Database["public"]["Enums"]["scorecard_outcome"]
          probe_fired?: boolean
          probe_resolved_thin?: boolean
          question_id: string
          recorded_at_elapsed_seconds: number
          session_id: string
        }
        Update: {
          agent_notes?: string
          confidence_shift?: number
          constraint_tested?: Database["public"]["Enums"]["constraint_id"]
          created_at?: string
          driving_message_id?: string | null
          driving_quote?: string
          followup_recommended?: Database["public"]["Enums"]["followup_kind"]
          id?: string
          outcome?: Database["public"]["Enums"]["scorecard_outcome"]
          probe_fired?: boolean
          probe_resolved_thin?: boolean
          question_id?: string
          recorded_at_elapsed_seconds?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecards_driving_message_id_fkey"
            columns: ["driving_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scorecards_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_fingerprint: Json | null
          closing_completed: boolean
          completed_at: string | null
          created_at: string
          current_question_id: string | null
          current_question_started_at: string | null
          decline_reason: string | null
          elapsed_seconds_at_pause: number | null
          final_line_delivered: boolean
          id: string
          implicit_pause_nudge_sent: boolean
          interviewee_display_name: string
          interviewee_full_name: string
          interviewee_id: string
          last_activity_at: string | null
          last_error: string | null
          p1_trimmable_ids: string[]
          pacing_alerts_fired: string[]
          paused_at: string | null
          probe_attempted_this_question: boolean
          questions_completed: string[]
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          tier: number
          time_budget_hard_stop_seconds: number
          time_budget_target_seconds: number
          token: string
          token_expires_at: string
          token_issued_at: string
          updated_at: string
          warm_completed: boolean
        }
        Insert: {
          client_fingerprint?: Json | null
          closing_completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_question_id?: string | null
          current_question_started_at?: string | null
          decline_reason?: string | null
          elapsed_seconds_at_pause?: number | null
          final_line_delivered?: boolean
          id?: string
          implicit_pause_nudge_sent?: boolean
          interviewee_display_name: string
          interviewee_full_name: string
          interviewee_id: string
          last_activity_at?: string | null
          last_error?: string | null
          p1_trimmable_ids?: string[]
          pacing_alerts_fired?: string[]
          paused_at?: string | null
          probe_attempted_this_question?: boolean
          questions_completed?: string[]
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          tier: number
          time_budget_hard_stop_seconds: number
          time_budget_target_seconds: number
          token: string
          token_expires_at: string
          token_issued_at?: string
          updated_at?: string
          warm_completed?: boolean
        }
        Update: {
          client_fingerprint?: Json | null
          closing_completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_question_id?: string | null
          current_question_started_at?: string | null
          decline_reason?: string | null
          elapsed_seconds_at_pause?: number | null
          final_line_delivered?: boolean
          id?: string
          implicit_pause_nudge_sent?: boolean
          interviewee_display_name?: string
          interviewee_full_name?: string
          interviewee_id?: string
          last_activity_at?: string | null
          last_error?: string | null
          p1_trimmable_ids?: string[]
          pacing_alerts_fired?: string[]
          paused_at?: string | null
          probe_attempted_this_question?: boolean
          questions_completed?: string[]
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          tier?: number
          time_budget_hard_stop_seconds?: number
          time_budget_target_seconds?: number
          token?: string
          token_expires_at?: string
          token_issued_at?: string
          updated_at?: string
          warm_completed?: boolean
        }
        Relationships: []
      }
      synthesis_outputs: {
        Row: {
          constraint_movements: Json
          created_at: string
          email_body_markdown: string
          email_last_error: string | null
          email_resend_id: string | null
          email_send_attempts: number
          email_sent_at: string | null
          email_subject: string
          followup_recommendations: Json
          generation_input_token_count: number | null
          generation_output_token_count: number | null
          id: string
          kind: string
          model_id: string
          session_id: string | null
          surprises: Json
          synthesis_appendix_markdown: string
          top_line_take: string
        }
        Insert: {
          constraint_movements?: Json
          created_at?: string
          email_body_markdown: string
          email_last_error?: string | null
          email_resend_id?: string | null
          email_send_attempts?: number
          email_sent_at?: string | null
          email_subject: string
          followup_recommendations?: Json
          generation_input_token_count?: number | null
          generation_output_token_count?: number | null
          id?: string
          kind: string
          model_id: string
          session_id?: string | null
          surprises?: Json
          synthesis_appendix_markdown: string
          top_line_take: string
        }
        Update: {
          constraint_movements?: Json
          created_at?: string
          email_body_markdown?: string
          email_last_error?: string | null
          email_resend_id?: string | null
          email_send_attempts?: number
          email_sent_at?: string | null
          email_subject?: string
          followup_recommendations?: Json
          generation_input_token_count?: number | null
          generation_output_token_count?: number | null
          id?: string
          kind?: string
          model_id?: string
          session_id?: string | null
          surprises?: Json
          synthesis_appendix_markdown?: string
          top_line_take?: string
        }
        Relationships: [
          {
            foreignKeyName: "synthesis_outputs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
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
      aperture_event_type:
        | "opening"
        | "warm"
        | "question_primary"
        | "probe_down"
        | "moving_on"
        | "acknowledgment"
        | "re_anchor"
        | "redirect"
        | "faq_answer"
        | "joey_escalation"
        | "pause_response"
        | "resume_greeting"
        | "implicit_pause_nudge"
        | "closing_question"
        | "final_line"
        | "second_pass_ack"
      constraint_id:
        | "C1"
        | "C2"
        | "C3"
        | "C4"
        | "C5"
        | "C6"
        | "C7"
        | "META"
        | "STAKEHOLDER"
        | "FORWARD"
      contradiction_severity: "minor" | "material" | "scope_affecting"
      followup_kind:
        | "no"
        | "yes_via_joey_separate_touch"
        | "yes_via_cross_intake_validation"
        | "yes_via_data_check"
        | "yes_via_joey_direct"
      scorecard_outcome:
        | "validates"
        | "partially_validates"
        | "refutes"
        | "partially_refutes"
        | "new_information"
        | "unscorable"
      session_status:
        | "invited"
        | "identifying"
        | "warm"
        | "core"
        | "closing"
        | "completed"
        | "paused"
        | "declined"
        | "expired"
        | "abandoned"
      speaker: "aperture" | "interviewee"
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
      aperture_event_type: [
        "opening",
        "warm",
        "question_primary",
        "probe_down",
        "moving_on",
        "acknowledgment",
        "re_anchor",
        "redirect",
        "faq_answer",
        "joey_escalation",
        "pause_response",
        "resume_greeting",
        "implicit_pause_nudge",
        "closing_question",
        "final_line",
        "second_pass_ack",
      ],
      constraint_id: [
        "C1",
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "META",
        "STAKEHOLDER",
        "FORWARD",
      ],
      contradiction_severity: ["minor", "material", "scope_affecting"],
      followup_kind: [
        "no",
        "yes_via_joey_separate_touch",
        "yes_via_cross_intake_validation",
        "yes_via_data_check",
        "yes_via_joey_direct",
      ],
      scorecard_outcome: [
        "validates",
        "partially_validates",
        "refutes",
        "partially_refutes",
        "new_information",
        "unscorable",
      ],
      session_status: [
        "invited",
        "identifying",
        "warm",
        "core",
        "closing",
        "completed",
        "paused",
        "declined",
        "expired",
        "abandoned",
      ],
      speaker: ["aperture", "interviewee"],
    },
  },
} as const
