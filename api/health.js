/** Vercel Serverless — Health check */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    provider: process.env.API_PROVIDER || 'deepseek',
    hasKey: !!process.env.API_KEY,
  });
};
