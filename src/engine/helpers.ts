import type { WuXing, DiZhi, TianGan, LiuQin } from './types';

/** 天干 → 五行 */
export const wuxingMap: Record<string, WuXing> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土',
  '庚':'金','辛':'金','壬':'水','癸':'水',
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
};

/** 五行相生 */
export const WUXING_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克 */
export const WUXING_KE: Record<WuXing, WuXing> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

/** 根据本宫五行为「我」，各爻地支五行 → 六亲 */
export function getLiuQin(selfWuxing: WuXing, yaoWuxing: WuXing): LiuQin {
  // 生我者父母，我生者子孙，克我者官鬼，我克者妻财，同我者兄弟
  if (yaoWuxing === selfWuxing) return '兄弟';
  if (WUXING_SHENG[yaoWuxing] === selfWuxing) return '父母'; // 爻生我
  if (WUXING_SHENG[selfWuxing] === yaoWuxing) return '子孙'; // 我生爻
  if (WUXING_KE[yaoWuxing] === selfWuxing) return '官鬼';   // 爻克我
  if (WUXING_KE[selfWuxing] === yaoWuxing) return '妻财';   // 我克爻
  return '兄弟';
}

/** 地支 → 五行 */
export function dizhiToWuxing(dz: DiZhi): WuXing {
  return wuxingMap[dz] as WuXing || '土';
}

/** 天干 → 五行 */
export function tianganToWuxing(tg: TianGan): WuXing {
  return wuxingMap[tg] as WuXing || '土';
}
