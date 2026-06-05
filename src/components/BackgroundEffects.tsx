import { memo, useMemo } from 'react';
import CloudPatterns from './CloudPatterns';

// ============================================================
// STABLE BACKGROUND — CSS animations only, no Framer Motion loops
// All repeating effects use pure CSS (compositor-only, no JS)
// ============================================================

export default memo(function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <BaseGradient />
      <CloudPatterns />
      <CssStarfield />
      <CssIncenseSmoke />
      <CssBaguaRing />
      <CssFloatingSymbols />
      <CssGoldDust />
      <CssVignette />
      <CssLightBeams />
    </div>
  );
});

// ====== Base gradient — fully static ======

const BaseGradient = memo(function BaseGradient() {
  return (
    <>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 30%, #2a1a0a 0%, #1a0f04 35%, #0d0702 70%, #080400 100%)',
      }} />
      <div className="absolute top-[20%] left-1/2 w-[800px] h-[500px] rounded-full" style={{
        marginLeft: -400,
        background: 'radial-gradient(ellipse, rgba(232,185,49,0.15) 0%, rgba(200,140,40,0.06) 30%, transparent 65%)',
        filter: 'blur(60px)',
        animation: 'breathe 8s ease-in-out infinite',
        willChange: 'opacity',
      }} />
      <div className="absolute top-[40%] left-[15%] w-[500px] h-[350px] rounded-full" style={{
        background: 'radial-gradient(ellipse, rgba(200,140,60,0.08) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'breathe 10s ease-in-out 3s infinite',
        willChange: 'opacity',
      }} />
    </>
  );
});

// ====== CSS Starfield — compositor only ======

