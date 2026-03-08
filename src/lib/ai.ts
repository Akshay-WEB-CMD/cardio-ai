import { GoogleGenAI } from "@google/genai";

// The user provided this specific key. 
// Note: This looks like an OpenAI key (sk-proj-...), 
// but the user requested to use it for the AI features.
// We'll use it as the primary key, falling back to the environment variable.
export const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};
