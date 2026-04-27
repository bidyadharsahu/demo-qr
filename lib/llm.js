import { Groq } from 'groq-sdk';

// Default model set to llama3-70b-8192, a very fast and smart conversational model
export async function llmChat({ messages, model = 'llama3-70b-8192', temperature = 0.8 }) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing');

  // Initialize Groq client
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  // Filter messages to ensure they are properly formatted for Groq
  const formattedMessages = messages.map(m => ({
    role: m.role === 'system' || m.role === 'user' ? m.role : 'assistant',
    content: m.content || ''
  }));

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: model,
      temperature: temperature,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error(`Groq LLM error: ${error.message}`);
  }
}
