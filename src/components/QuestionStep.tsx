import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { QuestionType } from '../engine/types';
import { useLiuyaoStore } from '../store/useLiuyaoStore';

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: '财运', label: '财运', icon: '💰' },
  { value: '事业', label: '事业', icon: '💼' },
  { value: '感情', label: '感情', icon: '💕' },
  { value: '婚姻', label: '婚姻', icon: '💍' },
  { value: '求职', label: '求职', icon: '📋' },
  { value: '考试', label: '考试', icon: '📚' },
  { value: '出行', label: '出行', icon: '✈️' },
  { value: '投资', label: '投资', icon: '📈' },
  { value: '疾病', label: '疾病', icon: '🏥' },
  { value: '官司', label: '官司', icon: '⚖️' },
  { value: '生育', label: '生育', icon: '👶' },
  { value: '家庭', label: '家庭', icon: '🏠' },
  { value: '失物', label: '失物', icon: '🔍' },
  { value: '天气', label: '天气', icon: '🌤️' },
  { value: '其他', label: '其他', icon: '🔮' },
];

const BAGUA = ['☰','☱','☲','☳','☴','☵','☶','☷'];

export default function QuestionStep() {
  const { question, questionType, setQuestion, startToss } = useLiuyaoStore();
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!question.trim()) { setError('请输入您想问的问题'); return; }
    setError('');
    startToss();
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 py-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* ====== HERO: Animated Tai Chi + Orbiting Trigrams ====== */}
      <div className="relative flex items-center justify-center mb-10" style={{ height: 260 }}>
        {/* Outer glow ring — CSS animation for stability */}
        <div
          className="absolute rounded-full"
          style={{
            width: 220, height: 220,
            border: '1px solid rgba(232,185,49,0.3)',
            boxShadow: '0 0 60px rgba(232,185,49,0.2), 0 0 120px rgba(232,185,49,0.08), inset 0 0 60px rgba(232,185,49,0.05)',
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />

        {/* Second ring — CSS */}
        <div
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            border: '1px dashed rgba(232,185,49,0.2)',
            animation: 'breathe 4.5s ease-in-out 1s infinite',
          }}
        />

        {/* Static 8 trigrams in a ring */}
        {BAGUA.map((sym, i) => {
          const angle = (i / 8) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const r = 100;
          return (
            <span
              key={i}
              className="absolute text-2xl"
              style={{
                left: `calc(50% + ${Math.cos(rad) * r}px - 0.5em)`,
                top: `calc(50% + ${Math.sin(rad) * r}px - 0.5em)`,
                textShadow: '0 0 15px rgba(232,185,49,0.5)',
                color: i % 2 === 0 ? '#c9a96e' : '#8b7355',
                animation: `symbolFloat ${4 + i * 0.3}s ease-in-out ${i * 0.5}s infinite`,
              }}
            >
              {sym}
            </span>
          );
        })}

        {/* Center: Tai Chi symbol — Framer Motion for entrance only, CSS for rotation */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          style={{ width: 140, height: 140 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.1, type: 'spring', stiffness: 80 }}
        >
          <div style={{
            width: '100%', height: '100%',
            animation: 'slowSpin 25s linear infinite',
          }}>
            <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(232,185,49,0.3))' }}>
              <circle cx="100" cy="100" r="99" fill="none" stroke="#c9a96e" strokeWidth="1.5" opacity="0.6" />
              <path d="M100,1 A99,99 0 0,1 100,199 A49.5,49.5 0 0,1 100,100 A49.5,49.5 0 0,0 100,1 Z" fill="#f0e6d3" opacity="0.5" />
              <path d="M100,1 A99,99 0 0,0 100,199 A49.5,49.5 0 0,0 100,100 A49.5,49.5 0 0,1 100,1 Z" fill="#1a0f04" opacity="0.7" />
              <circle cx="100" cy="50.5" r="12" fill="#1a0f04" opacity="0.7" />
              <circle cx="100" cy="50.5" r="4" fill="#f0e6d3" opacity="0.8" />
              <circle cx="100" cy="149.5" r="12" fill="#f0e6d3" opacity="0.5" />
              <circle cx="100" cy="149.5" r="4" fill="#1a0f04" opacity="0.7" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* ====== TITLE ====== */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1
            className="text-5xl md:text-6xl font-serif font-bold mb-3 tracking-[0.15em]"
            style={{
              background: 'linear-gradient(180deg, #f5e6c8 0%, #c9a96e 40%, #8b6914 70%, #6b4e0a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(232,185,49,0.3))',
            }}
          >
            六爻占卜
          </h1>
        </motion.div>
        <motion.p
          className="text-[#8b7355] text-lg font-serif tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          纳甲筮法 · 以通神明之德
        </motion.p>
        <motion.div
          className="mt-3 mx-auto h-px max-w-[200px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(232,185,49,0.4), transparent)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        />
      </div>

      {/* ====== QUESTION TYPE: Floating cards ====== */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <label className="block text-sm font-medium text-[#8b7355] mb-3 ml-1 tracking-wider">
          请选择所问之事
        </label>
        <div className="grid grid-cols-5 gap-2">
          {QUESTION_TYPES.map(({ value, label, icon }, i) => (
            <motion.button
              key={value}
              type="button"
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setQuestion(question, value)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.03 }}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl text-sm transition-all duration-300 ${
                questionType === value
                  ? 'bg-gradient-to-br from-[#b87915] to-[#d99c1c] text-[#1a1208] font-bold shadow-lg shadow-[rgba(184,121,21,0.4)] border border-[#e8b931]'
                  : 'bg-[rgba(20,14,8,0.55)] border border-[rgba(184,160,128,0.2)] text-[#b8a080] hover:border-[rgba(232,185,49,0.4)] hover:bg-[rgba(30,22,12,0.7)] hover:shadow-[0_0_20px_rgba(232,185,49,0.08)]'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ====== INPUT ====== */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <label className="block text-sm font-medium text-[#8b7355] mb-3 ml-1 tracking-wider">
          默念您的问题
        </label>
        <div className="relative group">
          {/* Golden border glow on focus */}
          <motion.div
            className="absolute -inset-[2px] rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(232,185,49,0.4), rgba(200,140,40,0.2), rgba(232,185,49,0.4))',
              filter: 'blur(4px)',
              zIndex: -1,
            }}
          />
          <textarea
            value={question}
            onChange={(e) => { setQuestion(e.target.value, questionType); if (error) setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="诚心默念您的问题，如：我今年的事业运势如何？"
            rows={3}
            className="w-full px-5 py-4 rounded-xl border border-[rgba(184,160,128,0.25)] bg-[rgba(15,8,3,0.7)] text-[#f0e6d3] placeholder-[#5a4a32] focus:outline-none focus:ring-2 focus:ring-[rgba(232,185,49,0.5)] focus:border-transparent resize-none transition-all font-serif text-lg backdrop-blur-sm"
          />
          {/* Input bottom glow line */}
          <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(232,185,49,0.3)] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-sm mt-2 ml-1">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ====== SUBMIT BUTTON ====== */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.0 }}
      >
        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(232,185,49,0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="relative inline-flex items-center gap-2 px-14 py-5 rounded-2xl font-serif text-xl font-bold overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #c17a2e 0%, #d99c1c 30%, #e8b931 60%, #d99c1c 100%)',
            color: '#1a0f02',
            boxShadow: '0 8px 40px rgba(232,185,49,0.25)',
          }}
        >
          {/* Button shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
          <Sparkles size={22} className="relative z-10" />
          <span className="relative z-10 tracking-wider">开始起卦</span>
          <ChevronRight size={22} className="relative z-10" />
        </motion.button>

        <motion.p
          className="mt-4 text-[#5a4a32] text-sm font-serif tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          起卦前请静心凝神，心诚则灵
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
