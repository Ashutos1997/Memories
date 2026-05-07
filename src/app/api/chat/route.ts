import { NextRequest } from "next/server";
import OpenAI from "openai";

const MOCK_RESPONSE = JSON.stringify({
  type: "note",
  title: "기억의 시작",
  content: "오늘 프로젝트 '기억'의 디자인 시스템 V2를 적용했습니다. 따뜻한 분위기의 블랙과 뮤티드 골드 포인트가 아주 마음에 듭니다. 이제 이 캔버스는 당신의 이야기로 채워질 준비가 되었습니다.",
  date: "2026년 5월 6일"
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === "sk-your-key-here") {
      return new Response(MOCK_RESPONSE, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const client = new OpenAI({ apiKey });
    
    // Request structured JSON from AI to match our Design System
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a memory archiver. Respond ONLY with a JSON object containing: type (note, gallery, timeline, or quote), title, content (string or array for timeline/gallery), and date." 
        }, 
        ...messages
      ],
      response_format: { type: "json_object" }
    });

    return new Response(response.choices[0].message.content, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "API Error" }), { status: 500 });
  }
}
