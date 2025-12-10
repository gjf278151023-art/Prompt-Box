import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationResult, TranslationSegment } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client only if the key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sourceLanguage: {
      type: Type.STRING,
      description: "The detected language of the input text (e.g., 'Chinese', 'English').",
    },
    targetLanguage: {
      type: Type.STRING,
      description: "The language the text was translated into.",
    },
    segments: {
      type: Type.ARRAY,
      description: "The semantic segments of the prompt, keeping original and translation aligned.",
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The original segment text.",
          },
          translated: {
            type: Type.STRING,
            description: "The translated segment text.",
          },
        },
        required: ["original", "translated"],
      },
    },
  },
  required: ["sourceLanguage", "targetLanguage", "segments"],
};

export const translatePrompt = async (text: string): Promise<TranslationResult> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert AI Prompt Engineer and Translator.
              
              Your task:
              1. Detect the language of the input text (Chinese or English).
              2. Translate it accurately to the OTHER language (Chinese -> English or English -> Chinese).
              3. Break the input into **semantic prompt segments** (keywords, phrases, or short concepts) rather than full sentences, unless it's a narrative.
              4. Align each original segment with its translation 1-to-1.
              5. Optimize the English translations for AI generation (e.g. Midjourney, Stable Diffusion) using industry standard terms (e.g., "volumetric lighting", "8k resolution").
              
              Input Text:
              """
              ${text}
              """
              `
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini.");
    }

    const parsed = JSON.parse(jsonText);
    
    // Map parsed objects to internal IDs
    const segments: TranslationSegment[] = parsed.segments.map((seg: any, index: number) => ({
      id: `seg-${Date.now()}-${index}`,
      original: seg.original,
      translated: seg.translated
    }));

    return {
      sourceLanguage: parsed.sourceLanguage,
      targetLanguage: parsed.targetLanguage,
      segments: segments,
      originalText: text
    };

  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};