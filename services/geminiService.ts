import { GoogleGenAI } from "@google/genai";

// Initialize the AI client safely
const getAIClient = () => {
  try {
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    return null;
  }
};

export const getHydrationTip = async (currentAmount: number, goal: number): Promise<string> => {
  const ai = getAIClient();
  
  const fallbacks = [
    "Your skin is going to be so glowy today! 🌸",
    "You're the best for drinking water! 💧",
    "Stay hydrated, ur beautiful everyday🤭"
  ];

  if (!ai) return fallbacks[Math.floor(Math.random() * fallbacks.length)];

  try {
    const percentage = Math.round((currentAmount / goal) * 100);
    const prompt = `You are "Hydroy", a cute mascot. User drank ${currentAmount}L/${goal}L. Short encouragement (15 words max) + emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.8 }
    });

    return response.text?.trim() || fallbacks[0];
  } catch (error) {
    return fallbacks[0];
  }
};
