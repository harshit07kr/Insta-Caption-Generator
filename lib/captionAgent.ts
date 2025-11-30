import { GoogleGenAI } from "@google/genai";
import { searchContext } from "./alchemyst";
import { z } from "zod";

const CaptionSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  translation: z.string().optional(),
});

export type CaptionOutput = z.infer<typeof CaptionSchema>;

export async function generateCaption(
  imageBuffer: Buffer,
  mimeType: string,
  language: string,
  topic: string = "general"
): Promise<CaptionOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  // Fetch style guidelines or past posts from Alchemyst
  const context = await searchContext(`instagram caption style for ${topic}`);

  const client = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an expert social media manager.
    Analyze the uploaded image and write an engaging Instagram caption in ${language}.
    
    Brand/Style Context:
    ${context || "Use a professional yet engaging tone."}
    
    Output strictly in JSON format:
    {
      "caption": "The main caption text including emojis",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "translation": "English translation if target language is not English (optional)"
    }
  `;

  const response = await client.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: mimeType,
            },
          },
        ],
      },
    ],
  });

  const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleanedText = rawText.replace(/```json|```/g, "").trim();

  try {
    return CaptionSchema.parse(JSON.parse(cleanedText));
  } catch (e) {
    console.error("Validation failed", e);
    return {
      caption: "Error generating caption.",
      hashtags: [],
    };
  }
}