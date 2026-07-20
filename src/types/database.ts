export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; role: 'candidate' | 'employer' | 'admin'; full_name: string | null; email: string | null; avatar_url: string | null; phone: string | null; account_status: string; created_at: string; updated_at: string } };
      candidates: { Row: { id: string; profile_id: string; full_name: string | null; avatar_url: string | null; title: string | null; location: string | null; country: string | null; state: string | null; city: string | null; skills: string[] | null; experience: string | null; education: string | null; field_of_study: string | null; degree_type: string | null; linkedin_url: string | null; gpa_or_standing: string | null; nordics_motivation: string | null; expected_graduation_date: string | null; graduation_year: string | null; current_employer: string | null; current_role_title: string | null; university_id: string | null; university_waitlist_name: string | null; track: 'entry' | 'fast'; status: string; pool_category: 'active' | 'waitlist' | 'network' | 'alumni'; readiness_score: number; jobs_unlocked: boolean; bio: string | null; cv_url: string | null; created_at: string; updated_at: string } };
      companies: { Row: { id: string; name: string; logo_url: string | null; industry: string | null; location: string | null; size: string | null; description: string | null; website: string | null; status: string; country: string | null; org_number: string | null; postal_code: string | null; contact_name: string | null; contact_role: string | null; contact_email: string | null; contact_phone: string | null; hired_international_before: boolean | null; international_hiring_challenge: string | null; workplace_language: string | null; relocation_support: string | null; heard_about: string | null; registration_notes: string | null; gdpr_consent: boolean | null; intake_submitted_at: string | null; created_at: string; updated_at: string } };
      employers: { Row: { id: string; profile_id: string; company_id: string; title: string | null; created_at: string } };
      jobs: { Row: { id: string; company_id: string; title: string; department: string | null; location: string | null; job_type: string | null; salary_range: string | null; description: string | null; requirements: string[] | null; benefits: string[] | null; engineering_discipline: string | null; discipline_other: string | null; positions_count: number | null; experience_level: string | null; target_track: 'entry' | 'fast' | null; core_skills: string | null; desired_start_window: string | null; status: 'draft' | 'open' | 'closed'; posted_at: string | null; deadline_at: string | null; created_at: string; updated_at: string } };
      applications: { Row: { id: string; candidate_id: string; job_id: string; status: string; stage_id: string | null; match_score: number | null; needs_action: boolean; notes: string | null; applied_at: string; updated_at: string; interview_meet_url: string | null; interview_scheduled_at: string | null; interview_notes: string | null; motivation_statement: string | null; track: 'entry' | 'fast' | null; source: string | null; academic_transcript_path: string | null; project_descriptions_text: string | null; project_descriptions_path: string | null; work_experience_path: string | null; portfolio_path: string | null; selection_step: number; selection_step_entered_at: string; eligibility_auto_checks: Json | null; eligibility_admin_notes: string | null; eligibility_decided_at: string | null; offee_technical_score: number | null; offee_open_mindedness_score: number | null; offee_assessed_at: string | null; offee_notes: string | null; offee_report_path: string | null; offee_decided_at: string | null; technical_digital_date: string | null; technical_digital_notes: string | null; technical_f2f_date: string | null; technical_f2f_format: string | null; technical_company_participated: boolean | null; technical_score: number | null; technical_cognitive_score: number | null; technical_assessor_notes: string | null; technical_company_feedback: string | null; technical_decided_at: string | null; motivation_session_date: string | null; motivation_format: string | null; motivation_company_participated: boolean | null; motivation_score: number | null; motivation_session_notes: string | null; motivation_company_feedback: string | null; motivation_decided_at: string | null; board_admin_recommendation: 'recommended' | 'not_recommended' | null; board_admin_reason: string | null; board_company_decision: 'selected' | 'hold' | 'rejected' | null; board_decided_at: string | null; assigned_mentor_id: string | null; readiness_unlocked_at: string | null; hold_activated_at: string | null } };
      company_mentors: { Row: { id: string; company_id: string; name: string; role_title: string | null; email: string; phone: string | null; status: string; created_at: string; updated_at: string } };
      pipeline_stages: { Row: { id: string; name: string; sort_order: number; description: string | null } };
      candidate_stage_progress: { Row: { id: string; candidate_id: string; stage_id: string; status: 'not_started' | 'active' | 'completed'; started_at: string | null; completed_at: string | null } };
      stage_tasks: { Row: { id: string; stage_id: string; company_id: string | null; title: string; description: string | null; sort_order: number; content_url: string | null; image_url: string | null; task_type: 'task' | 'course'; content_body: string | null } };
      candidate_task_progress: { Row: { id: string; candidate_id: string; task_id: string; completed_at: string } };
      conversations: { Row: { id: string; subject: string | null; created_at: string; updated_at: string } };
      messages: { Row: { id: string; conversation_id: string; sender_id: string; body: string; read_at: string | null; created_at: string } };
      mentoring_sessions: { Row: { id: string; candidate_id: string; mentor_id: string; title: string; scheduled_at: string; duration_minutes: number; status: string; notes: string | null; meeting_url: string | null; created_at: string } };
      issues: { Row: { id: string; reporter_id: string | null; candidate_id: string | null; title: string; description: string | null; priority: string; status: string; created_at: string; resolved_at: string | null } };
      support_tickets: { Row: { id: string; user_id: string; subject: string; status: string; priority: string; created_at: string; updated_at: string } };
      support_ticket_messages: { Row: { id: string; ticket_id: string; sender_id: string; body: string; created_at: string } };
      notifications: { Row: { id: string; user_id: string; title: string; body: string | null; type: string; read_at: string | null; metadata: Json | null; created_at: string } };
      activity_log: { Row: { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json | null; created_at: string } };
      contact_submissions: { Row: { id: string; name: string; email: string; company: string | null; message: string; status: string; created_at: string } };
      insight_articles: { Row: { id: string; title: string; excerpt: string | null; content: string | null; category: string | null; author: string | null; image_url: string | null; published: boolean; created_at: string } };
      announcements: { Row: { id: string; title: string; body: string; published: boolean; created_by: string | null; created_at: string } };
      employer_tasks: { Row: { id: string; employer_id: string; title: string; description: string | null; due_at: string | null; completed: boolean; priority: string; created_at: string } };
      platform_settings: { Row: { id: string; settings: Json; updated_at: string } };
      universities: { Row: { id: string; name: string; institution_type: 'university' | 'institute'; country: string; city: string | null; is_accessible: boolean; created_at: string } };
      university_waitlist: { Row: { id: string; candidate_id: string; university_name: string; institution_type: 'university' | 'institute'; city: string | null; status: string; created_at: string } };
      readiness_tests: { Row: { id: string; area: 'cultural_social' | 'technical'; level: number; title: string; subtitle: string | null; intro_body: string | null; timer_minutes: number; timer_hard: boolean; sort_order: number; active: boolean; created_at: string } };
      readiness_questions: { Row: { id: string; test_id: string; scenario_label: string | null; prompt: string; answer_type: 'short' | 'long' | 'bullets' | 'video'; sort_order: number; created_at: string } };
      readiness_attempts: { Row: { id: string; candidate_id: string; test_id: string; status: 'in_progress' | 'submitted' | 'expired'; started_at: string; submitted_at: string | null; expires_at: string | null; created_at: string } };
      readiness_answers: { Row: { id: string; attempt_id: string; question_id: string; answer_text: string | null; video_path: string | null; updated_at: string } };
      readiness_evaluations: { Row: { id: string; candidate_id: string; cultural_signal: 'strong' | 'acceptable' | 'weak' | null; technical_signal: 'strong' | 'acceptable' | 'weak' | null; red_flag: boolean; red_flag_note: string | null; evaluator_notes: string | null; evaluated_by: string | null; evaluated_at: string | null; approved_for_activation: boolean; created_at: string; updated_at: string } };
    };
    Enums: {
      user_role: 'candidate' | 'employer' | 'admin';
      track_type: 'entry' | 'fast';
      stage_status: 'not_started' | 'active' | 'completed';
      job_status: 'draft' | 'open' | 'closed';
      application_status: 'applied' | 'application_complete' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'accepted' | 'eligibility_review' | 'eligibility_pass' | 'offee_review' | 'offee_pass' | 'step3_review' | 'step3_pass' | 'step4_review' | 'step4_pass' | 'selected_for_readiness' | 'selection_hold' | 'selection_rejected' | 'mentor_assigned' | 'readiness_active' | 'readiness_complete' | 'internship' | 'go_no_go' | 'pre_arrival' | 'relocation' | 'onboarding' | 'followup' | 'journey_complete';
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Candidate = Database['public']['Tables']['candidates']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type TrackType = Database['public']['Enums']['track_type'];
