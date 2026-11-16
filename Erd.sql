-- ==============================================================================
-- BINTANGAI - DATABASE SCHEMA & ERD (ENTITY RELATIONSHIP DIAGRAM)
-- Generated automatically from Supabase PostgreSQL Database (.env)
-- Date: 2026-11-16
-- Total Tables: 25 Tables & Views
-- ==============================================================================

/*
================================================================================
                               MERMAID ERD DIAGRAM
================================================================================
```mermaid
erDiagram
    profiles ||--o{ user_activity_logs : "generates"
    profiles ||--o{ xp_logs : "earns"
    profiles ||--o{ modules : "creates (teacher)"
    profiles ||--o{ assignments : "creates (teacher)"
    profiles ||--o{ submissions : "submits (student)"
    profiles ||--o{ study_groups : "owns (creator)"
    profiles ||--o{ group_members : "belongs_to"
    profiles ||--o{ group_join_requests : "requests"
    profiles ||--o{ group_messages : "sends"
    profiles ||--o{ direct_conversations : "participates_as_participant1/2/teacher/parent/student"
    profiles ||--o{ direct_messages : "sends"
    profiles ||--o{ student_reports : "subject_or_author"
    profiles ||--o{ student_ai_chat_history : "chats"
    profiles ||--o{ ai_interactions : "interacts"
    profiles ||--o{ quizzes : "creates (teacher)"
    profiles ||--o{ quiz_results : "completes"
    profiles ||--o| profiles : "linked_student_id (parent -> student)"

    modules ||--o{ assignments : "belongs_to"

    assignments ||--o{ assignment_questions : "contains"
    assignments ||--o{ submissions : "has_submissions"
    assignments ||--o{ quizzes : "linked_to"
    assignments ||--o{ group_assignments : "assigned_to_group"
    assignments ||--o| assignment_leaderboard : "summarized_in"

    assignment_questions ||--o{ assignment_question_options : "has_options"
    assignment_questions ||--o{ submission_answers : "answered_in"

    assignment_question_options ||--o{ submission_answers : "selected_in"

    submissions ||--o{ submission_answers : "contains_answers"

    quizzes ||--o{ quiz_results : "has_results"

    study_groups ||--o| study_group_secrets : "secured_by"
    study_groups ||--o{ group_members : "has_members"
    study_groups ||--o{ group_join_requests : "has_join_requests"
    study_groups ||--o{ group_messages : "contains_messages"
    study_groups ||--o{ group_assignments : "receives_assignments"

    direct_conversations ||--o{ direct_messages : "contains_messages"
```
*/

-- ==============================================================================
-- 0. CUSTOM ENUMS & TYPES
-- ==============================================================================

CREATE TYPE public.ai_grading_tolerance_level AS ENUM (
    'ketat',
    'sedang',
    'fleksibel'
);

-- Helper function for short ID generation
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS text AS $$
BEGIN
    RETURN lpad((floor((random() * (1000000)::double precision)))::text, 6, '0'::text);
END;
$$ LANGUAGE plpgsql;


-- ==============================================================================
-- 1. USER & PROFILE MANAGEMENT
-- ==============================================================================

-- 1.1 PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'siswa',
    disability_type TEXT DEFAULT 'tidak_ada',
    disabilities TEXT[],
    class_level TEXT,
    class_code TEXT,
    linked_student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    avatar_url TEXT,
    preferred_language TEXT,
    dialect_level TEXT DEFAULT 'ringan',
    use_local_analogies BOOLEAN DEFAULT true,
    is_demo_account BOOLEAN DEFAULT false,
    last_active DATE DEFAULT CURRENT_DATE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_online BOOLEAN DEFAULT false,
    slb_name TEXT,
    subject TEXT,
    requested_role TEXT DEFAULT 'siswa',
    requested_class_code TEXT,
    requested_linked_student_id UUID,
    settings JSONB,
    badges JSONB,
    student_password_hash TEXT,
    weak_topics TEXT[],
    short_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Stores user profiles for students, teachers, parents, and admins.';
COMMENT ON COLUMN public.profiles.linked_student_id IS 'Self-referencing FK linking parent profiles to their associated student profile.';

