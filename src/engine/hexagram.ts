import type { YaoLine, Hexagram, BaGua } from './types';
import hexagramData from '../data/hexagrams.json';

/** 八卦三爻映射（从下往上：初爻、二爻、三爻） */
const BAGUA_LINES: Record<BaGua, number[]> = {
  '乾': [1,1,1], '兑': [0,1,1], '离': [1,0,1], '震': [0,0,1],
  '巽': [1,1,0], '坎': [0,1,0], '艮': [1,0,0], '坤': [0,0,0],
};

/** 根据三爻查找八卦 */
function findBagua(lines: number[]): BaGua {
  for (const [name, pattern] of Object.entries(BAGUA_LINES)) {
    if (pattern[0] === lines[0] && pattern[1] === lines[1] && pattern[2] === lines[2]) {
      return name as BaGua;
    }
  }
  return '乾'; // fallback
}

/** 根据六根爻查找对应的卦（64卦之一） */
export function findHexagram(yaoLines: YaoLine[]): Hexagram | null {
  const lineValues = yaoLines.map(y => y.isYang ? 1 : 0);
  const upperLines = lineValues.slice(3, 6); // 四、五、上爻
  const lowerLines = lineValues.slice(0, 3); // 初、二、三爻

  const upper = findBagua(upperLines);
  const lower = findBagua(lowerLines);

  const match = hexagramData.find(h => h.upper === upper && h.lower === lower);
  if (!match) return null;

  return {
    id: match.id,
    name: match.name,
    upperTrigram: match.upper as BaGua,
    lowerTrigram: match.lower as BaGua,
    lines: yaoLines,
    palace: match.palace as Hexagram['palace'],
    shiIndex: match.shi,
    yingIndex: match.ying,
    description: match.desc,
    judgment: match.judgment,
    image: match.image,
  };
}

/** 根据六爻获取本卦和变卦 */
export function getHexagrams(yaoLines: YaoLine[]): {
  original: Hexagram | null;
  changed: Hexagram | null;
} {
  // 本卦：将老阳视为阳、老阴视为阴
  const originalLines: YaoLine[] = yaoLines.map(y => ({
    ...y,
    isYang: y.siXiang === '老阳' || y.siXiang === '少阳',
  }));

  // 变卦：将动爻翻转（老阳→阴，老阴→阳）
  const changedLines: YaoLine[] = yaoLines.map(y => ({
    ...y,
    isYang: y.siXiang === '老阴' ? true : y.siXiang === '老阳' ? false : y.isYang,
  }));

  const original = findHexagram(originalLines);
  const hasChanging = yaoLines.some(y => y.isChanging);
  const changed = hasChanging ? findHexagram(changedLines) : null;

  return { original, changed };
}

/** 获取动爻索引列表 */
export function getChangingLines(yaoLines: YaoLine[]): number[] {
  return yaoLines.filter(y => y.isChanging).map(y => y.index);
}
