// Calls the Google Gemini API directly.
// Default model: gemini-2.5-flash

export async function llmChat({ messages, model = 'gemini-2.5-flash', temperature = 0.8 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing');

  // Convert OpenAI-style messages to Gemini style
  let systemInstruction;
  const contents = [];
  
  for (const m of messages) {
    if (m.role === 'system') {
      systemInstruction = { parts: [{ text: m.content }] };
    } else {
      const role = m.role === 'user' ? 'user' : 'model';
      contents.push({ role, parts: [{ text: m.content }] });
    }
  }

  const payload = {
    contents,
    generationConfig: { temperature },
  };
  
  if (systemInstruction) {
    payload.systemInstruction = systemInstruction;
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini LLM error ${res.status}: ${t}`);
  }
  
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
