import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "sk-your-key-here") {
      return new Response(JSON.stringify({ text: "[Transcription Mock] This is a mock transcription of your audio memory." }), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const client = new OpenAI({ apiKey });
    
    const transcription = await client.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    return new Response(JSON.stringify({ text: transcription.text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Transcription Error" }), { status: 500 });
  }
}
