import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const groqKey = process.env.GROQ_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();

    if (groqKey) {
      const client = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const transcription = await client.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3-turbo", // Groq's fast whisper model
      });

      return new Response(JSON.stringify({ text: transcription.text }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!openaiKey || openaiKey === "sk-your-key-here") {
      return new Response(JSON.stringify({ text: "[Transcription Mock] This is a mock transcription. Add an OpenAI or Groq API key to enable real transcription." }), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const client = new OpenAI({ apiKey: openaiKey });
    
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
