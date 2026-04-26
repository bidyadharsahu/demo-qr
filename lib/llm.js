// Calls the Emergent universal LLM proxy (OpenAI-compatible).
// Default model: gemini/gemini-2.5-pro

export async function llmChat({ messages, model = 'gemini/gemini-2.5-pro', temperature = 0.8 }) {
  const key = process.env.EMERGENT_LLM_KEY;
  if (!key) throw new Error('EMERGENT_LLM_KEY missing');
  const res = await fetch('https://integrations.emergentagent.com/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM error ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
