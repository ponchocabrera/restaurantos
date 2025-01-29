// file: app/api/ai/getDesign/route.js
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// POST /api/ai/getDesign
export async function POST(request) {
  try {
    const { brandVoice, style, tone, extraInfo } = await request.json();

    // 1) Create OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 2) Build a ChatGPT prompt
    const prompt = `
      You are a restaurant menu designer with a brand voice: "${brandVoice}",
      style: "${style}", tone: "${tone}", extra info: "${extraInfo}".

      Return JSON EXACTLY like:
      {
        "colors": ["#color1","..."],
        "headingFont": "Google Font Name",
        "bodyFont": "Google Font Name",
        "heroPrompt": "Short text describing an image"
      }
      Only produce valid JSON, no extra commentary.
    `;

    // 3) Call chat completions
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content || '';

    // 4) Attempt to parse
    let design;
    try {
      design = JSON.parse(text);
    } catch (err) {
      // fallback if AI returns invalid
      design = {
        colors: ['#AAAAAA', '#DDDDDD'],
        headingFont: 'Arial',
        bodyFont: 'Arial',
        heroPrompt: 'A default image concept',
      };
    }

    return NextResponse.json({ design });
  } catch (err) {
    console.error('Error in getDesign route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
