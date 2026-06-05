/**
 * Vercel Serverless Function — AI 解卦 API
 *
 * Environment variables (set in Vercel dashboard):
 *   API_PROVIDER=deepseek
 *   API_KEY=sk-xxx
 *   API_BASE_URL=https://api.deepseek.com
 *   API_MODEL=deepseek-chat
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing systemPrompt or userPrompt' });
    }

    const API_PROVIDER = (process.env.API_PROVIDER || 'deepseek').trim();
    const API_KEY = (process.env.API_KEY || '').trim();
    const API_BASE_URL = (process.env.API_BASE_URL || 'https://api.deepseek.com').trim();
    const API_MODEL = (process.env.API_MODEL || 'deepseek-chat').trim();

    if (!API_KEY) {
      return res.status(500).json({ error: 'API_KEY not configured. Please set env vars in Vercel and redeploy.' });
    }

    let body;
    if (API_PROVIDER === 'claude') {
      body = {
        model: API_MODEL,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      };
    } else {
      body = {
        model: API_MODEL,
        max_tokens: 512,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    }

    const apiUrl = new URL('/v1/chat/completions', API_BASE_URL);
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        ...(API_PROVIDER === 'claude' ? { 'anthropic-version': '2023-06-01' } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[API Error] ${response.status}: ${errText}`);
      return res.status(response.status).json({ error: `AI API error (${response.status})` });
    }

    const data = await response.json();

    let text = '';
    if (API_PROVIDER === 'claude') {
      text = data.content?.[0]?.text || '';
    } else {
      text = data.choices?.[0]?.message?.content || '';
    }

    if (!text) {
      return res.status(500).json({ error: 'AI returned empty response' });
    }

    return res.json({ text });
  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal server error: ' + (err.message || 'unknown') });
  }
}
