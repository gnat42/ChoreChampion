import { GoogleGenAI, Type } from "@google/genai";
import { Chore } from "../types";

// Helper to get the API client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateChoreSuggestions = async (
  existingChores: string[]
): Promise<Partial<Chore>[]> => {
  try {
    const ai = getAiClient();
    
    // We use gemini-2.5-flash for fast, structured responses
    const model = "gemini-2.5-flash";
    
    const existingList = existingChores.join(", ");
    const prompt = `
      Generate a list of 5 common household chores that are suitable for a family app.
      Do not include these chores: ${existingList}.
      Assign a reasonable point value between 10 and 500 based on difficulty.
      Assign a suitable single emoji for the icon.
      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              points: { type: Type.INTEGER },
              icon: { type: Type.STRING },
            },
            required: ["title", "description", "points", "icon"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as Partial<Chore>[];
    return data;
  } catch (error) {
    console.error("Failed to generate chores:", error);
    return [];
  }
};