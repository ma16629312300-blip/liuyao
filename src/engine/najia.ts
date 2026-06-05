import type { YaoLine, Hexagram, TianGan, DiZhi, BaGua } from './types';
import { wuxingMap } from './helpers';

interface NajiaRules {
  trigramStems: Record<string, { inner: string; outer: string }>;
  yangBranches: [string[], string[]];
  yinBranches: [string[], string[]];
  trigramBranchType: Record<string, 'yang' | 'yin'>;
  trigramBranchOffsets: {
    inner: Record<string, number>;
    outer: Record<string, number>;
  };
}

import najiaRulesData from '../data/najia-rules.json';
const rules: NajiaRules = najiaRulesData as unknown as NajiaRules;

/**
 * 纳甲装卦 —— 给六爻配上天干地支
 */
export function applyNajia(hexagram: Hexagram): YaoLine[] {
  const { upperTrigram, lowerTrigram } = hexagram;
  const lines = hexagram.lines.map(l => ({ ...l })); // shallow copy

  // 获取纳甲天干
  const innerStem = rules.trigramStems[lowerTrigram]?.inner || '甲';
  const outerStem = rules.trigramStems[upperTrigram]?.outer || '甲';

  // 获取地支
  const innerBranches = getTrigramBranches(lowerTrigram, 'inner');
  const outerBranches = getTrigramBranches(upperTrigram, 'outer');

  // 装配：下卦（初、二、三爻）和上卦（四、五、上爻）
  const allBranches = [...innerBranches, ...outerBranches];
  const allStems = [innerStem, innerStem, innerStem, outerStem, outerStem, outerStem];

  for (let i = 0; i < 6; i++) {
    lines[i].dizhi = allBranches[i] as DiZhi;
    lines[i].tianGan = allStems[i] as TianGan;
    lines[i].wuxing = wuxingMap[allBranches[i]] || '土';
  }

  return lines;
}

/** 获取一个三爻卦的地支序列 */
function getTrigramBranches(trigram: BaGua, position: 'inner' | 'outer'): string[] {
  const branchType = rules.trigramBranchType[trigram];
  const offset = rules.trigramBranchOffsets[position][trigram] ?? 0;

  const baseBranches = branchType === 'yang'
    ? rules.yangBranches
    : rules.yinBranches;

  // 根据 offset 从对应序列中取3个地支
  const branches: string[] = [];
  const branchSet = baseBranches[position === 'inner' ? 0 : 1];
  for (let i = 0; i < 3; i++) {
    branches.push(branchSet[(offset + i) % 3]);
  }

  // Yin trigrams use reversed branch order for inner position
  if (branchType === 'yin' && position === 'inner') {
    return branches;
  }
  // Yang trigrams use forward order
  if (branchType === 'yang') {
    return branches;
  }
  // Yin outer: use the outer set
  return branches;
}

/**
 * 重新计算纳甲的地支 — 基于更准确的算法
 *
 * 阳卦（乾震坎艮）纳支顺行，从初爻起按固定地支序列
 * 阴卦（坤巽离兑）纳支逆行
 */
export function applyNajiaV2(hexagram: Hexagram): YaoLine[] {
  const lines = hexagram.lines.map(l => ({ ...l }));
  const { upperTrigram: up, lowerTrigram: lo } = hexagram;

  // 八纯卦地支全表（初爻→上爻）
  const trigramDizhi: Record<string, string[]> = {
    '乾': ['子','寅','辰','午','申','戌'],
    '震': ['子','寅','辰','午','申','戌'],
    '坎': ['寅','辰','午','申','戌','子'],
    '艮': ['辰','午','申','戌','子','寅'],
    '坤': ['未','巳','卯','丑','亥','酉'],
    '巽': ['丑','亥','酉','未','巳','卯'],
    '离': ['卯','丑','亥','酉','未','巳'],
    '兑': ['巳','卯','丑','亥','酉','未'],
  };

  // 纳甲天干
  const trigramStem: Record<string, { inner: string; outer: string }> = {
    '乾': { inner: '甲', outer: '壬' },
    '坤': { inner: '乙', outer: '癸' },
    '震': { inner: '庚', outer: '庚' },
    '巽': { inner: '辛', outer: '辛' },
    '坎': { inner: '戊', outer: '戊' },
    '离': { inner: '己', outer: '己' },
    '艮': { inner: '丙', outer: '丙' },
    '兑': { inner: '丁', outer: '丁' },
  };

  const loBranches = trigramDizhi[lo];
  const upBranches = trigramDizhi[up];
  const loStem = trigramStem[lo];
  const upStem = trigramStem[up];

  // 对于非纯卦，地支按本宫卦取，但需要根据实际卦的上下卦来取对应地支
  // 下卦三爻取该卦地支序列的前三个
  // 上卦三爻取该卦地支序列的后三个
  const allBranches = [
    loBranches[0], loBranches[1], loBranches[2],
    upBranches[3], upBranches[4], upBranches[5],
  ];

  const allStems = [
    loStem.inner, loStem.inner, loStem.inner,
    upStem.outer, upStem.outer, upStem.outer,
  ];

  for (let i = 0; i < 6; i++) {
    lines[i].dizhi = allBranches[i] as DiZhi;
    lines[i].tianGan = allStems[i] as TianGan;
    lines[i].wuxing = wuxingMap[allBranches[i]] || '土';
  }

  return lines;
}
