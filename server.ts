import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Express Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// ========================================================
// API ROUTES FIRST
// ========================================================

// 1. Dynamic Quiz Question Generation Endpoint
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { specialty, experienceLevel } = req.body;
    if (!specialty) {
      return res.status(400).json({ error: "Specialty is required." });
    }

    const tier = experienceLevel || "Seasoned Professional";
    const ai = getGeminiClient();

    const prompt = `You are GrowthPaddy's Senior Vetting Director. Generate exactly 3 highly practical, scenario-based multiple-choice quiz questions tailored to the specialty "${specialty}" and experience level "${tier}". 

Each question MUST challenge the candidate with a real-world dilemma they would face in their daily execution as a ${specialty} specialist. Each question must have exactly 4 choices, one clearly correct option, and a brief, highly educational explanation of the correct choice.

Return the JSON array of questions matching the exact schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional hiring director who creates realistic, challenging, and fair skill assessment questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique question id (e.g. gq1, gq2, gq3)" },
              question: { type: Type.STRING, description: "The scenario-based question text." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 multiple choice options."
              },
              correctIdx: { type: Type.INTEGER, description: "The 0-based index of the correct option (0 to 3)." },
              explanation: { type: Type.STRING, description: "Detailed explanation why this choice is correct." }
            },
            required: ["id", "question", "options", "correctIdx", "explanation"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const questions = JSON.parse(text.trim());
    return res.json({ success: true, questions });

  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate scenario-based questions using Gemini." 
    });
  }
});

// 2. Dynamic AI Grading & Constructive Evaluation Endpoint
app.post("/api/gemini/grade", async (req, res) => {
  try {
    const { specialty, experienceLevel, questions, answers } = req.body;
    if (!questions || !answers) {
      return res.status(400).json({ error: "Questions and answers are required." });
    }

    const tier = experienceLevel || "Seasoned Professional";
    const ai = getGeminiClient();

    // 1. Programmatic math computation first for exact precision
    let correctCount = 0;
    const totalQuestions = questions.length;
    const breakdown = questions.map((q: any, idx: number) => {
      const selectedIdx = answers[idx];
      const isCorrect = selectedIdx === q.correctIdx;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        selectedOption: selectedIdx !== undefined && selectedIdx !== null ? q.options[selectedIdx] : "Unanswered/Timeout",
        correctOption: q.options[q.correctIdx],
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= 75;

    // 2. Ask Gemini to generate a beautifully styled constructive feedback paragraph
    const gradingPrompt = `Generate a constructive, highly professional, encouraging feedback evaluation paragraph (maximum 4 sentences) for a candidate who completed a ${specialty} vetting quiz (Experience level: ${tier}).
The candidate scored ${score}% (Threshold to pass is 75%).
${passed ? "They passed! Praise their systems knowledge and welcome them to Phase 2." : "They did not pass this attempt. Encourage them to stay calm, brush up on core competencies, and utilize preparation coaching resources to succeed next time."}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: gradingPrompt,
      config: {
        systemInstruction: "You are GrowthPaddy's Expert Vetting & Recruitment Panel. Speak in a encouraging, professional, and supportive voice.",
      }
    });

    const feedbackParagraph = geminiResponse.text?.trim() || (passed 
      ? `Congratulations! You cleared the GrowthPaddy Phase 1 Gateway with a score of ${score}%. Your specialty expertise in ${specialty} is verified.`
      : `You scored ${score}% on this attempt. Stay positive and keep practicing! Use the resources provided to master key ${specialty} concepts and you'll clear the benchmark next time.`);

    return res.json({
      success: true,
      score,
      passed,
      feedback: feedbackParagraph,
      breakdown
    });

  } catch (error: any) {
    console.error("Error grading quiz:", error);
    // If Gemini fails, we still return the programmatically graded results so the user flow is NOT broken!
    try {
      const { questions, answers, specialty } = req.body;
      let correctCount = 0;
      const totalQuestions = questions.length;
      const breakdown = questions.map((q: any, idx: number) => {
        const selectedIdx = answers[idx];
        const isCorrect = selectedIdx === q.correctIdx;
        if (isCorrect) correctCount++;
        return {
          question: q.question,
          selectedOption: selectedIdx !== undefined && selectedIdx !== null ? q.options[selectedIdx] : "Unanswered/Timeout",
          correctOption: q.options[q.correctIdx],
          isCorrect,
          explanation: q.explanation
        };
      });
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= 75;

      return res.json({
        success: true,
        score,
        passed,
        feedback: passed 
          ? `Outstanding work! You passed the Phase 1 diagnostic for ${specialty} with ${score}%.`
          : `You scored ${score}%. You need at least 75% to pass. Please review the recommended coaching options.`,
        breakdown,
        fallbackGrading: true
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to evaluate the quiz."
      });
    }
  }
});

// ========================================================
// VITE OR STATIC SERVING MIDDLEWARE
// ========================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
