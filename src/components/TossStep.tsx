import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { TossResult, PaiPanResult, SiXiang } from '../engine/types';
import { tossThreeCoins, siXiangLabel, siXiangSymbol } from '../engine/toss';
import { buildYaoLines } from '../engine/toss';
import { getHexagrams, getChangingLines } from '../engine/hexagram';
import { applyNajiaV2 } from '../engine/najia';
import { applyLiuQin } from '../engine/liuqin';
import { applyLiuShou } from '../engine/liushou';
import { getYongShen } from '../engine/yongshen';
import { applyWangShuai } from '../engine/wangshuai';
import { getMonthDayInfo } from '../engine/calendar';
import { applyXunKong } from '../engine/xunkong';
import { findFuShen } from '../engine/fushen';
import { getHexagramRelation, getAdvanceRetreat } from '../engine/hexagramRelation';
import { useLiuyaoStore } from '../store/useLiuyaoStore';

const POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// Classical I Ching incantations
const INCANTATIONS = [
  '天行健，君子以自强不息',
  '地势坤，君子以厚德载物',
  '云行雨施，品物流形',
  '日月运行，一寒一暑',
  '乾道变化，各正性命',
  '保合太和，乃利贞',
  '首出庶物，万国咸宁',
  '元亨利贞，自天佑之',
];

// ============================================================
// CINEMATIC COIN TOSS
// ============================================================

