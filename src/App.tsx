import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useLiuyaoStore } from './store/useLiuyaoStore';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundEffects from './components/BackgroundEffects';
import QuestionStep from './components/QuestionStep';
import TossStep from './components/TossStep';
import ResultView from './components/ResultView';
import HistoryDrawer from './components/HistoryDrawer';
import { useAmbientMusic } from './hooks/useAudio';

// ============================================================
// Audio context — shared across components
// ============================================================

interface AudioCtx {
  musicPlaying: boolean;
  toggleMusic: () => void;
}
export const AudioContext = createContext<AudioCtx>({ musicPlaying: false, toggleMusic: () => {} });
export const useAppAudio = () => useContext(AudioContext);

// ============================================================
// APP SHELL — Dark temple theme + cursor glow
// ============================================================

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div
      ref={ref}
      className="cursor-glow"
      style={{ left: '-999px', top: '-999px' }}
    />
  );
}

function App() {
  const { currentStep } = useLiuyaoStore();
  const [historyOpen, setHistoryOpen] = useState(false);
  const { isPlaying, toggle } = useAmbientMusic();

  const audioCtx: AudioCtx = { musicPlaying: isPlaying, toggleMusic: toggle };

  return (
    <AudioContext.Provider value={audioCtx}>
      <div className="min-h-screen flex flex-col relative" style={{ background: '#0a0602' }}>
        {/* Cursor glow */}
        <CursorGlow />

        {/* Background effects */}
        <BackgroundEffects />

        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-b-[rgba(184,160,128,0.1)]" style={{ background: 'rgba(10,6,2,0.75)' }}>
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-50">☰</span>
              <h1 className="text-lg font-serif font-bold text-[#b89360] tracking-wider">
                六爻占卜
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {/* Music toggle */}
              <button
                onClick={toggle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: isPlaying ? '#c9a96e' : '#4a3d2e' }}
                title={isPlaying ? '关闭背景音乐' : '开启背景音乐'}
              >
                {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#8b7355] hover:text-[#c9a96e] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">历史记录</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main — min-height prevents layout shift during transitions */}
        <main className="flex-1 relative z-10" style={{ minHeight: '80vh', contain: 'layout style' }}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {currentStep === 'question' && <QuestionStep key="question" />}
              {currentStep === 'toss' && <TossStep key="toss" />}
              {currentStep === 'result' && <ResultView key="result" />}
            </AnimatePresence>
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center text-xs text-[#4a3d2e] border-t border-[rgba(184,160,128,0.08)]">
          <p>六爻占卜 · 纳甲筮法 · 传统智慧与现代科技的结合</p>
          <p className="mt-1">
            Designed by <span className="text-[#8b7355] font-medium">tiaotiao</span>
          </p>
          <p className="mt-0.5">卦象仅供参考，最终决策请结合实际情况理性判断</p>
        </footer>

        <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
    </AudioContext.Provider>
  );
}

export default App;
