import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

if (!apiKey) {
  console.warn('⚠️  NEXT_PUBLIC_GEMINI_API_KEY not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Gemini client for frontend use
 * Note: For production, all AI generation should go through the backend API
 * This client is provided for potential frontend-only features
 */
export const gemini = {
  /**
   * Generate content using Gemini Pro
   */
  async generate(prompt: string, systemPrompt?: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  },

  /**
   * Start a chat session
   */
  startChat(systemPrompt?: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    return model.startChat({
      history: systemPrompt
        ? [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I will roleplay this character.' }],
            },
          ]
        : [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
      },
    });
  },
};
