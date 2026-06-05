import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, CheckCheck, AlertCircle, WifiOff } from 'lucide-react';
import type { PaiPanResult } from '../engine/types';
import { buildInterpretationPrompt, buildInterpretationSystemPrompt } from '../engine/interpretation';
import { generateLocalInterpretation } from '../engine/localInterpretation';

interface Props {
  paiPan: PaiPanResult;
  question: string;
}

export default function InterpretationPanel({ paiPan, question }: Props) {
  const [interpretation, setInterpretation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [usingLocal, setUsingLocal] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    setInterpretation('');
    setUsingLocal(false);

    const systemPrompt = buildInterpretationSystemPrompt();
    const userPrompt = buildInterpretationPrompt(paiPan, question);

    // On GitHub Pages: try Cloudflare Worker first, then Vercel
    const isGitHubPages = window.location.hostname.includes('github.io');
    const apiEndpoints = isGitHubPages
      ? [
          'https://liuyao-api.ma16629312300.workers.dev',            // Cloudflare Worker (root path)
          'https://liuyao-xi.vercel.app/api/interpret',              // Vercel fallback
        ]
      : ['/api/interpret'];                                          // Local proxy

    let cloudSuccess = false;

    for (const url of apiEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, userPrompt }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `服务器错误 (${response.status})`);
        }

        const data = await response.json();
        if (!data.text) throw new Error('AI 返回空响应');

        setInterpretation(data.text);
        cloudSuccess = true;
        break; // stop trying other endpoints
      } catch (err: any) {
        console.warn(`API ${base} 不可用:`, err.message);
        continue; // try next endpoint
      }
    }

    // All cloud APIs failed, fall back to local
    if (!cloudSuccess) {
      console.warn('所有云端 API 不可用，切换为本地解卦');
      setUsingLocal(true);
      setError('云端连接暂不可用，已切换本地推演');
      const localResult = generateLocalInterpretation(paiPan, question);
      setInterpretation(localResult);
    }

    setIsGenerating(false);
  }, [paiPan, question]);

  const handleCopy = () => {
    navigator.clipboard.writeText(interpretation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="bg-[rgba(20,14,8,0.6)] backdrop-blur-xl rounded-2xl border border-[rgba(184,160,128,0.15)] shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="px-6 py-4 bg-gradient-to-r from-[rgba(232,185,49,0.1)]/80 to-[rgba(30,22,14,0.5)]/60 border-b border-[rgba(184,160,128,0.1)] flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold text-[#f0e6d3]">解卦分析</h3>
        {!interpretation && !isGenerating && (
          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            <Sparkles size={16} />
            开始解卦
          </motion.button>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              className="flex flex-col items-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 八卦旋转加载动画 */}
              <motion.div
                className="relative w-20 h-20 mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-serif text-gold-500/60">
                  ☯
                </div>
              </motion.div>
              {/* 外层反向旋转 */}
              <motion.div
                className="absolute w-28 h-28"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              >
                {['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((sym, i) => {
                  const angle = (i * 45 * Math.PI) / 180;
                  const r = 50;
                  const x = 14 + r + r * Math.cos(angle);
                  const y = 14 + r + r * Math.sin(angle);
                  return (
                    <span
                      key={i}
                      className="absolute text-xs text-gold-400/40"
                      style={{ left: x, top: y }}
                    >
                      {sym}
                    </span>
                  );
                })}
              </motion.div>
              <p className="mt-8 text-[#8b7355] font-serif text-base">天机推演中，请静心等候...</p>
              <p className="text-xs text-[#6b5c44] mt-1">心诚则灵，卦象自现</p>
            </motion.div>
          )}

          {!isGenerating && !interpretation && (
            <div className="text-center py-12 text-[#6b5c44]">
              <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
              <p>诚心默念问题，点击解卦，天人感应</p>
              <p className="text-xs mt-1">云端不可用时自动切换本地推演</p>
            </div>
          )}

          {interpretation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error && (
                <div className="mb-4 px-4 py-3 bg-[rgba(251,191,36,0.08)]/80 border border-[rgba(251,191,36,0.15)] rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      云端连接暂不可用，已切换本地推演
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {usingLocal && (
                <div className="mb-4 px-4 py-3 bg-[rgba(30,22,14,0.5)]/80 border border-[rgba(184,160,128,0.2)] rounded-xl flex items-start gap-3">
                  <WifiOff size={18} className="text-[#8b7355] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#c9a96e]">本地推演模式</p>
                    <p className="text-xs text-[#8b7355]">
                      配置密钥后将启用云端推演，洞察更深
                    </p>
                  </div>
                </div>
              )}

              <div className="prose prose-antique max-w-none text-[#d4c0a0] leading-relaxed font-serif text-sm whitespace-pre-wrap">
                {interpretation}
              </div>

              <div className="mt-6 pt-4 border-t border-[rgba(184,160,128,0.1)] flex items-center justify-between">
                <span className="text-xs text-[#4a3d2e]">
                  {usingLocal ? '📍 本地推演' : '☁️ 云端推演'}
                </span>
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b7355] hover:text-[#c9a96e] bg-[rgba(30,22,14,0.5)] hover:bg-[rgba(35,25,16,0.6)] rounded-lg transition-colors"
                >
                  {copied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? '已复制' : '复制结果'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