-- 1.2 USER ACTIVITY LOGS
CREATE TABLE public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_role TEXT,
    class_code TEXT,
    action_type TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    description TEXT,
    device_info VARCHAR(100) DEFAULT 'Perangkat Umum',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.user_activity_logs IS 'Audit logs tracking user actions, feature usage, and device info.';

-- 1.3 XP LOGS
CREATE TABLE public.xp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    xp_gained INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.xp_logs IS 'Gamification logs recording experience points gained by students.';


-- ==============================================================================
-- 2. LEARNING MODULES & COURSEWORK
-- ==============================================================================

-- 2.1 MODULES
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    class_level INTEGER,
    class_code TEXT,
    file_path TEXT,
    file_url TEXT,
    pdf_url TEXT,
    content TEXT,
    summary TEXT,
    simplified TEXT,
    tags TEXT[],
    target_students UUID[],
    target_classes TEXT[],
    category TEXT,
    enroll_key TEXT,
    short_id TEXT DEFAULT lpad((floor((random() * (1000000)::double precision)))::text, 6, '0'::text),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.modules IS 'Learning modules and educational documents uploaded by teachers.';

-- 2.2 ASSIGNMENTS
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    class_level INTEGER,
    class_code TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    deadline DATE,
    duration_minutes INTEGER,
    target_students UUID[],
    target_classes TEXT[],
    enroll_key TEXT,
    short_id TEXT DEFAULT public.generate_short_id(),
    is_public BOOLEAN DEFAULT true,
    ai_grading_enabled BOOLEAN DEFAULT true,
    show_explanation BOOLEAN DEFAULT true,
    allow_late_submission BOOLEAN DEFAULT false,
    shuffle_questions BOOLEAN DEFAULT false,
    max_attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.assignments IS 'Tasks, homework, and quizzes assigned by teachers.';

-- 2.3 ASSIGNMENT QUESTIONS
CREATE TABLE public.assignment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- e.g. 'multiple_choice', 'essay', 'voice'
    points INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    rubric_text TEXT,
    correct_answer TEXT,
    ai_explanation TEXT,
    ai_feedback_wrong TEXT,
    difficulty_level TEXT DEFAULT 'medium',
    voice_preview_url TEXT,
    ai_grading_tolerance public.ai_grading_tolerance_level DEFAULT 'sedang',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.assignment_questions IS 'Individual questions attached to an assignment.';

-- 2.4 ASSIGNMENT QUESTION OPTIONS
CREATE TABLE public.assignment_question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.assignment_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.assignment_question_options IS 'Multiple choice options for assignment questions.';


-- ==============================================================================
-- 3. SUBMISSIONS & GRADING SYSTEM
-- ==============================================================================

-- 3.1 SUBMISSIONS
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER,
    total_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ongoing', -- e.g. 'ongoing', 'submitted', 'graded'
    attempt_number INTEGER DEFAULT 1,
    allow_retake BOOLEAN DEFAULT false,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    answer_text TEXT,
    audio_url TEXT,
    ai_feedback_summary TEXT,
    results_detail JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.submissions IS 'Student assignment submission records and scores.';

-- 3.2 SUBMISSION ANSWERS
CREATE TABLE public.submission_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assignment_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.assignment_question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    score NUMERIC DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    teacher_feedback TEXT,
    ai_feedback TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.submission_answers IS 'Individual question answers submitted by a student for a submission.';

-- 3.3 ASSIGNMENT LEADERBOARD (VIEW / READ MODEL)
CREATE OR REPLACE VIEW public.assignment_leaderboard AS
SELECT
    s.assignment_id,
    p.full_name,
    p.avatar_url,
    MAX(s.score) AS top_score,
    MIN(s.submitted_at) AS first_submitted_at
FROM public.submissions s
JOIN public.profiles p ON s.student_id = p.id
GROUP BY s.assignment_id, p.full_name, p.avatar_url;

COMMENT ON VIEW public.assignment_leaderboard IS 'Leaderboard summarizing student top scores per assignment.';

-- 3.4 STUDENT REPORTS
CREATE TABLE public.student_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    recommendation TEXT,
    report_type TEXT DEFAULT 'mingguan',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.student_reports IS 'Progress reports generated for students by teachers or AI.';


-- ==============================================================================
-- 4. LEGACY / STANDALONE QUIZ SYSTEM
-- ==============================================================================

