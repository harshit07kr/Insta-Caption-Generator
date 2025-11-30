import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/captionAgent";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const files = data.getAll("files") as File[]; // Get all files
    const language = (data.get("language") as string) || "English";
    const topic = (data.get("topic") as string) || "lifestyle";
    const length = (data.get("length") as "Short" | "Medium" | "Long") || "Medium";
    const description = (data.get("description") as string) || "";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Process all images into buffers
    const imageBuffers = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        mimeType: file.type,
      }))
    );

    const result = await generateCaption(
      imageBuffers,
      language,
      topic,
      length,
      description
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}