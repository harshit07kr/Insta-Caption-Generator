import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/captionAgent";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;
    const language = (data.get("language") as string) || "English";
    const topic = (data.get("topic") as string) || "lifestyle";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await generateCaption(buffer, file.type, language, topic);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}