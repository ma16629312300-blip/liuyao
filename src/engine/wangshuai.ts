import type { YaoLine, WuXing, DiZhi, WangShuai } from './types';
import { dizhiToWuxing, WUXING_SHENG, WUXING_KE } from './helpers';

/**
 * 判断爻的旺衰状态
 * 以月建为提纲，日辰为辅
 *
 * 旺衰规则（以月建五行为「令」，爻五行为「我」）：
 * - 当令者旺（月建五行 = 爻五行，同我）
 * - 生我者相（月建生爻，令生我）
 * - 我生者休（爻生月建，我生令）
 * - 克我者囚（月建克爻，令克我）
 * - 我克者死（爻克月建，我克令）
 */
export function getWangShuai(yaoWuxing: WuXing, monthZhi: DiZhi): WangShuai {
  const monthWuxing = dizhiToWuxing(monthZhi);

  if (yaoWuxing === monthWuxing) return '旺';         // 同我者旺
  if (WUXING_SHENG[monthWuxing] === yaoWuxing) return '相'; // 生我者相（月建 → 爻）
  if (WUXING_SHENG[yaoWuxing] === monthWuxing) return '休'; // 我生者休（爻 → 月建）
  if (WUXING_KE[monthWuxing] === yaoWuxing) return '囚';   // 克我者囚（月建 → 爻）
  return '死';                                        // 我克者死（爻 → 月建）
}

/** 给所有爻标记旺衰 */
export function applyWangShuai(lines: YaoLine[], monthZhi: DiZhi): YaoLine[] {
  return lines.map(line => ({
    ...line,
    wangshuai: getWangShuai(line.wuxing || '土', monthZhi),
  }));
}

/** 旺衰对应的权重分数 */
export function wangShuaiScore(ws: WangShuai): number {
  switch (ws) {
    case '旺': return 5;
    case '相': return 4;
    case '休': return 3;
    case '囚': return 2;
    case '死': return 1;
  }
}
