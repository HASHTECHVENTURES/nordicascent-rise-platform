/** Columns safe for employer-facing API responses (excludes internal admin notes). */
export const EMPLOYER_APPLICATION_COLUMNS = `
  id, candidate_id, job_id, status, stage_id, match_score, needs_action,
  applied_at, updated_at, interview_meet_url, interview_scheduled_at,
  motivation_statement, track, source,
  academic_transcript_path, project_descriptions_text, project_descriptions_path,
  work_experience_path, portfolio_path,
  selection_step, selection_step_entered_at,
  eligibility_auto_checks, eligibility_decided_at,
  offee_technical_score, offee_open_mindedness_score, offee_assessed_at, offee_report_path, offee_decided_at,
  technical_digital_date, technical_digital_notes, technical_f2f_date, technical_f2f_format,
  technical_company_participated, technical_score, technical_cognitive_score,
  technical_company_feedback, technical_decided_at,
  motivation_session_date, motivation_format, motivation_company_participated,
  motivation_score, motivation_company_feedback, motivation_decided_at,
  board_company_decision, board_decided_at,
  assigned_mentor_id, readiness_unlocked_at, hold_activated_at
`.replace(/\s+/g, " ");

const CANDIDATE_EMBED = `
  candidates(
    id, profile_id, full_name, track, university_id, university_waitlist_name,
    gpa_or_standing, field_of_study, cv_url, family_relocating, family_member_count,
    profiles(full_name, email, phone, avatar_url)
  )
`;

const JOBS_EMBED = `
  jobs(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name))
`;

export const ADMIN_SELECTION_SELECT = `
  *,
  ${JOBS_EMBED},
  ${CANDIDATE_EMBED}
`;

export const EMPLOYER_SELECTION_SELECT = `
  ${EMPLOYER_APPLICATION_COLUMNS},
  ${JOBS_EMBED},
  ${CANDIDATE_EMBED}
`;

/** For queries that need jobs!inner filter (avoids duplicate jobs embed). */
export const EMPLOYER_APPLICATION_WITH_INNER_JOB = `
  ${EMPLOYER_APPLICATION_COLUMNS},
  jobs!inner(id, title, positions_count, target_track, company_id, core_skills, engineering_discipline, experience_level, requirements, companies(id, name)),
  ${CANDIDATE_EMBED}
`;
