/**
 * Vercel Serverless Function — AI 解卦 API
 *
 * Deploy: push to GitHub → import to Vercel → set env vars:
 *   API_PROVIDER=deepseek
 *   API_KEY=your-api-key
 *   API_BASE_URL=https://api.deepseek.com
 *   API_MODEL=deepseek-chat
 */

export default async function handler(req, res) {
  // CORS
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
      return res.status(400).json({ error: '缺少 systemPrompt 或 userPrompt' });
    }

    const API_PROVIDER = process.env.API_PROVIDER || 'deepseek';
    const API_KEY = process.env.API_KEY || '';
    const API_BASE_URL = process.env.API_BASE_URL || 'https://api.deepseek.com';
    const API_MODEL = process.env.API_MODEL || 'deepseek-chat';

    if (!API_KEY) {
      return res.status(500).json({ error: '服务器未配置 API_KEY' });
    }

    let body;
    if (API_PROVIDER === 'claude') {
      body = {
        model: API_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      };
    } else {
      body = {
        model: API_MODEL,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };
    }

    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
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
      return res.status(response.status).json({ error: `AI API 返回错误 (${response.status})` });
    }

    const data = await response.json();

    let text = '';
    if (API_PROVIDER === 'claude') {
      text = data.content?.[0]?.text || '';
    } else {
      text = data.choices?.[0]?.message?.content || '';
    }

    if (!text) {
      return res.status(500).json({ error: 'AI 返回空响应' });
    }

    res.json({ text });
  } catch (err) {
    console.error('[Server Error]', err);
    res.status(500).json({ error: '服务器内部错误: ' + (err.message || '未知错误') });
  }
}
