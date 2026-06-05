import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ====== Serve static files in production ======
const distPath = resolve(__dirname, '..', 'dist');
if (!isDev && existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`📁 提供静态文件: ${distPath}`);
}

// ====== AI API Proxy ======

const API_PROVIDER = (process.env.API_PROVIDER || 'deepseek').trim();
const API_KEY = (process.env.API_KEY || '').trim();
const API_BASE_URL = (process.env.API_BASE_URL || 'https://api.deepseek.com').trim();
const API_MODEL = (process.env.API_MODEL || 'deepseek-chat').trim();

app.post('/api/interpret', async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: '缺少 systemPrompt 或 userPrompt' });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: '服务器未配置 API_KEY，请在 .env 文件中设置' });
    }

    // Build request body based on provider
    let body;
    if (API_PROVIDER === 'claude') {
      body = {
        model: API_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      };
    } else {
      // DeepSeek & OpenAI compatible format
      body = {
        model: API_MODEL,
        max_tokens: 2048,
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
      return res.status(response.status).json({
        error: `AI API 返回错误 (${response.status})。请检查 API_KEY 和网络连接。`,
      });
    }

    const data = await response.json();

    // Extract text from response
    let text = '';
    if (API_PROVIDER === 'claude') {
      text = data.content?.[0]?.text || '';
    } else {
      text = data.choices?.[0]?.message?.content || '';
    }

    if (!text) {
      return res.status(500).json({ error: 'AI 返回空响应，请重试' });
    }

    res.json({ text });
  } catch (err) {
    console.error('[Server Error]', err);
    res.status(500).json({ error: '服务器内部错误: ' + (err.message || '未知错误') });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: API_PROVIDER,
    hasKey: !!API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`🔮 六爻 API 后端已启动: http://localhost:${PORT}`);
  console.log(`   AI 提供商: ${API_PROVIDER}`);
  console.log(`   模型: ${API_MODEL}`);
  console.log(`   API Key 已配置: ${API_KEY ? '✅ 是' : '❌ 否（请设置 .env）'}`);
});

// SPA fallback: all non-API routes serve index.html
if (!isDev) {
  app.get('*', (_req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}
