import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Temporary debug to verify your environment variable is loaded
console.log('DEBUG: process.env.OPENAI_API_KEY =', process.env.OPENAI_API_KEY);

// Instantiate the OpenAI client using your key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse the request body
    const { name, oldDescription, brandVoice } = await request.json();

    // Build the prompt with extra context (brandVoice, etc.)
    const prompt = `
      You are an AI that rewrites menu item descriptions.
      Name: ${name}
      Current description: "${oldDescription}"
      Brand voice: "${brandVoice || 'generic'}"
      Please return a short, appealing rewrite for this item.
    `;

    // Use the new openai v4+ method chat.completions.create
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You improve menu item descriptions.' },
        { role: 'user', content: prompt },
      ],
    });

    // Extract the rewritten description from the AI response
    const newDescription = completion.choices[0].message.content.trim();

    // Return the result as JSON
    return NextResponse.json({ newDescription });
  } catch (err) {
    console.error('Error enhancing description:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
