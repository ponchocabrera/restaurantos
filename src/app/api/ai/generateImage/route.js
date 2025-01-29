// File: app/api/ai/generateImage/route.js

import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Create a new OpenAI client using your key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Read the request body
    const { itemName, brandVoice, styleWanted, tone } = await request.json();

    // Build a prompt string with your variables
    // The more descriptive your prompt, the more accurate your image
    const prompt = `
      A photorealistic image of a dish named "${itemName}".
      Brand voice: ${brandVoice || 'generic'}.
      Style: ${styleWanted || 'modern'}.
      Tone: ${tone || 'friendly'}.
      Show a delicious plated presentation.
    `;

    // Make sure to handle potential issues with empty itemName, etc.
    if (!itemName) {
      return NextResponse.json(
        { error: 'itemName is required' },
        { status: 400 }
      );
    }

    // Call the OpenAI images endpoint
    // Using openai.images.generate(...) for the v4 library:
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512', // or 256x256, 1024x1024
    });

    // "response.data" is typically an array of results
    // e.g. { data: [ { url: "https://..." } ] }
    const imageUrl = response.data[0].url;

    // Return the image URL
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('Error generating image:', err);
    // Return error with status 500
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
