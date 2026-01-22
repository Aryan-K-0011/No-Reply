
import { GoogleGenAI } from "@google/genai";
import { Tone } from "../types";

export const generateFollowUpDraft = async (
  recipientName: string,
  originalContext: string,
  tone: Tone
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstructions = {
    professional: "standard business etiquette, clear and concise",
    polite: "extremely respectful and gentle, focusing on building a relationship",
    casual: "friendly, relaxed language, as if talking to a colleague or friend",
    urgent: "direct and time-sensitive without being rude, emphasizes importance",
    short: "maximum 2 sentences, quick and punchy",
    creative: "uses a unique hook or witty remark to stand out in a busy inbox"
  };

  const prompt = `
    Task: Write a follow-up message for ${recipientName}.
    Context: ${originalContext}
    Tone Style: ${toneInstructions[tone]}
    
    Rules:
    - If the recipient name is provided, use it.
    - Focus on a clear call to action.
    - Keep it under 150 words.
    - Provide ONLY the message text. No subject lines.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text?.trim() || "AI could not generate a draft.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI engine is currently offline. Please try again later.");
  }
};
