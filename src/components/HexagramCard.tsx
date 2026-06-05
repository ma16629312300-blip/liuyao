import { motion } from 'framer-motion';
import type { YaoLine, Hexagram } from '../engine/types';

interface Props {
  hexagram: Hexagram;
  changingLines: number[];
  label?: string;
}

const TRIGRAM_SYMBOLS: Record<string, string> = {
  '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
  '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷',
};

export default function HexagramCard({ hexagram, changingLines, label }: Props) {
  const hasChanging = changingLines.length > 0;

  return (
    <motion.div
      className="relative bg-[rgba(20,14,8,0.6)] backdrop-blur-xl rounded-2xl border border-[rgba(184,160,128,0.15)] p-6 shadow-lg overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ boxShadow: '0 8px 40px rgba(80,40,10,0.1)' }}
    >
      {/* Top accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      {/* Card hover — subtle warm border pulse */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          boxShadow: 'inset 0 0 30px rgba(232,185,49,0.06)',
          border: '1px solid rgba(232,185,49,0.12)',
        }}
      />

      {/* Header */}
      <div className="text-center mb-5">
        {label && (
          <span className="inline-block text-[10px] text-[#6b5c44] uppercase tracking-[0.2em] mb-1">
            {label}
          </span>
        )}
        <h3 className="text-2xl font-serif font-bold text-[#f0e6d3]">
          <motion.span
            className="mr-2 text-2xl opacity-60 inline-block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {TRIGRAM_SYMBOLS[hexagram.upperTrigram]}
          </motion.span>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {hexagram.name}
          </motion.span>
          <motion.span
            className="ml-2 text-2xl opacity-60 inline-block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {TRIGRAM_SYMBOLS[hexagram.lowerTrigram]}
          </motion.span>
        </h3>
        <p className="text-sm text-[#8b7355] mt-1">
          {hexagram.upperTrigram}上 {hexagram.lowerTrigram}下 · {hexagram.palace}宫 · 世在{['初','二','三','四','五','上'][hexagram.shiIndex]}
        </p>
      </div>

      {/* Hexagram lines — from top to bottom (上爻→初爻) */}
      <div className="flex flex-col items-center gap-1 py-2">
        {[...hexagram.lines].reverse().map((line, displayIdx) => {
          const isChanging = changingLines.includes(line.index);
          return <YaoLineView key={line.index} line={line} isChanging={isChanging} delay={0.5 + displayIdx * 0.12} />;
        })}
      </div>

      {/* Trigram labels */}
      <div className="flex justify-center gap-1 mt-3 text-3xl opacity-30">
        <span>{TRIGRAM_SYMBOLS[hexagram.lowerTrigram]}</span>
        <span>{TRIGRAM_SYMBOLS[hexagram.upperTrigram]}</span>
      </div>

      {/* Description */}
      <div className="mt-4 pt-4 border-t border-[rgba(184,160,128,0.06)]">
        <p className="text-sm text-[#b8a080] leading-relaxed text-center font-serif italic">
          {hexagram.description}
        </p>
        {hexagram.image && (
          <p className="text-xs text-[#6b5c44] mt-1.5 text-center">
            象曰：{hexagram.image}
          </p>
        )}
      </div>

      {/* Changing lines note */}
      {hasChanging && (
        <motion.div
          className="mt-4 px-4 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.12)] rounded-xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-[#f87171] font-serif">
            动爻：{changingLines.map(i => ['初','二','三','四','五','上'][i]).join('、')}
            <span className="text-red-400 text-xs ml-1">
              ({changingLines.length}爻动)
            </span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// Single Yao Line — Ink-brush stroke drawing animation
// ============================================================

function YaoLineView({ line, isChanging, delay }: { line: YaoLine; isChanging: boolean; delay: number }) {
  const positionLabel = ['初', '二', '三', '四', '五', '上'][line.index];

  return (
    <motion.div
      className="flex items-center gap-3 h-12 group/line"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Position label — fades in */}
      <motion.span
        className="w-7 text-right text-xs font-medium text-[#6b5c44] shrink-0 font-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.15 }}
      >
        {positionLabel}
      </motion.span>

      {/* Line graphic */}
      <div className="flex-1 flex items-center justify-center relative h-12">
        {line.isYang ? (
          <YangLine isChanging={isChanging} delay={delay} />
        ) : (
          <YinLine isChanging={isChanging} delay={delay} />
        )}

        {/* Changing marker circle */}
        {isChanging && (
          <motion.div
            className="absolute -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-[#f87171]"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.6, type: 'spring', stiffness: 300 }}
          >
            ×
          </motion.div>
        )}
      </div>

      {/* Attribute tags */}
      <motion.div
        className="flex items-center gap-1.5 w-24 shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.4 }}
      >
        {line.isShi && (
          <span className="px-1.5 py-0.5 rounded-md bg-[rgba(232,185,49,0.8)] text-white text-[10px] font-bold shadow-sm">世</span>
        )}
        {line.isYing && (
          <span className="px-1.5 py-0.5 rounded-md bg-[rgba(16,185,129,0.8)] text-white text-[10px] font-bold shadow-sm">应</span>
        )}
        <span className="text-xs text-[#8b7355] font-serif truncate">
          {line.liuqin}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Yang line (solid) — carves from center outward + ink glow
// ============================================================

function YangLine({ isChanging, delay }: { isChanging: boolean; delay: number }) {
  return (
    <div className="relative w-full max-w-[140px] h-6 flex items-center justify-center">
      {/* Ink trail — darker base that stays */}
      <motion.div
        className="absolute h-1.5 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #6b5c44 0%, #b89360 50%, #6b5c44 100%)',
          width: '100%',
          maxWidth: 140,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
        // ease: custom cubic-bezier for brush-like feel — fast start, slow settle
      />

      {/* Brush tip glow — bright streak that fades */}
      <motion.div
        className="absolute h-1 rounded-full"
        style={{
          background: 'linear-gradient(90deg, rgba(255,220,150,0.7) 0%, rgba(232,185,49,0.4) 50%, transparent 100%)',
          width: 60,
          filter: 'blur(2px)',
        }}
        initial={{ scaleX: 0, opacity: 0, x: -30 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0], x: [-20, 10, 60] }}
        transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      />

      {/* Ink splash at stroke end */}
      <motion.div
        className="absolute right-0 w-3 h-1.5 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232,185,49,0.5) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: delay + 0.35, ease: 'easeOut' }}
      />

      {/* Changing line pulse glow */}
      {isChanging && (
        <motion.div
          className="absolute inset-x-0 h-1.5 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: 2.5, delay: delay + 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'rgba(239,68,68,0.35)',
            filter: 'blur(5px)',
            transform: 'scale(1, 2)',
          }}
        />
      )}

      {/* Subtle shimmer along the line */}
      {!isChanging && (
        <motion.div
          className="absolute h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,220,150,0.3) 50%, transparent 100%)',
            width: 40,
          }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: [0, 100], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, delay: delay + 1, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

// ============================================================
// Yin line (broken) — two halves carve from center outward
// ============================================================

function YinLine({ isChanging, delay }: { isChanging: boolean; delay: number }) {
  return (
    <div className="w-full max-w-[140px] flex items-center gap-5 justify-center relative h-6">
      {/* Left half */}
      <motion.div className="relative" style={{ width: 48, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ink base */}
        <motion.div
          className="absolute h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6b5c44 0%, #b89360 70%)',
            width: 48,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
          // origin from the gap side (center)
          style={{ transformOrigin: 'right center', width: 48 }}
        />
        {/* Brush glow trail */}
        <motion.div
          className="absolute h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(255,220,150,0.6) 0%, rgba(232,185,49,0.3) 50%, transparent 100%)',
            width: 36,
            filter: 'blur(2px)',
            right: 0,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay, ease: 'easeOut' }}
          style={{ transformOrigin: 'right center' }}
        />
      </motion.div>

      {/* Right half */}
      <motion.div className="relative" style={{ width: 48, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ink base */}
        <motion.div
          className="absolute h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #b89360 30%, #6b5c44 100%)',
            width: 48,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.15, ease: [0.25, 0.1, 0.25, 1.0] }}
          style={{ transformOrigin: 'left center', width: 48 }}
        />
        {/* Brush glow trail */}
        <motion.div
          className="absolute h-1 rounded-full"
          style={{
            background: 'linear-gradient(270deg, rgba(255,220,150,0.6) 0%, rgba(232,185,49,0.3) 50%, transparent 100%)',
            width: 36,
            filter: 'blur(2px)',
            left: 0,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: delay + 0.15, ease: 'easeOut' }}
          style={{ transformOrigin: 'left center' }}
        />
      </motion.div>

      {/* Changing line glow */}
      {isChanging && (
        <>
          <motion.div
            className="absolute left-0 w-[48px] h-1.5 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.5, delay: delay + 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'rgba(239,68,68,0.3)',
              filter: 'blur(5px)',
              transform: 'scale(1, 2)',
            }}
          />
          <motion.div
            className="absolute right-0 w-[48px] h-1.5 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.5, delay: delay + 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'rgba(239,68,68,0.3)',
              filter: 'blur(5px)',
              transform: 'scale(1, 2)',
            }}
          />
        </>
      )}

      {/* Subtle shimmer */}
      {!isChanging && (
        <>
          <motion.div
            className="absolute left-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,220,150,0.25) 100%)',
              width: 20,
            }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [0, 28], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2.5, delay: delay + 1.5, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 h-1 rounded-full"
            style={{
              background: 'linear-gradient(270deg, transparent 0%, rgba(255,220,150,0.25) 100%)',
              width: 20,
            }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [-28, 0], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2.5, delay: delay + 1.8, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  );
}
