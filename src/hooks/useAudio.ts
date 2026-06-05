import { useRef, useCallback, useState, useEffect } from 'react';

// ============================================================
// Web Audio API — 合成音效 + 环境背景音
// ============================================================

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

// ====== Ambient drone — 庙堂环境底音 ======

export function useAmbientMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const nodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    gain1: GainNode;
    gain2: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null>(null);

  const start = useCallback(() => {
    const ctx = getCtx();
    if (nodesRef.current) return; // already playing

    // LFO for slow volume modulation (breathing)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15; // very slow — 6.7s cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);

    // Osc 1 — low drone (fundamental)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // A1
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.04;
    lfoGain.connect(gain1.gain);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Osc 2 — fifth above, gentle
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 82.5; // E2 (perfect fifth)
    const gain2 = ctx.createGain();
    gain2.gain.value = 0.025;
    lfoGain.connect(gain2.gain);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    nodesRef.current = { osc1, osc2, gain1, gain2, lfo, lfoGain };
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodes.osc1.stop();
    nodes.osc2.stop();
    nodes.lfo.stop();
    nodes.osc1.disconnect();
    nodes.osc2.disconnect();
    nodes.gain1.disconnect();
    nodes.gain2.disconnect();
    nodes.lfo.disconnect();
    nodes.lfoGain.disconnect();
    nodesRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop(); else start();
  }, [isPlaying, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (nodesRef.current) stop(); };
  }, [stop]);

  return { isPlaying, toggle, start, stop };
}

// ====== Sound effects ======

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  delay = 0,
  freqEnd?: number
) {
  setTimeout(() => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, delay * 1000);
}

/** 铜钱碰撞声 */
export function playCoinSound() {
  const ctx = getCtx();
  // High metallic ping
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);

  // Sub hit
  playTone(80, 0.25, 'sine', 0.08, 0.05);
}

/** 铜钱飞行声 */
export function playCoinFlySound() {
  playTone(600, 0.6, 'sine', 0.06, 0, 200);
  playTone(900, 0.5, 'sine', 0.04, 0.1, 300);
}

/** 爻象揭示声 */
export function playRevealSound() {
  // Gong-like resonance
  playTone(150, 1.2, 'sine', 0.1, 0);
  playTone(152, 1.1, 'sine', 0.06, 0.05);
  playTone(300, 0.8, 'triangle', 0.04, 0.15);
}

/** 摇卦完成声 — 钟鸣 */
export function playCompleteSound() {
  playTone(220, 1.5, 'sine', 0.12, 0);
  playTone(330, 1.3, 'sine', 0.08, 0.1);
  playTone(440, 1.0, 'sine', 0.06, 0.25);
  playTone(660, 0.8, 'triangle', 0.04, 0.4);
}

/** 按钮点击 */
export function playClickSound() {
  playTone(800, 0.08, 'sine', 0.05);
}

/** 错误提示 */
export function playErrorSound() {
  playTone(200, 0.3, 'sawtooth', 0.06, 0);
  playTone(180, 0.25, 'sawtooth', 0.05, 0.1);
}
