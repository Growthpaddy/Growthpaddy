import { supabase } from './supabase';
import { QuizSettings, QuizQuestion, TalentProfileQuizRecord } from '../types';

export type { QuizSettings, QuizQuestion, TalentProfileQuizRecord };

// 8 Predefined Skill Categories
export const PREDEFINED_SKILL_CATEGORIES = [
  'Growth Marketing Strategy',
  'Paid Media & PPC',
  'SEO & Organic Growth',
  'CRO & Conversion Optimization',
  'Email & Lifecycle Automation',
  'Analytics & Attribution',
  'General Digital Marketing',
  'AI & Automation Strategy'
] as const;

export type PredefinedSkillCategory = typeof PREDEFINED_SKILL_CATEGORIES[number];

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  id: 1,
  passing_grade: 80,
  max_attempts: 3,
  cooldown_days: 14,
  course_url: 'https://learnwithdsp.com/',
};

// Fetch Quiz Settings with graceful default fallback
export async function getQuizSettings(): Promise<QuizSettings> {
  try {
    const { data, error } = await supabase
      .from('quiz_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.warn('Quiz settings query notice:', error.message);
      return DEFAULT_QUIZ_SETTINGS;
    }

    if (!data) {
      return DEFAULT_QUIZ_SETTINGS;
    }

    return {
      id: data.id ?? 1,
      passing_grade: Number(data.passing_grade ?? 80),
      max_attempts: Number(data.max_attempts ?? 3),
      cooldown_days: Number(data.cooldown_days ?? 14),
      course_url: data.course_url || 'https://learnwithdsp.com/',
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.error('Failed to get quiz settings:', err);
    return DEFAULT_QUIZ_SETTINGS;
  }
}

// Update Quiz Settings (Admin)
export async function updateQuizSettings(settings: Partial<QuizSettings>): Promise<QuizSettings> {
  try {
    const updatePayload = {
      passing_grade: settings.passing_grade,
      max_attempts: settings.max_attempts,
      cooldown_days: settings.cooldown_days,
      course_url: settings.course_url,
      updated_at: new Date().toISOString(),
    };

    // Upsert on id: 1
    const { data, error } = await supabase
      .from('quiz_settings')
      .upsert({ id: 1, ...updatePayload })
      .select('*')
      .single();

    if (error) {
      console.warn('Could not persist to quiz_settings table in DB, using local updated values:', error.message);
      return {
        ...DEFAULT_QUIZ_SETTINGS,
        ...settings,
        updated_at: new Date().toISOString(),
      };
    }

    return data as QuizSettings;
  } catch (err) {
    console.error('Error updating quiz settings:', err);
    return {
      ...DEFAULT_QUIZ_SETTINGS,
      ...settings,
      updated_at: new Date().toISOString(),
    };
  }
}

// Fetch Quiz Questions
export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not query quiz_questions table:', error.message);
      return [];
    }

    return (data || []).map((q: any) => ({
      id: q.id,
      skill_category: q.skill_category || 'General Digital Marketing',
      question_text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []),
      correct_option_id: q.correct_option_id,
      is_active: q.is_active ?? true,
      created_at: q.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch quiz questions:', err);
    return [];
  }
}

// Create Question
export async function createQuizQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>): Promise<QuizQuestion | null> {
  try {
    const payload = {
      skill_category: question.skill_category,
      question_text: question.question_text,
      options: question.options,
      correct_option_id: question.correct_option_id,
      is_active: question.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.warn('Could not insert quiz question into DB:', error.message);
      return {
        id: Date.now(),
        ...question,
        created_at: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      skill_category: data.skill_category,
      question_text: data.question_text,
      options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
      correct_option_id: data.correct_option_id,
      is_active: data.is_active,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error('Error creating quiz question:', err);
    return null;
  }
}

// Delete Question
export async function deleteQuizQuestion(questionId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      console.warn('Error deleting quiz question from DB:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Failed to delete question:', err);
    return false;
  }
}

// Toggle Question Status
export async function toggleQuizQuestionStatus(questionId: number, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ is_active: isActive })
      .eq('id', questionId);

    if (error) {
      console.warn('Error updating question active state in DB:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Failed to toggle question status:', err);
    return false;
  }
}

// Fetch Talent Profiles with Phase 1 & 2 Status
export async function getTalentProfilesForQuiz(): Promise<TalentProfileQuizRecord[]> {
  try {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('id, user_id, full_name, email, role, specialization, phase_1_status, phase_2_unlocked, next_retry_date, quiz_score, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not query talent_profiles from Supabase:', error.message);
      return [];
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      full_name: t.full_name || 'Anonymous Candidate',
      email: t.email || 'talent@digitalcampux.com',
      role: t.role || t.specialization || 'Growth Marketer',
      specialization: t.specialization || t.role || 'Digital Marketing',
      phase_1_status: t.phase_1_status || 'pending',
      phase_2_unlocked: Boolean(t.phase_2_unlocked),
      next_retry_date: t.next_retry_date || null,
      quiz_score: t.quiz_score ?? null,
      created_at: t.created_at,
    }));
  } catch (err) {
    console.error('Error fetching talent profiles:', err);
    return [];
  }
}