-- 4.1 QUIZZES
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB,
    correct_option INTEGER,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.quizzes IS 'Standalone quiz objects.';

-- 4.2 QUIZ RESULTS
CREATE TABLE public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.quiz_results IS 'Results of standalone quizzes taken by students.';


-- ==============================================================================
-- 5. STUDY GROUPS & SOCIAL COLLABORATION
-- ==============================================================================

-- 5.1 STUDY GROUPS
CREATE TABLE public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_code TEXT,
    icon VARCHAR(50) DEFAULT 'book',
    is_active BOOLEAN DEFAULT true,
    is_chat_disabled BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    password_protected BOOLEAN DEFAULT false,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.study_groups IS 'Collaborative study groups formed by teachers or students.';

-- 5.2 STUDY GROUP SECRETS
CREATE TABLE public.study_group_secrets (
    group_id UUID PRIMARY KEY REFERENCES public.study_groups(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.study_group_secrets IS 'Protected password hashes for password-secured study groups.';

-- 5.3 GROUP MEMBERS
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.group_members IS 'Junction table for study group members.';

-- 5.4 GROUP JOIN REQUESTS
CREATE TABLE public.group_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.group_join_requests IS 'Requests submitted by students to join private study groups.';

-- 5.5 GROUP ASSIGNMENTS
CREATE TABLE public.group_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.group_assignments IS 'Assignments linked specifically to study groups.';

-- 5.6 GROUP MESSAGES
CREATE TABLE public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    audio_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.group_messages IS 'Group chat messages sent within study groups.';


-- ==============================================================================
-- 6. DIRECT MESSAGING SYSTEM
-- ==============================================================================

-- 6.1 DIRECT CONVERSATIONS
CREATE TABLE public.direct_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_one UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_two UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.direct_conversations IS '1-on-1 private conversations between teachers, parents, and students.';

-- 6.2 DIRECT MESSAGES
CREATE TABLE public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_role TEXT,
    audio_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.direct_messages IS 'Individual messages within direct conversations.';


-- ==============================================================================
-- 7. AI TUTOR & CACHING SYSTEM
-- ==============================================================================

-- 7.1 STUDENT AI CHAT HISTORY
CREATE TABLE public.student_ai_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user',
    content TEXT NOT NULL,
    context TEXT,
    model_id TEXT,
    student_name TEXT,
    class_code TEXT,
    question TEXT,
    answer TEXT,
    topic TEXT,
    grade_context TEXT,
    disability_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.student_ai_chat_history IS 'Chat history between students and AI Tutor.';

-- 7.2 AI INTERACTIONS
CREATE TABLE public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    topic TEXT,
    disability_context TEXT,
    grade_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ai_interactions IS 'Structured interaction logs of AI query responses.';

-- 7.3 AI RESPONSE CACHE
CREATE TABLE public.ai_response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_key TEXT NOT NULL,
    raw_query TEXT NOT NULL,
    grade_level INTEGER DEFAULT 4,
    answer TEXT NOT NULL,
    hit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ai_response_cache IS 'Semantically cached AI tutor responses to improve response speeds.';

-- 7.4 AI CACHE (HASH BASED)
CREATE TABLE public.ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_hash TEXT NOT NULL,
    model TEXT NOT NULL,
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.ai_cache IS 'Low-level hash-based cache for LLM request deduplication.';


-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_class_code ON public.profiles(class_code);
CREATE INDEX idx_profiles_linked_student ON public.profiles(linked_student_id);

CREATE INDEX idx_modules_teacher ON public.modules(teacher_id);
CREATE INDEX idx_modules_class_code ON public.modules(class_code);

CREATE INDEX idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX idx_assignments_module ON public.assignments(module_id);
CREATE INDEX idx_assignments_class_code ON public.assignments(class_code);

CREATE INDEX idx_assignment_questions_assignment ON public.assignment_questions(assignment_id);
CREATE INDEX idx_assignment_options_question ON public.assignment_question_options(question_id);

CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submission_answers_submission ON public.submission_answers(submission_id);

CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_student ON public.group_members(student_id);
CREATE INDEX idx_group_messages_group ON public.group_messages(group_id);

CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id);
CREATE INDEX idx_student_ai_chat_student ON public.student_ai_chat_history(student_id);

-- End of Erd.sql
