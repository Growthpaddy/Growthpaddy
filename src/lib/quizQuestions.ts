import { supabase } from './supabase';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id?: string | number;
  skill_category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'fresher' | 'professional' | string;
  question_text: string;
  options: QuestionOption[];
  correct_option_id: string;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Maps front-end difficulty values ('beginner', 'intermediate', 'advanced')
 * to legacy Postgres enum `experience_level_type` ('fresher' | 'professional').
 */
export function mapDifficultyToLegacyEnum(difficulty?: string): 'fresher' | 'professional' {
  if (!difficulty) return 'professional';
  const d = difficulty.toLowerCase().trim();
  if (d === 'beginner' || d === 'fresher' || d === 'junior' || d === 'fresher/newbie' || d === 'entry') {
    return 'fresher';
  }
  return 'professional';
}

/**
 * Maps Postgres enum or raw level strings back to user-friendly UI difficulty labels.
 */
export function mapEnumToDisplayDifficulty(level?: string): 'beginner' | 'intermediate' | 'advanced' {
  if (!level) return 'intermediate';
  const l = level.toLowerCase().trim();
  if (l === 'fresher' || l === 'beginner' || l === 'junior' || l === 'fresher/newbie' || l === 'entry') {
    return 'beginner';
  }
  if (l === 'advanced' || l === 'senior') {
    return 'advanced';
  }
  return 'intermediate';
}

// Fetch all questions for Admin from Supabase Live Database
export async function fetchAdminQuestions(): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz questions from Supabase:', error.message);
      return [];
    }

    return (data || []).map((q: any) => {
      const rawLevel = q.difficulty || q.experience_level || 'intermediate';
      const displayDifficulty = mapEnumToDisplayDifficulty(rawLevel);

      return {
        id: q.id,
        skill_category: q.skill_category || q.category || 'Growth Marketing Strategy',
        difficulty: displayDifficulty,
        question_text: q.question_text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []),
        correct_option_id: q.correct_option_id,
        is_active: q.is_active ?? true,
        created_at: q.created_at,
      };
    });
  } catch (err: any) {
    console.error('Failed to fetch quiz questions:', err);
    return [];
  }
}

/**
 * Multi-strategy Supabase Insertion:
 * 1. Tries exact raw difficulty value ('beginner', 'intermediate', 'advanced').
 * 2. If Postgres rejects with invalid enum value ('experience_level_type'), automatically retries with mapped enum ('fresher' / 'professional').
 * 3. Handles column name fallback between 'difficulty' and 'experience_level'.
 */
export async function createQuizQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>): Promise<QuizQuestion> {
  const rawDifficulty = (question.difficulty || 'intermediate').toLowerCase().trim();
  const legacyEnum = mapDifficultyToLegacyEnum(rawDifficulty);

  // Strategy 1: Try direct insert with raw difficulty
  const payload1: any = {
    skill_category: question.skill_category,
    difficulty: rawDifficulty,
    question_text: question.question_text,
    options: question.options,
    correct_option_id: question.correct_option_id,
    is_active: question.is_active ?? true,
  };

  let { data, error } = await supabase
    .from('quiz_questions')
    .insert([payload1])
    .select('*')
    .single();

  // Strategy 2: If Postgres threw an enum error for 'experience_level_type', retry with mapped enum
  if (error && error.message && error.message.includes('experience_level_type')) {
    console.warn(`Enum 'experience_level_type' does not accept '${rawDifficulty}'. Retrying with '${legacyEnum}'...`);
    const payload2: any = {
      ...payload1,
      difficulty: legacyEnum,
    };

    const retryEnum = await supabase
      .from('quiz_questions')
      .insert([payload2])
      .select('*')
      .single();

    data = retryEnum.data;
    error = retryEnum.error;
  }

  // Strategy 3: If column 'difficulty' does not exist, fallback to 'experience_level' column
  if (error && error.message && (error.message.includes('difficulty') || error.message.includes('column'))) {
    console.warn("Column 'difficulty' not found, retrying insert targeting 'experience_level' column...");
    
    // Try with rawDifficulty first
    let expPayload: any = {
      skill_category: question.skill_category,
      experience_level: rawDifficulty,
      question_text: question.question_text,
      options: question.options,
      correct_option_id: question.correct_option_id,
      is_active: question.is_active ?? true,
    };

    let retryExp = await supabase
      .from('quiz_questions')
      .insert([expPayload])
      .select('*')
      .single();

    // If experience_level enum rejects rawDifficulty, try with legacyEnum
    if (retryExp.error && retryExp.error.message && retryExp.error.message.includes('experience_level_type')) {
      expPayload.experience_level = legacyEnum;
      retryExp = await supabase
        .from('quiz_questions')
        .insert([expPayload])
        .select('*')
        .single();
    }

    data = retryExp.data;
    error = retryExp.error;
  }

  if (error) {
    console.error('Error saving question to Supabase live table:', error.message);
    throw error;
  }

  const savedLevel = data.difficulty || data.experience_level || rawDifficulty;
  return {
    id: data.id,
    skill_category: data.skill_category || data.category || question.skill_category,
    difficulty: mapEnumToDisplayDifficulty(savedLevel),
    question_text: data.question_text,
    options: typeof data.options === 'string' ? JSON.parse(data.options) : (data.options || []),
    correct_option_id: data.correct_option_id,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
  };
}

// Delete a question directly from Supabase
export async function deleteQuizQuestion(id: string | number): Promise<boolean> {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting question from Supabase:', error.message);
    throw error;
  }

  return true;
}

// Toggle a question's active status directly in Supabase
export async function toggleQuestionStatus(id: string | number, isActive: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('quiz_questions')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    console.error('Error toggling question status in Supabase:', error.message);
    throw error;
  }

  return true;
}
