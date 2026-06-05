import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useLiuyaoStore } from '../store/useLiuyaoStore';
import HexagramCard from './HexagramCard';
import PaiPanTable from './PaiPanTable';
import InterpretationPanel from './InterpretationPanel';

// ============================================================
// GOLDEN SEAL REVEAL — Dramatic opening ritual
// ============================================================

function RevealOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
    >
      {/* Dark flash */}
      <motion.div
        className="absolute inset-0"
        style={{ background: '#0a0602' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Outer shockwave ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          width: 80, height: 80,
          borderColor: 'rgba(232,185,49,0.8)',
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 16, opacity: 0 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />

      {/* Second delayed ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: 60, height: 60,
          borderColor: 'rgba(232,185,49,0.5)',
        }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 12, opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
      />

      {/* Center golden light burst */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,220,150,0.9) 0%, rgba(232,185,49,0.5) 25%, rgba(200,140,40,0.1) 60%, transparent 100%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Vertical light beam */}
      <motion.div
        className="absolute"
        style={{
          width: 4, height: '100vh',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,220,150,0.9) 30%, rgba(255,220,150,1) 50%, rgba(255,220,150,0.9) 70%, transparent 100%)',
          filter: 'blur(8px)',
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: [0, 1, 0.5, 0] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Horizontal sweep */}
      <motion.div
        className="absolute"
        style={{
          width: '100vw', height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,220,150,0.8) 40%, rgba(255,220,150,1) 50%, rgba(255,220,150,0.8) 60%, transparent 100%)',
          filter: 'blur(4px)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0.3, 0] }}
        transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
      />

      {/* Center ritual symbol */}
      <motion.div
        className="relative z-10 text-6xl"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], rotate: 0, opacity: [0, 1, 0.6] }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      >
        <span
          className="inline-block"
          style={{
            textShadow: '0 0 40px rgba(255,220,150,0.8), 0 0 80px rgba(232,185,49,0.5)',
          }}
        >
          ☯
        </span>
      </motion.div>

      {/* Particle sparks */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 120 + Math.random() * 200;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: `hsl(${35 + Math.random() * 15}, ${80 + Math.random() * 20}%, ${55 + Math.random() * 30}%)`,
              boxShadow: `0 0 6px rgba(255,220,150,0.7)`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1 + Math.random() * 0.8,
              delay: 0.3 + Math.random() * 0.3,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </motion.div>
  );
}

// ============================================================
// RESULT VIEW
// ============================================================

export default function ResultView() {
  const { paiPan, question, goToStep, reset, saveToHistory } = useLiuyaoStore();
  const [showReveal, setShowReveal] = useState(true);

  const handleNewReading = () => {
    if (paiPan) {
      saveToHistory({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
        question,
        questionType: paiPan.questionType,
        paiPan,
      });
    }
    reset();
  };

  const handleBackToToss = () => {
    goToStep('toss');
  };

  if (!paiPan) {
    return (
      <div className="text-center py-20 text-[#6b5c44]">
        排盘数据缺失，请重新起卦
        <button onClick={reset} className="block mx-auto mt-4 text-gold-600 underline">
          返回首页
        </button>
      </div>
    );
  }

  const { originalHexagram, changedHexagram, changingLines } = paiPan;

  return (
    <>
      {/* Golden reveal overlay — one-time on mount */}
      <AnimatePresence>
        {showReveal && <RevealOverlay onComplete={() => setShowReveal(false)} />}
      </AnimatePresence>

      <motion.div
        className="max-w-5xl mx-auto px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: showReveal ? 1.5 : 0 }}
      >
        {/* Top bar */}
        <motion.div
          className="flex items-center justify-between mb-6 flex-wrap gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: showReveal ? 1.6 : 0.2 }}
        >
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#f0e6d3]">排盘结果</h2>
            <p className="text-sm text-[#8b7355] mt-1">
              问题：{question}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleBackToToss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[rgba(20,14,8,0.6)] border border-[rgba(184,160,128,0.25)] text-[#b8a080] rounded-xl text-sm hover:bg-[rgba(30,22,14,0.5)] transition-colors"
            >
              <ArrowLeft size={16} />
              重新摇卦
            </motion.button>
            <motion.button
              onClick={handleNewReading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-xl text-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <RotateCcw size={16} />
              新的占卜
            </motion.button>
          </div>
        </motion.div>

        {/* Hexagrams — staggered entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showReveal ? 1.7 : 0.3 }}
          >
            <HexagramCard
              hexagram={originalHexagram}
              changingLines={changingLines}
              label="本卦"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showReveal ? 1.9 : 0.4 }}
          >
            {changedHexagram ? (
              <HexagramCard
                hexagram={changedHexagram}
                changingLines={[]}
                label="变卦"
              />
            ) : (
              <div className="flex items-center justify-center bg-[rgba(30,22,14,0.5)] rounded-2xl border border-[rgba(184,160,128,0.2)] p-6 h-full min-h-[200px]">
                <div className="text-center text-[#6b5c44]">
                  <div className="text-4xl mb-2">☯</div>
                  <p className="font-serif">静卦无变</p>
                  <p className="text-xs mt-1">此卦无动爻，以本卦为主</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 排盘 Table — staggered */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: showReveal ? 2.1 : 0.5 }}
        >
          <PaiPanTable paiPan={paiPan} />
        </motion.div>

        {/* Interpretation — staggered */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: showReveal ? 2.3 : 0.6 }}
        >
          <InterpretationPanel paiPan={paiPan} question={question} />
        </motion.div>
      </motion.div>
    </>
  );
}
