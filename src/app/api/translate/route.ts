import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let text = '';
  try {
    const body = await req.json();
    text = body.text || '';
    const targetLang = body.targetLang || 'ar';

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Translate API] Missing OPENAI_API_KEY on server');
      return NextResponse.json(
        { translatedText: text, error: 'Missing OPENAI_API_KEY on server' },
        { status: 200 }
      );
    }

    const targetLanguageName = targetLang === 'ar' ? 'Modern Standard Arabic' : 'English';

    const systemPrompt = `You are a professional automotive translator for UAE and GCC car marketplaces (memycar.com).
Translate the user's car listing details, description, or notes accurately into ${targetLanguageName}.
Keep automotive terms accurate (e.g. GCC specs -> مواصفات خليجية, Mulkiya -> ملكية, agency warranty -> ضمان الوكالة, full service history -> سجل صيانة كامل).
Return ONLY the translated text without conversational preamble or quotation marks.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Translate API] OpenAI API error response:', errBody);
      return NextResponse.json(
        { translatedText: text, openAiError: errBody },
        { status: 200 }
      );
    }

    const data = await res.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('[Translate API] Unhandled server error:', error);
    return NextResponse.json(
      { translatedText: text, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