export default function TossStep() {
  const store = useLiuyaoStore();
  const { tosses } = store;
  const [phase, setPhase] = useState<'ready' | 'charging' | 'flying' | 'reveal'>('ready');
  const [revealedResult, setRevealedResult] = useState<ReturnType<typeof tossThreeCoins> | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [incantation, setIncantation] = useState('');
  const tossBtnRef = useRef<HTMLButtonElement>(null);
  const completeBtnRef = useRef<HTMLButtonElement>(null);

  const callbacksRef = useRef<{ doToss: () => void; complete: () => void }>({
    doToss: () => {},
    complete: () => {},
  });

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (tosses.length < 6 && phase === 'ready') {
          callbacksRef.current.doToss();
        } else if (tosses.length === 6 && phase === 'ready') {
          callbacksRef.current.complete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tosses.length, phase]);

  // Auto-focus
  useEffect(() => {
    if (phase === 'ready') {
      if (tosses.length < 6) tossBtnRef.current?.focus();
      else completeBtnRef.current?.focus();
    }
  }, [phase, tosses.length]);

  const doToss = useCallback(() => {
    if (phase !== 'ready') return;
    if (tosses.length >= 6) return;

    // Pick a random incantation
    setIncantation(INCANTATIONS[Math.floor(Math.random() * INCANTATIONS.length)]);

    setPhase('charging');
    setRevealedResult(null);

    setTimeout(() => {
      setPhase('flying');
      setTimeout(() => {
        const result = tossThreeCoins();
        setRevealedResult(result);
        setPhase('reveal');
        setShakeKey(k => k + 1);
        setFlashKey(k => k + 1);

        setTimeout(() => {
          const tossResult: TossResult = {
            round: tosses.length + 1,
            coinValues: result.coinValues,
            total: result.total,
            siXiang: result.siXiang,
          };
          store.recordToss(tossResult);
          setRevealedResult(null);
          setIncantation('');
          setPhase('ready');
        }, 2200);
      }, 1400);
    }, 900);
  }, [phase, tosses.length, store]);

  const completeAndCalculate = useCallback(() => {
    const yaoLines = buildYaoLines(store.tosses);
    const { original, changed } = getHexagrams(yaoLines);
    if (!original) return;

    const monthDay = getMonthDayInfo();
    const changingLineIndices = getChangingLines(yaoLines);

    const najiaLines = applyNajiaV2(original);
    const fullHexagram = { ...original, lines: najiaLines };
    const liuqinLines = applyLiuQin(fullHexagram.lines, fullHexagram.palace);
    const shiYingLines = liuqinLines.map((l, i) => ({
      ...l, isShi: i === fullHexagram.shiIndex, isYing: i === fullHexagram.yingIndex,
    }));
    const liushouLines = applyLiuShou(shiYingLines, monthDay.dayGan);
    const wangshuaiLines = applyWangShuai(liushouLines, monthDay.monthZhi);
    const xunkongLines = applyXunKong(wangshuaiLines, monthDay.dayGanZhi);
    const finalHexagram = { ...fullHexagram, lines: xunkongLines };

    let changedHexagram = null;
    if (changed) {
      const cN = applyNajiaV2(changed);
      const cL = applyLiuQin(cN, changed.palace);
      const cS = cL.map((l, i) => ({ ...l, isShi: i === changed.shiIndex, isYing: i === changed.yingIndex }));
      const cLs = applyLiuShou(cS, monthDay.dayGan);
      const cW = applyWangShuai(cLs, monthDay.monthZhi);
      const cXk = applyXunKong(cW, monthDay.dayGanZhi);
      changedHexagram = { ...changed, lines: cXk };
    }

    const yongShenInfo = getYongShen(store.questionType);
    const yongPositions = finalHexagram.lines
      .map((l, i) => (l.liuqin === yongShenInfo.liuqin ? i : -1))
      .filter(i => i >= 0);
    const yongLineIndex = yongPositions.length > 0 ? yongPositions[0] : null;

    const fushen = yongLineIndex === null
      ? findFuShen(finalHexagram, yongShenInfo.liuqin)
      : [];

    if (fushen.length > 0) {
      for (const fs of fushen) {
        const feiIdx = xunkongLines.findIndex(
          l => l.dizhi === fs.feiYaoDizhi && l.liuqin === fs.feiYaoLiuQin
        );
        if (feiIdx >= 0) {
          xunkongLines[feiIdx] = { ...xunkongLines[feiIdx], feiShen: fs };
        }
      }
    }

    const hexagramRelation = getHexagramRelation(
      original.name, changed?.name || null,
      xunkongLines, changedHexagram?.lines || null, changingLineIndices
    );

    const advanceRetreat = getAdvanceRetreat(
      xunkongLines, changedHexagram?.lines || null, changingLineIndices
    );

    const paiPanResult: PaiPanResult = {
      originalHexagram: { ...finalHexagram, lines: xunkongLines },
      changedHexagram: changedHexagram ? { ...changedHexagram } : null,
      changingLines: changingLineIndices,
      monthDay,
      yongShen: { ...yongShenInfo, lineIndex: yongLineIndex },
      questionType: store.questionType,
      hexagramRelation,
      lineAdvanceRetreat: advanceRetreat,
    };

    store.setPaiPan(paiPanResult);
    store.completeToss();
  }, [store]);

  callbacksRef.current = { doToss, complete: completeAndCalculate };

  const handleAutoToss = () => {
    if (phase !== 'ready') return;
    const remaining = 6 - tosses.length;
    let delay = 0;
    for (let i = 0; i < remaining; i++) {
      setTimeout(() => doToss(), delay);
      delay += 5000;
    }
  };

  const handleReset = () => {
    store.startToss();
    setRevealedResult(null);
    setIncantation('');
    setPhase('ready');
  };

  const allDone = tosses.length === 6 && phase === 'ready';
  const isCharging = phase === 'charging';
  const isFlying = phase === 'flying';
  const isRevealing = phase === 'reveal';

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 py-6 relative z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* ====== AMBIENT OVERLAY — intensifies during ritual ====== */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: isCharging || isFlying
            ? 'radial-gradient(ellipse at center, rgba(232,185,49,0.06) 0%, rgba(10,6,2,0.3) 70%)'
            : 'transparent',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Screen flash */}
      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={`flash-${flashKey}`}
            className="fixed inset-0 pointer-events-none z-20"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              background: revealedResult?.siXiang === '老阳' || revealedResult?.siXiang === '老阴'
                ? 'radial-gradient(ellipse at center, rgba(255,200,100,0.2) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(255,220,150,0.12) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen shake wrapper */}
      <motion.div
        animate={shakeKey > 0 ? { x: [0, -3, 5, -5, 3, -2, 0], y: [0, 2, -3, 1, -1, 0] } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* ====== HEADER — Elaborate ritual circle ====== */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-36 h-36 mb-5">
            {/* Triple ring system */}
            {/* Ring 3 — outermost, slow */}
            <div
              className="absolute rounded-full"
              style={{
                width: 144, height: 144,
                border: '1px solid rgba(232,185,49,0.12)',
                animation: 'slowSpin 40s linear infinite',
              }}
            />
            {/* Ring 2 — middle, opposite direction */}
            <div
              className="absolute rounded-full"
              style={{
                width: 120, height: 120,
                border: '1px solid rgba(232,185,49,0.18)',
                animation: 'slowSpin 25s linear infinite reverse',
              }}
            />

            {/* Charging expansion rings */}
            {isCharging && (
              <>
                <motion.div
                  className="absolute rounded-full border-2 border-gold-400/50"
                  style={{ width: 100, height: 100 }}
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute rounded-full border border-gold-300/40"
                  style={{ width: 80, height: 80 }}
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute rounded-full border border-gold-400/30"
                  style={{ width: 60, height: 60 }}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                />
                {/* Spinning dashed ring */}
                <motion.div
                  className="absolute rounded-full border-2 border-gold-400/50 border-dashed"
                  style={{ width: 130, height: 130 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              </>
            )}

            {/* Flying phase — coin spin halo */}
            {isFlying && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 130, height: 130,
                  border: '2px solid rgba(232,185,49,0.4)',
                  boxShadow: '0 0 30px rgba(232,185,49,0.3), inset 0 0 30px rgba(232,185,49,0.1)',
                }}
                animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.5, repeat: Infinity } }}
              />
            )}

            {/* Inner glow — always present */}
            <div
              className="absolute rounded-full"
              style={{
                width: 90, height: 90,
                background: 'radial-gradient(circle, rgba(232,185,49,0.08) 0%, transparent 70%)',
                animation: 'breathe 3s ease-in-out infinite',
              }}
            />

            {/* Coin icon */}
            <div className="relative z-10 text-5xl">
              <motion.span
                className="inline-block"
                animate={
                  isCharging
                    ? { scale: [1, 1.12, 1] }
                    : isFlying
                    ? { rotateY: [0, 720], scale: [1, 1.2, 1] }
                    : {}
                }
                transition={
                  isCharging
                    ? { duration: 0.25, repeat: 3 }
                    : isFlying
                    ? { duration: 1.4, ease: 'easeInOut' }
                    : {}
                }
                style={{
                  filter: isCharging || isFlying
                    ? 'drop-shadow(0 0 20px rgba(232,185,49,0.6))'
                    : 'drop-shadow(0 0 8px rgba(232,185,49,0.2))',
                }}
              >
                🪙
              </motion.span>
            </div>

            {/* Particle dots on ring 2 */}
            {isCharging && (
              <motion.div
                className="absolute"
                style={{ width: 120, height: 120 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                {[0, 60, 120, 180, 240, 300].map(deg => {
                  const rad = (deg * Math.PI) / 180;
                  const r = 60;
                  return (
                    <div
                      key={deg}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `calc(50% + ${Math.cos(rad) * r}px - 4px)`,
                        top: `calc(50% + ${Math.sin(rad) * r}px - 4px)`,
                        background: '#e8b931',
                        boxShadow: '0 0 8px rgba(232,185,49,0.8)',
                      }}
                    />
                  );
                })}
              </motion.div>
            )}
          </div>

          <h2 className="text-3xl font-serif font-bold text-[#f0e6d3] mb-1">摇卦起卦</h2>
          <p className="text-[#6b5c44] text-sm font-serif">
            诚心默念，感而遂通天下之故
          </p>
        </div>

        {/* ====== INCANTATION TEXT ====== */}
        <AnimatePresence>
          {incantation && (isCharging || isFlying) && (
            <motion.p
              className="text-center text-[#c9a96e] font-serif text-lg tracking-widest mb-6"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.6 }}
              style={{ textShadow: '0 0 15px rgba(232,185,49,0.4)' }}
            >
              {incantation}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ====== YAO PROGRESS INDICATORS ====== */}
        <div className="flex items-center justify-center gap-2.5 mb-8" role="group" aria-label="六爻进度指示器">
          {Array.from({ length: 6 }).map((_, i) => {
            const toss = tosses[i];
            const isCurrentAnim = isFlying && i === tosses.length;
            const isNewlyRevealed = toss && revealedResult && i === tosses.length - 1
              && isRevealing;

            return (
              <motion.div
                key={i}
                role="status"
                aria-label={`${POSITION_NAMES[i]}：${toss ? siXiangLabel(toss.siXiang) : '未摇'}`}
                className={`relative flex flex-col items-center justify-center w-16 h-22 rounded-2xl border-2 transition-all duration-500 ${
                  toss
                    ? toss.siXiang === '老阳' || toss.siXiang === '老阴'
                      ? 'border-red-400/30 bg-[rgba(239,68,68,0.08)] shadow-[0_0_16px_rgba(239,68,68,0.18)]'
                      : 'border-[rgba(232,185,49,0.3)] bg-[rgba(232,185,49,0.05)] shadow-[0_0_12px_rgba(232,185,49,0.12)]'
                    : isCurrentAnim
                      ? 'border-[#e8b931] bg-[rgba(232,185,49,0.15)] scale-110 shadow-[0_0_30px_rgba(232,185,49,0.4)]'
                      : 'border-[rgba(184,160,128,0.15)] bg-[rgba(20,14,8,0.4)]'
                }`}
                animate={
                  isCurrentAnim
                    ? {
                        scale: [1.1, 1.18, 1.1],
                        boxShadow: [
                          '0 0 20px rgba(232,185,49,0.35)',
                          '0 0 45px rgba(232,185,49,0.65)',
                          '0 0 20px rgba(232,185,49,0.35)',
                        ],
                      }
                    : isNewlyRevealed
                    ? { scale: [0.8, 1.3, 1], transition: { duration: 0.6 } }
                    : {}
                }
                transition={{ duration: 0.6, repeat: isCurrentAnim ? Infinity : 0 }}
              >
                <span className="text-[10px] font-medium text-[#6b5c44] mb-1 leading-tight">
                  {POSITION_NAMES[i]}
                </span>
                {toss ? (
                  <motion.span
                    className="text-2xl leading-none"
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    {siXiangSymbol(toss.siXiang)}
                  </motion.span>
                ) : (
                  <motion.span
                    className="text-base text-[#4a3d2e] font-serif"
                    animate={isCurrentAnim ? { opacity: [0.15, 1, 0.15], scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  >
                    ○
                  </motion.span>
                )}

                {/* Changing dot */}
                {toss && (toss.siXiang === '老阳' || toss.siXiang === '老阴') && (
                  <motion.div
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-400/70"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* New reveal glow ring */}
                {isNewlyRevealed && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-gold-400/60"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ====== COIN REVEAL CARD ====== */}
        <AnimatePresence>
          {revealedResult && isRevealing && (
            <motion.div className="text-center mb-6 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
              {/* Expanding impact rings */}
              {[1, 2, 3].map(n => (
                <motion.div
                  key={n}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 80, height: 80,
                    border: `${n === 1 ? 2 : 1}px solid ${
                      revealedResult.siXiang === '老阳' ? 'rgba(255,150,50,0.4)' :
                      revealedResult.siXiang === '老阴' ? 'rgba(150,180,255,0.4)' :
                      'rgba(232,185,49,0.4)'
                    }`,
                    top: 20,
                  }}
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 5 + n * 1.5, opacity: 0 }}
                  transition={{ duration: 1.8, delay: n * 0.15, ease: 'easeOut' }}
                />
              ))}

              {/* Elemental burst particles */}
              <ElementalBurst siXiang={revealedResult.siXiang} />

              {/* Coin card */}
              <motion.div
                className={`inline-flex flex-col items-center gap-4 px-12 py-8 rounded-3xl border-2 backdrop-blur-xl shadow-2xl relative z-10 ${
                  revealedResult.siXiang === '老阳'
                    ? 'border-[rgba(255,150,50,0.35)] bg-[rgba(255,120,20,0.1)] shadow-orange-300/30'
                    : revealedResult.siXiang === '老阴'
                    ? 'border-[rgba(120,160,255,0.3)] bg-[rgba(80,120,220,0.08)] shadow-blue-300/20'
                    : 'border-[rgba(232,185,49,0.3)] bg-[rgba(20,14,8,0.65)] shadow-gold-200/30'
                }`}
                initial={{ scale: 0.4, y: 80, opacity: 0, rotateX: 30 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 13 }}
              >
                {/* 3 Coins — bigger, more dramatic */}
                <div className="flex gap-6">
                  {revealedResult.coinValues.map((v, i) => {
                    const isYang = v === 3;
                    return (
                      <motion.div
                        key={i}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl ${
                          isYang
                            ? 'bg-gradient-to-br from-yellow-200 via-gold-400 to-amber-600 text-white shadow-gold-400/50'
                            : 'bg-gradient-to-br from-stone-200 via-stone-400 to-stone-600 text-stone-700 shadow-stone-400/30'
                        }`}
                        style={{
                          boxShadow: isYang
                            ? '0 8px 30px rgba(232,185,49,0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
                            : '0 8px 25px rgba(100,100,100,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
                        }}
                        initial={{ rotateX: 1200, y: -100, opacity: 0, scale: 0.3 }}
                        animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{
                          type: 'spring', stiffness: 100, damping: 9,
                          delay: 0.1 * i,
                        }}
                      >
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                        >
                          {isYang ? '正' : '反'}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Result */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={`text-4xl font-bold font-serif mb-1 ${
                    revealedResult.siXiang === '老阳' || revealedResult.siXiang === '老阴'
                      ? 'text-[#f87171]'
                      : revealedResult.siXiang === '少阳'
                      ? 'text-[#f0d080]'
                      : 'text-[#c0c0d0]'
                  }`}
                    style={{ textShadow: '0 0 20px currentColor' }}
                  >
                    {siXiangLabel(revealedResult.siXiang)}
                  </div>
                  <p className="text-sm text-[#8b7355] font-serif mt-1">
                    {revealedResult.siXiang === '老阳' && '☰ 阳极生阴，此爻将变'}
                    {revealedResult.siXiang === '老阴' && '☷ 阴极生阳，此爻将变'}
                    {revealedResult.siXiang === '少阳' && '⚌ 阳爻安固，刚健中正'}
                    {revealedResult.siXiang === '少阴' && '⚍ 阴爻安固，柔顺得位'}
                  </p>
                  <p className="text-xs text-[#6b5c44] mt-1">
                    {revealedResult.coinValues.join(' + ')} = {revealedResult.total}　·　第 {tosses.length + 1}/6 爻
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase text */}
        <AnimatePresence>
          {isCharging && (
            <motion.div className="text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[#c9a96e] font-serif text-xl tracking-[0.3em]" style={{ textShadow: '0 0 10px rgba(232,185,49,0.3)' }}>
                凝神聚气
              </p>
              <motion.div
                className="flex justify-center gap-1 mt-2"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gold-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
          {isFlying && (
            <motion.div className="text-center mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.p
                className="text-[#e8b931] font-serif text-xl tracking-[0.3em]"
                style={{ textShadow: '0 0 15px rgba(232,185,49,0.5)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                铜钱飞转
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== CONTROLS ====== */}
        <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
          {!allDone ? (
            <>
              <motion.button
                ref={tossBtnRef}
                onClick={doToss}
                disabled={phase !== 'ready'}
                aria-label={`摇卦，第${tosses.length + 1}次，共6次`}
                whileHover={phase === 'ready' ? { scale: 1.06 } : {}}
                whileTap={phase === 'ready' ? { scale: 0.94 } : {}}
                className={`inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-serif text-lg transition-all duration-300 ${
                  phase !== 'ready'
                    ? 'bg-[rgba(35,25,16,0.4)] text-[#6b5c44] cursor-not-allowed'
                    : 'bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 text-[#1a0f02] font-bold shadow-xl shadow-gold-300/40 hover:shadow-2xl hover:shadow-gold-400/50 hover:scale-[1.04]'
                }`}
              >
                <span className="text-xl">🪙</span>
                摇卦（第 {tosses.length + 1}/6 次）
              </motion.button>

              {tosses.length === 0 && (
                <motion.button
                  onClick={handleAutoToss}
                  disabled={phase !== 'ready'}
                  whileHover={phase === 'ready' ? { scale: 1.05 } : {}}
                  whileTap={phase === 'ready' ? { scale: 0.95 } : {}}
                  className={`inline-flex items-center gap-2 px-5 py-4 rounded-2xl font-medium transition-all ${
                    phase !== 'ready'
                      ? 'bg-[rgba(35,25,16,0.4)] text-[#6b5c44] cursor-not-allowed'
                      : 'bg-[rgba(20,14,8,0.5)] backdrop-blur-sm border-2 border-[rgba(232,185,49,0.25)] text-gold-600 hover:bg-[rgba(232,185,49,0.1)] shadow-sm'
                  }`}
                >
                  <Sparkles size={18} />
                  自动起卦
                </motion.button>
              )}
            </>
          ) : (
            <>
              <motion.button
                ref={completeBtnRef}
                onClick={completeAndCalculate}
                aria-label="观象玩辞，查看解卦结果"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-2.5 px-11 py-4 bg-gradient-to-br from-jade-500 to-emerald-600 text-white font-serif text-xl rounded-2xl shadow-xl shadow-jade-300/40 hover:shadow-2xl hover:shadow-jade-400/50 transition-all duration-300 font-bold"
              >
                观象玩辞
                <ArrowRight size={24} />
              </motion.button>

              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-4 bg-[rgba(20,14,8,0.5)] backdrop-blur-sm border-2 border-[rgba(184,160,128,0.3)] text-[#b8a080] rounded-2xl hover:bg-[rgba(30,22,14,0.5)] transition-colors"
              >
                <RotateCcw size={18} />
                重新起卦
              </motion.button>
            </>
          )}
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-[#4a3d2e] mt-3" aria-hidden="true">
          提示：按 <kbd className="px-1.5 py-0.5 text-[10px] bg-[rgba(255,255,255,0.06)] rounded border border-[rgba(255,255,255,0.1)]">空格</kbd> 或 <kbd className="px-1.5 py-0.5 text-[10px] bg-[rgba(255,255,255,0.06)] rounded border border-[rgba(255,255,255,0.1)]">回车</kbd> 亦可摇卦
        </p>
      </motion.div>

      {/* ====== TOSS HISTORY — Scroll-like ledger ====== */}
      {tosses.length > 0 && (
        <motion.div
          className="mt-8 max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-[11px] font-medium text-[#6b5c44] mb-3 text-center tracking-[0.2em] uppercase">
            已得爻象 · 自下而上
          </h3>
          <div className="bg-[rgba(20,14,8,0.4)] backdrop-blur-sm rounded-xl border border-[rgba(184,160,128,0.15)] divide-y divide-[rgba(184,160,128,0.05)]">
            {tosses.map((t, i) => (
              <motion.div
                key={t.round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-5 py-3 text-sm"
              >
                <span className="text-[#6b5c44] min-w-[38px] font-medium text-xs">
                  {POSITION_NAMES[t.round - 1]}
                </span>
                <span className={`text-lg ${t.siXiang === '老阳' || t.siXiang === '老阴' ? 'text-[#ef4444]' : 'text-[#b8a080]'}`}>
                  {siXiangSymbol(t.siXiang)}
                </span>
                <span className={`font-serif text-sm ${t.siXiang === '老阳' || t.siXiang === '老阴' ? 'text-[#f87171] font-medium' : 'text-[#b8a080]'}`}>
                  {siXiangLabel(t.siXiang)}
                </span>
                <span className="text-[#4a3d2e] text-xs ml-auto font-mono">
                  {t.coinValues.join('+')}={t.total}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// ELEMENTAL BURST — Different colors based on siXiang
// ============================================================

function ElementalBurst({ siXiang }: { siXiang: SiXiang }) {
  const particles = useMemo(() => {
    const count = 30;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      arr.push({
        id: i,
        angle,
        distance: 50 + Math.random() * 140,
        size: 2 + Math.random() * 7,
        delay: Math.random() * 0.3,
        duration: 0.7 + Math.random() * 0.8,
      });
    }
    return arr;
  }, []);

  const colorMap: Record<SiXiang, { bg: string; glow: string }> = {
    '老阳': { bg: 'bg-gradient-to-br from-orange-300 via-red-400 to-amber-500', glow: 'rgba(255,150,50,0.7)' },
    '老阴': { bg: 'bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-500', glow: 'rgba(120,160,255,0.7)' },
    '少阳': { bg: 'bg-gradient-to-br from-yellow-200 via-gold-400 to-amber-500', glow: 'rgba(255,220,150,0.7)' },
    '少阴': { bg: 'bg-gradient-to-br from-stone-200 via-slate-400 to-zinc-500', glow: 'rgba(200,200,220,0.5)' },
  };

  const colors = colorMap[siXiang];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const distance = p.distance;
        return (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${colors.bg}`}
            style={{
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 2}px ${colors.glow}`,
              left: '50%', top: '20%',
            }}
            initial={{ x: -p.size / 2, y: -p.size / 2, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * distance - p.size / 2,
              y: Math.sin(rad) * distance - p.size / 2,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