const CssStarfield = memo(function CssStarfield() {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        animDuration: 2 + Math.random() * 4,
        animDelay: Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.45,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, rgba(255,220,150,0.9) 0%, rgba(232,185,49,0.4) 50%, transparent 70%)`,
            boxShadow: `0 0 ${s.size * 5}px rgba(232,185,49,0.5)`,
            opacity: s.opacity,
            animation: `starTwinkle ${s.animDuration}s ease-in-out ${s.animDelay}s infinite`,
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  );
});

// ====== CSS Incense smoke — fewer columns, pure CSS ======

const CssIncenseSmoke = memo(function CssIncenseSmoke() {
  const columns = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push({
        id: i,
        left: -5 + (i / 9) * 110,
        animDuration: 7 + Math.random() * 8,
        animDelay: Math.random() * 7,
        width: 80 + Math.random() * 180,
        opacity: 0.06 + Math.random() * 0.1,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {columns.map((c) => (
        <div
          key={c.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${c.left}%`,
            width: c.width,
            height: 60,
            background: `radial-gradient(ellipse at center, rgba(232,185,49,${c.opacity}) 0%, rgba(180,140,80,${c.opacity * 0.4}) 30%, transparent 70%)`,
            filter: 'blur(25px)',
            animation: `smokeRise ${c.animDuration}s ease-out ${c.animDelay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
});

// ====== CSS Bagua ring — pure CSS rotation ======

const CssBaguaRing = memo(function CssBaguaRing() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.15]">
      <div style={{
        width: 'min(55vw, 55vh)',
        height: 'min(55vw, 55vh)',
        animation: 'slowSpin 90s linear infinite',
        willChange: 'transform',
      }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="99" fill="none" stroke="#c9a96e" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="96" fill="none" stroke="#b89360" strokeWidth="0.3" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#b89360" strokeWidth="0.3" />
          <path d="M100,35 A65,65 0 0,1 100,165 A32.5,32.5 0 0,1 100,100 A32.5,32.5 0 0,0 100,35 Z" fill="#f0e6d3" opacity="0.5" />
          <circle cx="100" cy="67.5" r="5" fill="#2a1a0a" opacity="0.45" />
          <circle cx="100" cy="132.5" r="5" fill="#f0e6d3" opacity="0.3" />
          {[
            { s: '☰', n: '乾', a: -90 }, { s: '☱', n: '兑', a: -45 }, { s: '☲', n: '离', a: 0 }, { s: '☳', n: '震', a: 45 },
            { s: '☴', n: '巽', a: 90 }, { s: '☵', n: '坎', a: 135 }, { s: '☶', n: '艮', a: 180 }, { s: '☷', n: '坤', a: 225 },
          ].map(({ s, n, a }, i) => {
            const rad = (a * Math.PI) / 180, r = 83, x = 100 + r * Math.cos(rad), y = 100 + r * Math.sin(rad);
            return (
              <g key={i}>
                <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="central" fill="#c9a96e" opacity="0.85" style={{ fontSize: '10px', fontWeight: 'bold' }} transform={`rotate(${a + 90}, ${x}, ${y - 4})`}>{s}</text>
                <text x={x} y={y + 10} textAnchor="middle" dominantBaseline="central" fill="#8b7355" opacity="0.6" style={{ fontSize: '6px' }}>{n}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
});

// ====== CSS Floating symbols — simple opacity pulse ======

const CssFloatingSymbols = memo(function CssFloatingSymbols() {
  const items = useMemo(() => {
    const pool = ['☰','☱','☲','☳','☴','☵','☶','☷','☯','⚊','⚋'];
    const arr = [];
    for (let i = 0; i < 16; i++) {
      arr.push({
        id: i, sym: pool[i % pool.length],
        left: Math.random() * 95,
        top: Math.random() * 90,
        fontSize: 24 + Math.random() * 36,
        animDuration: 4 + Math.random() * 5,
        animDelay: Math.random() * 6,
        opacity: 0.05 + Math.random() * 0.1,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0">
      {items.map((s) => (
        <div
          key={s.id}
          className="absolute font-serif select-none"
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            fontSize: `${s.fontSize}px`,
            color: '#c9a96e',
            textShadow: '0 0 12px rgba(232,185,49,0.4)',
            opacity: s.opacity,
            animation: `symbolFloat ${s.animDuration}s ease-in-out ${s.animDelay}s infinite`,
            willChange: 'opacity, transform',
          }}
        >{s.sym}</div>
      ))}
    </div>
  );
});

// ====== CSS Gold dust ======

const CssGoldDust = memo(function CssGoldDust() {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 35; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 0.5 + Math.random() * 2.5,
        animDuration: 5 + Math.random() * 8,
        animDelay: Math.random() * 6,
        opacity: 0.08 + Math.random() * 0.25,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`, top: `${p.top}%`,
            width: p.size, height: p.size,
            background: `radial-gradient(circle, rgba(255,230,170,0.9) 0%, rgba(232,185,49,0.5) 40%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(232,185,49,0.5)`,
            opacity: p.opacity,
            animation: `dustFloat ${p.animDuration}s ease-in-out ${p.animDelay}s infinite`,
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  );
});

// ====== CSS Vignette — pure CSS breathing ======

const CssVignette = memo(function CssVignette() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-[20vh] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(232,185,49,0.1) 0%, transparent 100%)',
        animation: 'breathe 8s ease-in-out infinite',
        willChange: 'opacity',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-[15vh] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(200,140,40,0.06) 0%, transparent 100%)',
        animation: 'breathe 10s ease-in-out 4s infinite',
        willChange: 'opacity',
      }} />
    </>
  );
});

// ====== CSS Light beams ======

const CssLightBeams = memo(function CssLightBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 h-[2px]" style={{
        width: '500px',
        background: 'linear-gradient(90deg, rgba(232,185,49,0.1) 0%, transparent 100%)',
        transform: 'rotate(-25deg)', transformOrigin: 'top left',
        filter: 'blur(3px)',
        animation: 'beamSlide1 14s ease-in-out infinite',
        willChange: 'opacity, transform',
      }} />
      <div className="absolute top-[30%] right-0 h-[2px]" style={{
        width: '400px',
        background: 'linear-gradient(270deg, rgba(232,185,49,0.08) 0%, transparent 100%)',
        transform: 'rotate(15deg)', transformOrigin: 'top right',
        filter: 'blur(2px)',
        animation: 'beamSlide2 16s ease-in-out 6s infinite',
        willChange: 'opacity, transform',
      }} />
    </div>
  );
});
