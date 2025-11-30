import { GoogleGenAI } from "@google/genai";
import { searchContext } from "./alchemyst";
import { z } from "zod";

const CaptionSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  translation: z.string().optional(),
});

export type CaptionOutput = z.infer<typeof CaptionSchema>;

// Helper interface for image inputs
interface ImageInput {
  buffer: Buffer;
  mimeType: string;
}

export async function generateCaption(
  images: ImageInput[], // Changed from single buffer to array
  language: string,
  topic: string = "general",
  length: "Short" | "Medium" | "Long" = "Medium",
  userDescription: string = ""
): Promise<CaptionOutput> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY; // Ensure consistent naming with your .env
  if (!apiKey) throw new Error("Missing API Key");

  // Fetch style guidelines
  const context = await searchContext(`instagram caption style for ${topic}`);
  const client = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert social media manager.
    Analyze the uploaded image(s) and write an engaging Instagram caption in ${language}.

    **Constraints:**
    - Caption Length: ${length}
    - User Context: ${userDescription}
    - Topic/Vibe: ${topic}

    **Goal:** Create a caption that stops the scroll. Include viral, high-reach hashtags relevant to the visual content.

    Brand/Style Context:
    ${context || "Use a professional yet engaging tone."}

    Output strictly in JSON format:
    {
      "caption": "The main caption text including emojis",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "translation": "English translation if target language is not English (optional)"
    }
  `;

  // Prepare content parts for Gemini (Text + Multiple Images)
  const contentParts: any[] = [{ text: prompt }];

  images.forEach((img) => {
    contentParts.push({
      inlineData: {
        data: img.buffer.toString("base64"),
        mimeType: img.mimeType,
      },
    });
  });

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: contentParts }],
  });

  const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleanedText = rawText.replace(/```json|```/g, "").trim();

  try {
    return CaptionSchema.parse(JSON.parse(cleanedText));
  } catch (e) {
    console.error("Validation failed", e);
    return { caption: "Error generating caption.", hashtags: [] };
  }
}