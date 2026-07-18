import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AnswerPayload {
  question_id: string;
  selected_option_id: string;
}

interface RequestPayload {
  talent_id: string;
  answers: AnswerPayload[];
}

serve(async (req) => {
  // 1. CORS Pre-flight Handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Read Security Environment Keys
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }

    // Initialize Supabase Client with Service Role Key to bypass Row-Level Security (RLS) safely
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    // 3. Parse and Validate Request Payload
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Only POST supported." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestPayload = await req.json();
    const { talent_id, answers } = body;

    if (!talent_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: talent_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid answers array." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Batch fetch correct answers from 'quiz_questions' where is_active is true
    const questionIds = answers.map((ans) => ans.question_id);
    const { data: questions, error: fetchError } = await supabase
      .from("quiz_questions")
      .select("id, correct_option_id")
      .in("id", questionIds)
      .eq("is_active", true);

    if (fetchError || !questions) {
      throw new Error(`Failed to fetch active quiz questions: ${fetchError?.message || "No matching questions found"}`);
    }

    // 5. Evaluate the submission in O(1) lookups
    const correctAnswersMap = new Map<string, string>();
    for (const q of questions) {
      correctAnswersMap.set(q.id, q.correct_option_id);
    }

    let correctCount = 0;
    const totalQuestions = questions.length;

    // Map each answer to compute the precise snapshot audit trace
    const evaluatedAnswers = answers.map((ans) => {
      const correctAnswerId = correctAnswersMap.get(ans.question_id);
      const isCorrect = correctAnswerId !== undefined && correctAnswerId === ans.selected_option_id;
      if (isCorrect) {
        correctCount++;
      }
      return {
        question_id: ans.question_id,
        selected_option_id: ans.selected_option_id,
        correct_option_id: correctAnswerId,
        is_correct: isCorrect,
      };
    });

    // Compute final percentage score
    const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const roundedScore = Math.round(scorePercentage * 100) / 100; // Round to 2 decimal places
    const passingThreshold = 75.00;
    const isPassed = roundedScore >= passingThreshold;

    // 6. Atomically update the database
    // A. Log raw quiz attempt audit log
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        talent_id,
        score: roundedScore,
        passed: isPassed,
        answers_snapshot: evaluatedAnswers,
      })
      .select()
      .single();

    if (attemptError) {
      throw new Error(`Failed to log quiz attempt: ${attemptError.message}`);
    }

    // B. If passed, atomically upgrade talent profile parameters
    if (isPassed) {
      const { error: profileError } = await supabase
        .from("talent_profiles")
        .update({
          phase_1_quiz_passed: true,
          vetting_status: "in_progress",
        })
        .eq("id", talent_id);

      if (profileError) {
        throw new Error(`Failed to update talent profile state: ${profileError.message}`);
      }
    }

    // 7. Generate Dynamic feedback string based on score
    let feedbackMessage = "";
    if (isPassed) {
      feedbackMessage = `Outstanding achievement! You cleared the DSP Talent Phase 1 Gateway with an impressive score of ${roundedScore}%. Your profile has been activated and unlocked for active recruitment matching channels!`;
    } else if (roundedScore >= 60.00) {
      feedbackMessage = `Close effort! You achieved a score of ${roundedScore}%. Our vetting threshold is ${passingThreshold}%. Please review our documentation modules and attempt the assessment diagnostic once again to unlock your profile.`;
    } else {
      feedbackMessage = `Your score is ${roundedScore}%. To proceed onto the recruitment matching pipeline, please brush up on core digital growth metrics and retry the Phase 1 diagnostic.`;
    }

    // 8. Return response
    return new Response(
      JSON.stringify({
        success: true,
        talent_id,
        score: roundedScore,
        passing_threshold: passingThreshold,
        passed: isPassed,
        attempt_id: attempt?.id,
        feedback: feedbackMessage,
        metrics: {
          total_questions: totalQuestions,
          correct_answers: correctCount,
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Quiz Grading Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An internal server error occurred during evaluation."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
