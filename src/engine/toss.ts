import type { TossResult, SiXiang, YaoLine } from './types';

/** 模拟一次三枚铜钱摇卦 */
export function tossThreeCoins(): { coinValues: number[]; total: number; siXiang: SiXiang } {
  const coinValues = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 3 : 2));
  const total = coinValues.reduce((a, b) => a + b, 0);
  let siXiang: SiXiang;
  switch (total) {
    case 6: siXiang = '老阴'; break;
    case 7: siXiang = '少阳'; break;
    case 8: siXiang = '少阴'; break;
    case 9: siXiang = '老阳'; break;
    default: siXiang = '少阳';
  }
  return { coinValues, total, siXiang };
}

/** 完整六次摇卦，返回六爻（从初爻到上爻） */
export function tossSixTimes(): TossResult[] {
  return Array.from({ length: 6 }, (_, i) => ({
    round: i + 1,
    ...tossThreeCoins(),
  }));
}

/** 根据总分手动构造一爻（用于手动输入） */
export function createYaoLine(total: number, index: number): YaoLine {
  let siXiang: SiXiang;
  switch (total) {
    case 6: siXiang = '老阴'; break;
    case 7: siXiang = '少阳'; break;
    case 8: siXiang = '少阴'; break;
    case 9: siXiang = '老阳'; break;
    default: siXiang = '少阳';
  }
  return {
    index,
    siXiang,
    isYang: total === 7 || total === 9,
    isChanging: total === 6 || total === 9,
  };
}

/** 根据六次摇卦结果构造六爻 */
export function buildYaoLines(tosses: TossResult[]): YaoLine[] {
  return tosses.map((t, i) => createYaoLine(t.total, i));
}

export function siXiangLabel(sx: SiXiang): string {
  switch (sx) {
    case '老阴': return '⚋ ×';
    case '少阴': return '⚍';
    case '少阳': return '⚌';
    case '老阳': return '⚊ ○';
  }
}

export function siXiangSymbol(sx: SiXiang): string {
  switch (sx) {
    case '老阴': return '⚋';
    case '少阴': return '⚍';
    case '少阳': return '⚌';
    case '老阳': return '⚊';
  }
}
