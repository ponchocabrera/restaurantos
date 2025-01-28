import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
  });
  

export async function POST(request) {
  try {
    const { name, oldDescription, brandVoice } = await request.json();

    const prompt = `
      You are an AI that rewrites menu item descriptions.
      Name: ${name}
      Current description: "${oldDescription}"
      Brand voice: "${brandVoice || 'generic'}"
      Please return a short, appealing rewrite for this item.
    `;

    // Note the new usage with chat.completions.create
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You improve menu item descriptions.' },
        { role: 'user', content: prompt },
      ],
    });

    // The new result shape
    const newDescription = completion.choices[0].message.content.trim();

    return NextResponse.json({ newDescription });
  } catch (err) {
    console.error('Error enhancing description:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
