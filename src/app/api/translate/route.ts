import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, targetLang = 'ar' } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ translatedText: text });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Option A: Translate using OpenAI API
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert translator specializing in automotive marketplaces in the UAE. Translate the following text into natural ${
                targetLang === 'ar' ? 'Arabic' : 'English'
              }. Preserve vehicle technical specs (like GCC, km, trim names) accurately. Return ONLY the translated string without quotes or conversational filler.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const translated = data?.choices?.[0]?.message?.content?.trim();
      return NextResponse.json({ translatedText: translated || text });
    }

    // Option B: Translate using Gemini API
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate this automotive listing text into natural ${
                      targetLang === 'ar' ? 'Arabic' : 'English'
                    }. Output ONLY the translated text:\n\n${text}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ translatedText: translated || text });
    }

    // Fallback if no API key is provided
    console.warn('No translation API key configured in .env.local');
    return NextResponse.json({ translatedText: text });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ translatedText: null, error: error.message }, { status: 500 });
  }
}
