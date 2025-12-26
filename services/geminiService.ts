
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHydrationTip = async (currentAmount: number, goal: number): Promise<string> => {
  try {
    const timeOfDay = new Date().getHours();
    let context = "daytime";
    if (timeOfDay < 12) context = "morning";
    else if (timeOfDay > 18) context = "evening";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `It's currently ${context}. User has drunk ${currentAmount}L out of ${goal}L goal today. Give a super cute, very short (max 12 words), encouraging hydration tip from 'Hydroy', a tiny helpful water droplet. Use emojis.`,
      config: {
        temperature: 0.9,
        topP: 0.95,
      },
    });
    return response.text?.trim() || "Drink up, sunshine! Your skin will glow! 💧✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep going! Every drop makes you stronger! 💖";
  }
};
