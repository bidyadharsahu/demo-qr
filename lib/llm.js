import { Groq } from 'groq-sdk';

const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const EMERGENT_DEFAULT_MODEL = process.env.EMERGENT_MODEL || 'gemini/gemini-2.5-flash';

export async function llmChat({ messages, model, temperature = 0.8 }) {
  const formattedMessages = (messages || []).map((m) => ({
    role: m.role === 'system' || m.role === 'user' ? m.role : 'assistant',
    content: m.content || '',
  }));

  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: model || GROQ_DEFAULT_MODEL,
        temperature,
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

  if (process.env.EMERGENT_LLM_KEY) {
    try {
      const res = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EMERGENT_LLM_KEY}`,
        },
        body: JSON.stringify({
          model: model || EMERGENT_DEFAULT_MODEL,
          messages: formattedMessages,
          temperature,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Emergent error ${res.status}: ${text}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Emergent API Error:', error);
      throw new Error(`Emergent LLM error: ${error.message}`);
    }
  }

  throw new Error('No LLM key configured. Set GROQ_API_KEY or EMERGENT_LLM_KEY.');
}
