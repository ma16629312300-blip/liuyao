import type { YaoLine, Hexagram, LiuQin, DiZhi, FuShen, BaGongName } from './types';
import { getPalaceWuxing } from './liuqin';
import { getLiuQin, WUXING_SHENG, WUXING_KE } from './helpers';
import { applyNajiaV2 } from './najia';
import hexagramData from '../data/hexagrams.json';

/**
 * 八宫本卦映射 — 每宫对应的纯卦名
 */
const PALACE_ROOT: Record<string, string> = {
  '乾': '乾为天', '坎': '坎为水', '艮': '艮为山', '震': '震为雷',
  '巽': '巽为风', '离': '离为火', '坤': '坤为地', '兑': '兑为泽',
};

/**
 * 获取本宫卦的完整六爻（含纳甲、六亲）
 *
 * 本宫卦 = 该八宫的纯卦（如乾宫=乾为天）
 */
function getPalaceRootHexagram(palace: string): YaoLine[] {
  const rootName = PALACE_ROOT[palace];
  if (!rootName) return [];

  // 从 JSON 中查找本宫卦数据
  const rootData = hexagramData.find(h => h.name === rootName);
  if (!rootData) return [];

  // 构造六爻
  const lines: YaoLine[] = rootData.lines.map((isYangNum: number, i: number) => ({
    index: i,
    siXiang: isYangNum ? '少阳' : '少阴',
    isYang: !!isYangNum,
    isChanging: false,
  }));

  // 装纳甲
  const fakeHexagram: Hexagram = {
    id: rootData.id,
    name: rootData.name,
    upperTrigram: rootData.upper as Hexagram['upperTrigram'],
    lowerTrigram: rootData.lower as Hexagram['lowerTrigram'],
    lines,
    palace: rootData.palace as BaGongName,
    shiIndex: rootData.shi,
    yingIndex: rootData.ying,
    description: rootData.desc,
    judgment: rootData.judgment,
    image: rootData.image,
  };

  const najiaLines = applyNajiaV2(fakeHexagram);

  // 装六亲（以本宫五行为「我」）
  const palaceWx = getPalaceWuxing(palace);
  return najiaLines.map(l => ({
    ...l,
    liuqin: getLiuQin(palaceWx, l.wuxing || '土'),
  }));
}

/**
 * 查找伏神：当用神不上卦时，从本宫卦中查找伏藏的爻
 *
 * @param hexagram 当前卦象（已装纳甲六亲的六爻）
 * @param yongShenLiuQin 用神对应的六亲
 * @returns 伏神信息数组（可能多处伏藏）
 */
export function findFuShen(
  hexagram: Hexagram,
  yongShenLiuQin: LiuQin
): FuShen[] {
  const lines = hexagram.lines;
  const palace = hexagram.palace;

  // 1. 获取本宫卦的完整六亲
  const rootLines = getPalaceRootHexagram(palace);
  if (!rootLines.length) return [];

  // 2. 当前卦中已有的用神位置
  const existingYong = new Set(
    lines.filter(l => l.liuqin === yongShenLiuQin).map(l => l.index)
  );

  // 3. 遍历本宫卦，找到当前卦中缺失的用神爻
  const fushen: FuShen[] = [];
  for (let i = 0; i < 6; i++) {
    const rootLine = rootLines[i];
    if (rootLine.liuqin !== yongShenLiuQin) continue;
    if (existingYong.has(i)) continue; // 当前卦此位已有用神，非伏

    const feiLine = lines[i]; // 飞神（当前卦此位的爻）
    const relation = getFuFeiRelation(rootLine.wuxing || '土', feiLine.wuxing || '土');

    fushen.push({
      liuqin: yongShenLiuQin,
      dizhi: rootLine.dizhi || '子',
      wuxing: rootLine.wuxing || '土',
      feiYaoDizhi: feiLine.dizhi || '子',
      feiYaoLiuQin: feiLine.liuqin || '兄弟',
      relation,
    });
  }

  return fushen;
}

/** 判断伏神与飞神的生克关系 */
function getFuFeiRelation(fuWx: string, feiWx: string): string {
  if (fuWx === feiWx) return '比和，伏神易出';
  if (WUXING_SHENG[feiWx as keyof typeof WUXING_SHENG] === fuWx) return '飞生伏，伏得长生，吉';
  if (WUXING_SHENG[fuWx as keyof typeof WUXING_SHENG] === feiWx) return '伏生飞，泄气，不吉';
  if (WUXING_KE[feiWx as keyof typeof WUXING_KE] === fuWx) return '飞克伏，伏神被压，不吉';
  if (WUXING_KE[fuWx as keyof typeof WUXING_KE] === feiWx) return '伏克飞，伏神有力，待时而出';
  return '平和中正';
}

/**
 * 判断伏神能否出现（是否有用）
 *
 * 条件：伏神被日辰/月建冲开，或被飞神生扶
 */
export function canFuShenAppear(
  fushen: FuShen,
  monthZhi: DiZhi,
  dayZhi: DiZhi,
  dayGan: string
): { canAppear: boolean; reason: string } {
  // 伏神地支被日辰或月建冲 → 伏神出
  const chong: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑',
    '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
  };

  if (chong[fushen.dizhi] === monthZhi) {
    return { canAppear: true, reason: `月建${monthZhi}冲起伏神${fushen.dizhi}，伏神得出` };
  }
  if (chong[fushen.dizhi] === dayZhi) {
    return { canAppear: true, reason: `日辰${dayZhi}冲起伏神${fushen.dizhi}，伏神得出` };
  }

  // 伏神被飞神生 → 易出
  if (WUXING_SHENG[fushen.feiYaoDizhi as keyof typeof WUXING_SHENG] === fushen.wuxing) {
    return { canAppear: true, reason: '飞神生伏神，伏神易出' };
  }

  return { canAppear: false, reason: '伏神被飞神所压，暂不易出' };
}
