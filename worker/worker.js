/**
 * Cloudflare Worker — AI 解卦 API 代理
 * 部署在 Cloudflare 边缘网络，中国可访问
 */
export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      });
    }

    try {
      const { systemPrompt, userPrompt } = await request.json();

      if (!systemPrompt || !userPrompt) {
        return new Response(JSON.stringify({ error: 'Missing prompts' }), {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
      }

      if (!env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY not configured' }), {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
      }

      const provider = env.API_PROVIDER || 'deepseek';
      const baseUrl = env.API_BASE_URL || 'https://api.deepseek.com';
      const model = env.API_MODEL || 'deepseek-chat';

      let body;
      if (provider === 'claude') {
        body = {
          model,
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        };
      } else {
        body = {
          model,
          max_tokens: 512,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        };
      }

      const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.API_KEY}`,
          ...(provider === 'claude' ? { 'anthropic-version': '2023-06-01' } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return new Response(JSON.stringify({ error: `AI API error (${resp.status})` }), {
          status: resp.status,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
      }

      const data = await resp.json();
      let text = '';
      if (provider === 'claude') {
        text = data.content?.[0]?.text || '';
      } else {
        text = data.choices?.[0]?.message?.content || '';
      }

      return new Response(JSON.stringify({ text }), {
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error: ' + err.message }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      });
    }
  },
};
