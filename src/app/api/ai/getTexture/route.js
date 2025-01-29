// file: app/api/ai/getTexture/route.js
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// POST /api/ai/getTexture
// Input: { prompt: string, numVariations?: number }
export async function POST(request) {
  try {
    const { prompt, numVariations = 1 } = await request.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // We'll generate `numVariations` images from DALL·E
    // In openai v4, we do .images.generate
    const response = await openai.images.generate({
      prompt,
      n: numVariations,
      size: '1024x1024',
      response_format: 'url',
    });

    // Return an array of urls
    const urls = response.data.map((img) => img.url);

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('Error in getTexture route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
