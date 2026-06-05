import type { YaoLine, TianGan, LiuShou } from './types';

const LIUSHOU_ORDER: LiuShou[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

/** 根据日干确定六兽起始位置 */
const DAY_GAN_START: Record<TianGan, number> = {
  '甲': 0, '乙': 0, '丙': 1, '丁': 1, '戊': 2,
  '己': 2, '庚': 3, '辛': 3, '壬': 4, '癸': 4,
};

/**
 * 安六兽：根据当日天干，从初爻开始顺排六兽
 */
export function applyLiuShou(lines: YaoLine[], dayGan: TianGan): YaoLine[] {
  const startIdx = DAY_GAN_START[dayGan] ?? 0;

  return lines.map((line, i) => ({
    ...line,
    liushou: LIUSHOU_ORDER[(startIdx + i) % 6],
  }));
}
