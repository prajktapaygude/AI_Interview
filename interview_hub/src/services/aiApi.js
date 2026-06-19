import BASE_URL from "../config"
// aiApi.js
const API_BASE = `${BASE_URL}`;

/**
 * Generate a set of initial questions (used in batch mode, but kept for compatibility)
 */
export const generateQuestions = async (role, Id, techStack, level, difficulty) => {
  const response = await fetch(`${API_BASE}/generate-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, Id, techStack, level, difficulty })
  });
  if (!response.ok) throw new Error("Failed to generate questions");
  return response.json();
};

/**
 * Generate a single continuous question (for live interview mode).
 * Now supports `lastAnswer` and `conversationHistory` for context‑aware follow‑ups.
 */
export const generateContinuousQuestion = async (
  role,
  Id,
  techStack,
  level,
  difficulty,
  askedQuestions = [],
  lastAnswer = null,
  conversationHistory = []
) => {
  const response = await fetch(`${API_BASE}/generate-continuous-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      Id,
      techStack,
      level,
      difficulty,
      askedQuestions,
      lastAnswer,
      conversationHistory
    })
  });
  if (!response.ok) throw new Error("Failed to generate continuous question");
  return response.json();
};

/**
 * Convert text to speech – returns audio URL and duration (if backend provides it)
 */
export const textToSpeech = async (text) => {
  const response = await fetch(`${API_BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!response.ok) throw new Error("TTS failed");
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  // Estimate duration (optional: backend can return duration header)
  const duration = Math.max(1, text.length / 15); // rough estimate
  return { audioUrl, duration };
};

/**
 * Analyze final report (batch evaluation is done separately, but this endpoint
 * is used to generate the final report object)
 */
export const analyzeReport = async (Id, role, questions, answers, userId = "guest") => {
  const response = await fetch(`${API_BASE}/analyze-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Id, userId, role, questions, answers })
  });
  if (!response.ok) throw new Error("Report generation failed");
  return response.json();
};

/**
 * Optional: single evaluate call (used for real‑time feedback in the new flow)
 */
export const evaluateAnswer = async (Id, userId, role, question, answer) => {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Id, userId, role, question, answer })
  });
  if (!response.ok) throw new Error("Evaluation failed");
  return response.json();
};