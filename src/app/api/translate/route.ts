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

    const trimmed = text.trim();
    const sourceLang = targetLang === 'ar' ? 'en' : 'ar';

    // 1. Primary: Direct Google Translate Endpoint (No API key needed)
    try {
      const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        // Response structure: [[["Translated text", "Original text", ...]]]
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map((item: any) => item[0]).filter(Boolean).join('');
          if (translated) {
            return NextResponse.json({ translatedText: translated });
          }
        }
      }
    } catch (gErr) {
      console.warn('Google Translate public route error, trying fallback:', gErr);
    }

    // 2. Secondary Fallback: MyMemory Free Translation API
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
      const memRes = await fetch(myMemoryUrl);
      if (memRes.ok) {
        const memData = await memRes.json();
        if (memData?.responseData?.translatedText) {
          return NextResponse.json({ translatedText: memData.responseData.translatedText });
        }
      }
    } catch (memErr) {
      console.warn('MyMemory fallback error:', memErr);
    }

    // If both engines fail, return original text safely
    return NextResponse.json({ translatedText: text });
  } catch (error: any) {
    console.error('[Translate API] Server error:', error);
    return NextResponse.json({ translatedText: text, error: error?.message }, { status: 500 });
  }
}
