import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text input' },
        { status: 400 }
      );
    }

    if (!sourceLang || !targetLang ||
        (sourceLang !== 'en' && sourceLang !== 'ar') ||
        (targetLang !== 'en' && targetLang !== 'ar')) {
      return NextResponse.json(
        { error: 'Invalid language codes. Use "en" or "ar"' },
        { status: 400 }
      );
    }

    // If source and target are the same, return the original text
    if (sourceLang === targetLang) {
      return NextResponse.json({ translatedText: text });
    }

    // Get API key from environment variables
    const apiKey = process.env.TRANSLATION_API_KEY;

    // If no API key is provided, fallback to mock translation for local development
    if (!apiKey) {
      console.warn('TRANSLATION_API_KEY not set. Using mock translation.');

      // Mock translation - in a real app, you would call an actual translation service
      // This is just a simple placeholder that reverses the string for demonstration
      // In production, you would integrate with Google Cloud Translate, OpenAI, etc.
      const mockTranslation =
        sourceLang === 'en' && targetLang === 'ar'
          ? `العربية: ${text.split('').reverse().join('')}` // Mock Arabic
          : `English: ${text.split('').reverse().join('')}`; // Mock English

      return NextResponse.json({ translatedText: mockTranslation });
    }

    // In a real implementation, you would call your translation service here
    // Example for Google Cloud Translate:
    /*
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
        key: apiKey,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json({
      translatedText: data.data.translations[0].translatedText
    });
    */

    // Example for OpenAI (if you were using it for translation):
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text from ${sourceLang === 'en' ? 'English' : 'Arabic'} to ${targetLang === 'en' ? 'English' : 'Arabic'}. Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Failed to get translation from OpenAI');
    }

    return NextResponse.json({
      translatedText: data.choices[0].message.content.trim()
    });
    */

    // For now, we'll return a mock response indicating the feature needs implementation
    // In a real app, you would uncomment one of the above implementations
    return NextResponse.json(
      {
        error: 'Translation service not implemented. Please configure TRANSLATION_API_KEY and implement the translation logic.',
        hint: 'Uncomment and implement either Google Cloud Translate or OpenAI translation logic in this file.'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}