// Unlock Phase 2 manually for a talent
export async function unlockPhaseTwo(talentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('talent_profiles')
      .update({ 
        phase_2_unlocked: true, 
        phase_1_status: 'passed',
        next_retry_date: null
      })
      .eq('id', talentId);

    if (error) {
      console.warn('Error unlocking Phase 2 in talent_profiles table:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Error unlocking Phase 2:', err);
    return false;
  }
}

export interface QuizAttemptPayload {
  talent_id: string;
  skill_category: string;
  score_percentage: number;
  passed: boolean;
  completed_at?: string;
}

/**
 * Inserts quiz attempt into `quiz_attempts` (and talent_quiz_attempts) with skill_category
 */
export async function submitQuizAttempt(payload: QuizAttemptPayload): Promise<boolean> {
  const attempt = {
    talent_id: payload.talent_id,
    skill_category: payload.skill_category || 'General Digital Marketing',
    score_percentage: payload.score_percentage,
    passed: payload.passed,
    completed_at: payload.completed_at || new Date().toISOString()
  };

  try {
    // 1. Primary insert into `quiz_attempts`
    const { error: primaryError } = await supabase
      .from('quiz_attempts')
      .insert([attempt]);

    if (primaryError) {
      console.warn('Could not insert directly into quiz_attempts:', primaryError.message);
    }

    // 2. Also record in talent_quiz_attempts for backwards compatibility if needed
    try {
      await supabase
        .from('talent_quiz_attempts')
        .insert([{
          talent_id: payload.talent_id,
          specialty: payload.skill_category,
          score: payload.score_percentage,
          passed: payload.passed,
          created_at: payload.completed_at || new Date().toISOString()
        }]);
    } catch {
      // Non-blocking
    }

    // Cache locally for offline resilience
    const localKey = `dsp_verified_attempts_${payload.talent_id}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    cached.push(attempt);
    localStorage.setItem(localKey, JSON.stringify(cached));

    return true;
  } catch (err) {
    console.error('Failed to record quiz attempt:', err);
    return false;
  }
}

/**
 * Fetches verified skill categories for a talent from `talent_verified_skills` view
 * or `quiz_attempts` where passed = true
 */
export async function getTalentVerifiedSkills(talentId: string): Promise<string[]> {
  if (!talentId) return [];

  const verifiedSet = new Set<string>();

  try {
    // 1. Try querying `talent_verified_skills` view
    const { data: viewData, error: viewError } = await supabase
      .from('talent_verified_skills')
      .select('skill_category')
      .eq('talent_id', talentId);

    if (!viewError && viewData && viewData.length > 0) {
      viewData.forEach((row: any) => {
        if (row.skill_category) verifiedSet.add(row.skill_category);
      });
      return Array.from(verifiedSet);
    }

    // 2. Fallback: Query `quiz_attempts` where passed = true
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('skill_category, passed')
      .eq('talent_id', talentId)
      .eq('passed', true);

    if (!attemptsError && attemptsData) {
      attemptsData.forEach((row: any) => {
        if (row.skill_category) verifiedSet.add(row.skill_category);
      });
    }

    // 3. Fallback: Query `talent_quiz_attempts`
    if (verifiedSet.size === 0) {
      const { data: legacyData } = await supabase
        .from('talent_quiz_attempts')
        .select('specialty, passed')
        .eq('talent_id', talentId)
        .eq('passed', true);

      if (legacyData) {
        legacyData.forEach((row: any) => {
          if (row.specialty) verifiedSet.add(row.specialty);
        });
      }
    }

    // 4. Local storage fallback
    const localKey = `dsp_verified_attempts_${talentId}`;
    const cached = JSON.parse(localStorage.getItem(localKey) || '[]');
    cached.forEach((a: any) => {
      if (a.passed && a.skill_category) verifiedSet.add(a.skill_category);
    });

  } catch (err) {
    console.warn('Notice while fetching verified skills for talent:', err);
  }

  return Array.from(verifiedSet);
}

// Score submission handler
export async function processQuizResult(talentId: string, score: number, skillCategory: string = 'General Digital Marketing') {
  const settings = await getQuizSettings();
  const isPass = score >= settings.passing_grade;

  try {
    // Record into quiz_attempts
    await submitQuizAttempt({
      talent_id: talentId,
      skill_category: skillCategory,
      score_percentage: score,
      passed: isPass,
      completed_at: new Date().toISOString()
    });

    if (isPass) {
      await supabase.from('talent_profiles').update({
        phase_1_status: 'passed',
        phase_2_unlocked: true,
        quiz_score: score,
        next_retry_date: null
      }).eq('id', talentId);
    } else {
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + settings.cooldown_days);

      await supabase.from('talent_profiles').update({
        phase_1_status: 'cooldown',
        phase_2_unlocked: false,
        quiz_score: score,
        next_retry_date: cooldownDate.toISOString(),
      }).eq('id', talentId);
    }
  } catch (err) {
    console.error('Error processing quiz result in database:', err);
  }
}
