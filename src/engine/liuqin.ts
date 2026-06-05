import type { YaoLine, WuXing } from './types';
import { getLiuQin } from './helpers';
import ganzhiData from '../data/ganzhi.json';

/** 装六亲：以本宫五行为「我」，给每一爻配上六亲 */
export function applyLiuQin(lines: YaoLine[], palace: string): YaoLine[] {
  // 获取本宫五行
  const palaceWuxing = ganzhiData.bagua[palace as keyof typeof ganzhiData.bagua]?.wuxing as WuXing;
  if (!palaceWuxing) return lines;

  const result = lines.map(line => ({
    ...line,
    liuqin: getLiuQin(palaceWuxing, line.wuxing || '土'),
  }));

  return result;
}

/** 获取八宫的五行 */
export function getPalaceWuxing(palace: string): WuXing {
  return (ganzhiData.bagua[palace as keyof typeof ganzhiData.bagua]?.wuxing || '土') as WuXing;
}
