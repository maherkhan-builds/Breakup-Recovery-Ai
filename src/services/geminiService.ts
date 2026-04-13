import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeJournalEntry(content: string) {
  const prompt = `
    You are an empathetic breakup recovery coach. Analyze the following journal entry:
    "${content}"
    
    1. Count how many times the user mentions or refers to their ex.
    2. Identify the emotional tone (1-5, where 1 is deep sadness/anger and 5 is peace/acceptance).
    3. Provide a gentle, supportive insight (max 2 sentences) that helps the user reframe their thoughts.
    
    Return the result in JSON format:
    {
      "mentions": number,
      "mood": number,
      "insight": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return { mentions: 0, mood: 3, insight: "I'm here for you. Keep writing." };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { mentions: 0, mood: 3, insight: "Take a deep breath. Healing takes time." };
  }
}

export async function getWeeklyInsights(stats: any[]) {
  const prompt = `
    Analyze this week's breakup recovery stats:
    ${JSON.stringify(stats)}
    
    Provide 3 key insights about their progress and emotional patterns. 
    Keep the tone gentle, supportive, and non-judgmental.
    
    Return as a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return ["You're showing up for yourself, and that's the first step.", "Patterns are becoming clearer.", "Be kind to yourself today."];
  } catch (error) {
    return ["Healing is not linear.", "Every day is a new opportunity.", "You are stronger than you feel."];
  }
}
