import type { YaoLine, DiZhi, HexagramRelation, AdvanceRetreat } from './types';

// ============================================================
// 地支六合六冲
// ============================================================

/** 地支六合 */
export const DI_ZHI_LIU_HE: Record<string, DiZhi> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

/** 地支六冲 */
export const DI_ZHI_LIU_CHONG: Record<string, DiZhi> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// ============================================================
// 八宫特殊卦识别
// ============================================================

/**
 * 八宫 → 游魂卦 + 归魂卦 映射
 *
 * 一世→五世后，第六变为游魂卦（第四爻变回），第七变为归魂卦（下卦全变回）
 */
const YOUHUN: Record<string, string> = {
  '乾': '火地晋', '坎': '地火明夷', '艮': '风泽中孚', '震': '泽风大过',
  '巽': '山雷颐', '离': '天水讼', '坤': '水天需', '兑': '雷山小过',
};

const GUIHUN: Record<string, string> = {
  '乾': '火天大有', '坎': '地水师', '艮': '风山渐', '震': '泽雷随',
  '巽': '山风蛊', '离': '天火同人', '坤': '水地比', '兑': '雷泽归妹',
};

/** 判断卦象是否为游魂/归魂 */
function getSpecialType(hexagramName: string): '游魂' | '归魂' | null {
  if (Object.values(YOUHUN).includes(hexagramName)) return '游魂';
  if (Object.values(GUIHUN).includes(hexagramName)) return '归魂';
  return null;
}

// ============================================================
// 卦象关系判断
// ============================================================

/**
 * 判断本卦与变卦之间的关系
 */
export function getHexagramRelation(
  originalName: string,
  changedName: string | null,
  originalLines: YaoLine[],
  changedLines: YaoLine[] | null,
  changingLineIndices: number[]
): HexagramRelation {
  // 检查游魂/归魂
  const specialOriginal = getSpecialType(originalName);
  if (specialOriginal) return specialOriginal;

  if (!changedLines || !changedName) return null;

  const specialChanged = getSpecialType(changedName);
  if (specialChanged) return specialChanged;

  // 检查伏吟/反吟
  const changing = changingLineIndices;
  if (changing.length > 0) {
    let allSame = true;
    let allChong = true;

    for (const idx of changing) {
      const orig = originalLines[idx];
      const chg = changedLines[idx];
      const origDz = orig.dizhi || '子';
      const chgDz = chg.dizhi || '子';

      if (origDz !== chgDz) allSame = false;
      if (DI_ZHI_LIU_CHONG[origDz] !== chgDz) allChong = false;
    }

    if (allSame) return '伏吟';
    if (allChong) return '反吟';
  }

  // 检查六合：上下卦对应位置的地支是否全部六合
  if (isAllLiuHe(originalLines, changedLines)) return '六合';

  // 检查六冲：上下卦对应位置的地支是否全部六冲
  if (isAllLiuChong(originalLines, changedLines)) return '六冲';

  return null;
}

/** 检查两组六爻是否全部六合 */
function isAllLiuHe(a: YaoLine[], b: YaoLine[]): boolean {
  for (let i = 0; i < 6; i++) {
    const dzA = a[i].dizhi || '';
    const dzB = b[i].dizhi || '';
    if (DI_ZHI_LIU_HE[dzA] !== dzB) return false;
  }
  return true;
}

/** 检查两组六爻是否全部六冲 */
function isAllLiuChong(a: YaoLine[], b: YaoLine[]): boolean {
  for (let i = 0; i < 6; i++) {
    const dzA = a[i].dizhi || '';
    const dzB = b[i].dizhi || '';
    if (DI_ZHI_LIU_CHONG[dzA] !== dzB) return false;
  }
  return true;
}

// ============================================================
// 进神退神判断
// ============================================================

/**
 * 进神退神：看动爻的地支在原爻与变爻之间的变化
 *
 * 同一五行中，地支顺序性变化：
 * - 进神：寅→卯, 巳→午, 申→酉, 亥→子, 丑→辰, 辰→未, 未→戌, 戌→丑
 * - 退神：卯→寅, 午→巳, 酉→申, 子→亥, 辰→丑, 未→辰, 戌→未, 丑→戌
 *
 * 进神主向前发展，退神主衰退
 */
const JIN_SHEN: Record<string, DiZhi> = {
  '寅': '卯', '卯': '辰',   // 木进
  '巳': '午', '午': '未',   // 火进
  '申': '酉', '酉': '戌',   // 金进
  '亥': '子', '子': '丑',   // 水进
  '丑': '辰', '辰': '未',   // 土进
  '未': '戌', '戌': '丑',
};

const TUI_SHEN: Record<string, DiZhi> = {
  '卯': '寅', '辰': '卯',   // 木退
  '午': '巳', '未': '午',   // 火退
  '酉': '申', '戌': '酉',   // 金退
  '子': '亥', '丑': '子',   // 水退
  '辰': '丑', '未': '辰',   // 土退
  '戌': '未', '丑': '戌',
};

/**
 * 判断所有动爻的进退神
 */
export function getAdvanceRetreat(
  originalLines: YaoLine[],
  changedLines: YaoLine[] | null,
  changingLineIndices: number[]
): (AdvanceRetreat | null)[] {
  if (!changedLines) return changingLineIndices.map(() => null);

  return changingLineIndices.map(idx => {
    const orig = originalLines[idx];
    const chg = changedLines[idx];
    const origDz = orig.dizhi || '';
    const chgDz = chg.dizhi || '';

    if (origDz === chgDz) return null; // 没有变化

    // 同一五行才有进退
    if (orig.wuxing !== chg.wuxing) return null;

    if (JIN_SHEN[origDz] === chgDz) return '进神';
    if (TUI_SHEN[origDz] === chgDz) return '退神';

    return null;
  });
}

/** 获取进退神描述 */
export function getAdvanceRetreatDesc(ar: AdvanceRetreat): string {
  switch (ar) {
    case '进神': return '爻化进神，事态向前发展，力量增强。';
    case '退神': return '爻化退神，事态衰退，力量减弱，需谨慎。';
    default: return '';
  }
}

// ============================================================
// 卦宫关系
// ============================================================

/** 获取卦象关系的人类可读描述 */
export function getHexagramRelationDesc(rel: HexagramRelation): string {
  switch (rel) {
    case '六合': return '本卦与变卦六合，主和美、合作、和谐之象。';
    case '六冲': return '本卦与变卦六冲，主冲散、变动、不稳定之象。';
    case '伏吟': return '动如不动，伏吟之象。事态发展缓慢，未见显著变化。';
    case '反吟': return '反复无常，反吟之象。事情反复多变，难以稳定。';
    case '游魂': return '游魂卦，心神不定，在外漂泊之象。';
    case '归魂': return '归魂卦，回归本源，安定有依之象。';
    default: return '';
  }
}
