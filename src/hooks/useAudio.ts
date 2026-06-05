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

// ====== Ambient music — 五声音阶冥想旋律 ======

const PENTATONIC = [262, 294, 330, 392, 440]; // C D E G A (宫商角徵羽)
const PENTATONIC_HIGH = [524, 588, 660, 784, 880]; // 高八度

export function useAmbientMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playNote = useCallback((freq: number, duration: number, volume = 0.06) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + duration * 0.3); // slow attack
    gain.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration); // slow release
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.1);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;

    // Gentle pentatonic melody loop — slow, meditative
    let noteIndex = 0;
    const playNext = () => {
      const pool = Math.random() < 0.4 ? PENTATONIC : PENTATONIC_HIGH;
      const freq = pool[noteIndex % pool.length];
      const duration = 2.5 + Math.random() * 2; // 2.5-4.5s per note
      playNote(freq, duration, 0.04 + Math.random() * 0.03);

      // Sometimes play two notes together (harmony)
      if (Math.random() < 0.3) {
        const harmonyFreq = pool[(noteIndex + 2) % pool.length];
        playNote(harmonyFreq, duration * 0.7, 0.02);
      }

      noteIndex++;
      const nextDelay = duration * 800 + Math.random() * 1500; // gap between notes
      timerRef.current = setTimeout(playNext, nextDelay);
    };

    playNext();
    setIsPlaying(true);
  }, [playNote]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop(); else start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

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
