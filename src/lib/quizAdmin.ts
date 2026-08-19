import { supabase } from './supabase';
import { QuizSettings, QuizQuestion, TalentProfileQuizRecord } from '../types';

export type { QuizSettings, QuizQuestion, TalentProfileQuizRecord };

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
      skill_category: q.skill_category || 'General',
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

// Score submission handler
export async function processQuizResult(talentId: string, score: number) {
  const settings = await getQuizSettings();

  const isPass = score >= settings.passing_grade;

  try {
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
