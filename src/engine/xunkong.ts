import type { YaoLine, TianGan, DiZhi } from './types';
import { SIXTY_JIAZI, TG, DZ } from './calendar';

/**
 * 旬空（空亡）计算
 *
 * 十天干配十二地支，每旬（10天）有两个地支没有天干相配，
 * 这两个地支即为"旬空"或"空亡"。
 *
 * 例如：甲子旬（甲子→癸酉），戌亥无干相配，故戌亥空亡。
 */

/** 根据日干支获取旬空的两个地支 */
export function getXunKong(dayGanZhi: string): [DiZhi, DiZhi] {
  // 找到日干支在六十甲子中的位置
  const idx = SIXTY_JIAZI.indexOf(dayGanZhi);
  if (idx === -1) return ['戌', '亥']; // fallback

  // 确定此旬的起始索引（甲X 的位置）
  const xunStart = idx - (idx % 10);

  // 此旬使用了的地支（10个天干对应10个地支）
  const usedDizhi = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const jiazi = SIXTY_JIAZI[(xunStart + i) % 60];
    usedDizhi.add(jiazi[1]); // 第二个字是地支
  }

  // 找出不在集合中的两个地支
  const empty: DiZhi[] = [];
  for (const dz of DZ) {
    if (!usedDizhi.has(dz)) {
      empty.push(dz as DiZhi);
    }
  }

  return [empty[0] || '戌', empty[1] || '亥'];
}

/** 给每根爻标记是否旬空 */
export function applyXunKong(lines: YaoLine[], dayGanZhi: string): YaoLine[] {
  const [kong1, kong2] = getXunKong(dayGanZhi);

  return lines.map(line => ({
    ...line,
    isXunKong: line.dizhi === kong1 || line.dizhi === kong2,
  }));
}

/** 获取旬空描述 */
export function getXunKongDesc(dayGanZhi: string): string {
  const [kong1, kong2] = getXunKong(dayGanZhi);
  return `${kong1}${kong2}空亡`;
}

/** 判断空亡是否被冲（被日辰或动爻冲则不为空） */
export function isXunKongFilled(line: YaoLine, dayZhi: DiZhi): boolean {
  if (!line.isXunKong) return false;
  // 六冲：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
  const chong: Record<string, string> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳',
  };
  return chong[line.dizhi || '子'] === dayZhi;
}
