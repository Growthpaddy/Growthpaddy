import { supabase } from './supabase';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id?: string | number;
  skill_category: string;
  question_text: string;
  options: QuestionOption[];
  correct_option_id: string;
  is_active?: boolean;
  created_at?: string;
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

    return (data || []).map((q: any) => ({
      id: q.id,
      skill_category: q.skill_category || 'Growth Marketing Strategy',
      question_text: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []),
      correct_option_id: q.correct_option_id,
      is_active: q.is_active ?? true,
      created_at: q.created_at,
    }));
  } catch (err: any) {
    console.error('Failed to fetch quiz questions:', err);
    return [];
  }
}

// Save a new question directly to Supabase live table
export async function createQuizQuestion(question: Omit<QuizQuestion, 'id' | 'created_at'>): Promise<QuizQuestion> {
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
    console.error('Error saving question to Supabase live table:', error.message);
    throw error;
  }

  return {
    id: data.id,
    skill_category: data.skill_category,
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
