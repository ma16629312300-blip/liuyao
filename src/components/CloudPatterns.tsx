import { useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// CHINESE TRADITIONAL CLOUD MOTIFS (祥云纹)
// Rendered as inline SVG for crisp scaling
// ============================================================

// SVG path for a classic 祥云 (auspicious cloud) shape
const CLOUD_PATH =
  'M0,-20 C5,-30 20,-32 30,-25 C35,-20 35,-12 30,-8 C35,-6 38,0 35,8 C30,15 20,18 10,20 C0,22 -5,22 -10,20 C-18,16 -25,10 -22,0 C-20,-8 -12,-15 -5,-18 C-8,-12 -5,-18 0,-20 Z';

// Simpler cloud for smaller sizes
const CLOUD_SIMPLE =
  'M0,-12 C4,-20 15,-22 22,-16 C26,-10 25,-4 20,0 C26,3 28,8 25,12 C20,18 12,20 4,18 C-2,16 -8,14 -6,8 C-4,2 -8,6 0,-12 Z';

interface DriftingCloud {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export default function CloudPatterns() {
  const clouds = useMemo<DriftingCloud[]>(() => {
    const items: DriftingCloud[] = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        id: i,
        x: Math.random() * 110 - 5,
        y: 10 + Math.random() * 80,
        scale: 0.4 + Math.random() * 1.4,
        opacity: 0.04 + Math.random() * 0.08,
        duration: 40 + Math.random() * 80,
        delay: Math.random() * 40,
        driftX: (Math.random() - 0.5) * 120,
        driftY: -15 - Math.random() * 30,
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ willChange: 'transform' }}>
      {clouds.map((c) => (
        <motion.div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            opacity: c.opacity,
            transform: `scale(${c.scale})`,
            willChange: 'transform, opacity',
          }}
          animate={{
            x: [0, c.driftX, c.driftX * 0.3, -c.driftX * 0.5, 0],
            y: [0, c.driftY, c.driftY * 0.5, c.driftY * 0.2, 0],
            opacity: [c.opacity, c.opacity * 1.8, c.opacity, c.opacity * 1.4, c.opacity],
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            width={60 + c.scale * 40}
            height={40 + c.scale * 30}
            viewBox="-35 -30 70 55"
            fill="none"
            style={{ overflow: 'visible' }}
          >
            {/* Main cloud body */}
            <path
              d={c.scale > 0.9 ? CLOUD_PATH : CLOUD_SIMPLE}
              fill="rgba(200,170,130,0.25)"
              stroke="rgba(200,170,130,0.35)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner curl detail */}
            <path
              d="M-5,-10 C0,-16 10,-18 16,-12 C20,-6 18,0 14,4"
              fill="none"
              stroke="rgba(200,170,130,0.2)"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
