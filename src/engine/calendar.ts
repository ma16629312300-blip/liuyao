import type { TianGan, DiZhi, MonthDayInfo } from './types';

/** 六十甲子表 */
const SIXTY_JIAZI: string[] = [];
const TG: string[] = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DZ: string[] = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
for (let i = 0; i < 60; i++) {
  SIXTY_JIAZI.push(`${TG[i % 10]}${DZ[i % 12]}`);
}

// ============================================================
// 24 节气计算 — 基于太阳黄经
// ============================================================

/**
 * 计算指定年份的某个节气日期（近似算法，误差 ±1 天）
 *
 * 24 节气基于太阳到达黄经特定度数：
 *   立春 315°, 雨水 330°, 惊蛰 345°, 春分 0°, 清明 15°, 谷雨 30°,
 *   立夏 45°, 小满 60°, 芒种 75°, 夏至 90°, 小暑 105°, 大暑 120°,
 *   立秋 135°, 处暑 150°, 白露 165°, 秋分 180°, 寒露 195°, 霜降 210°,
 *   立冬 225°, 小雪 240°, 大雪 255°, 冬至 270°, 小寒 285°, 大寒 300°
 *
 * 参考：寿星万年历算法简化版
 */
function getSolarTermDate(year: number, termIndex: number): Date {
  // termIndex: 0=立春, 1=雨水, ..., 23=大寒
  // 基准：1900年的节气日期偏移（以分钟计）
  // 简化算法：使用 20-21 世纪的近似公式

  // 每个节气对应的太阳黄经角度（度数）
  const angle = (termIndex * 15 + 315) % 360;

  // 使用近似公式计算
  // 参考 Meeus 天文算法中太阳黄经的简化计算
  const century = Math.floor(year / 100);
  const y = year - 2000; // 相对于 J2000.0 的年份

  // 对每个节气使用不同的基准 Julian 日期
  // 这里使用基于 2000 年的近似公式
  // 春分点 (termIndex=3, angle=0°) 作为校准点

  // 21世纪春分日期大致在 3月20-21日
  // 使用更直接的方法：节气日期约为每 15.2184 天一个

  // 基准：2000年春分 = 3月20日 UTC
  const baseYear = 2000;
  const yearDiff = year - baseYear;

  // 春分在 2000 年大约是 3月20日
  // 每年前移约 5h48m (回归年 = 365.2422 天)
  // Gregorian 历年平均 365.2425，所以每世纪春分前移约 0.75 天

  // 简化：直接计算每个节气的年积日偏移
  // 立春(termIndex=0) ≈ 2月4日 = DOY 35
  // 每个节气间隔 ≈ 15.2184 天
  const baseDOY = 35; // 立春大约在 DOY 35 (Feb 4)

  // 调整世纪误差
  const centuryAdjust = (century - 20) * 0.75; // 每世纪春分点前移 0.75 天
  const yearAdjust = (year % 4 === 0) ? 0 : (year % 4) * 0.2422; // 闰年调整

  const termDOY = baseDOY + termIndex * 15.2184 - centuryAdjust + yearAdjust * 0;

  // 处理闰年：3月之后的日期需要 +1
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const doyOffset = isLeapYear && termDOY > 60 ? 1 : 0;

  // 将 DOY 转换为 Date
  const date = new Date(year, 0, 1); // Jan 1
  date.setDate(Math.round(termDOY) + doyOffset);
  return date;
}

/**
 * 根据公历日期获取月支（精确到节气）
 *
 * 十二个月建对应的节气分界：
 *   寅月：立春 → 惊蛰
 *   卯月：惊蛰 → 清明
 *   辰月：清明 → 立夏
 *   巳月：立夏 → 芒种
 *   午月：芒种 → 小暑
 *   未月：小暑 → 立秋
 *   申月：立秋 → 白露
 *   酉月：白露 → 寒露
 *   戌月：寒露 → 立冬
 *   亥月：立冬 → 大雪
 *   子月：大雪 → 小寒
 *   丑月：小寒 → 立春（跨年至次年）
 */
export function getMonthZhiExact(year: number, month: number, day: number): DiZhi {
  const targetDate = new Date(year, month - 1, day);

  // 节气索引对应的月支
  // 立春(0)→寅, 惊蛰(2)→卯, 清明(4)→辰, 立夏(6)→巳,
  // 芒种(8)→午, 小暑(10)→未, 立秋(12)→申, 白露(14)→酉,
  // 寒露(16)→戌, 立冬(18)→亥, 大雪(20)→子, 小寒(22)→丑
  const termToZhi: [number, DiZhi][] = [
    [0, '寅'],  // 立春
    [2, '卯'],  // 惊蛰
    [4, '辰'],  // 清明
    [6, '巳'],  // 立夏
    [8, '午'],  // 芒种
    [10, '未'], // 小暑
    [12, '申'], // 立秋
    [14, '酉'], // 白露
    [16, '戌'], // 寒露
    [18, '亥'], // 立冬
    [20, '子'], // 大雪
    [22, '丑'], // 小寒
  ];

  // 检查目标日期是否在今年各节气之后
  for (let i = termToZhi.length - 1; i >= 0; i--) {
    const [termIdx, zhi] = termToZhi[i];
    const termDate = getSolarTermDate(year, termIdx);
    if (targetDate >= termDate) {
      return zhi;
    }
  }

  // 如果在立春之前 → 属于上一年的丑月
  return '丑';
}

// 保持旧函数向后兼容（简化版，供不需要精确节气时使用）
export function getMonthZhi(month: number): DiZhi {
  const zhiOrder: DiZhi[] = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
  return zhiOrder[((month - 1) % 12 + 12) % 12];
}

/** 获取年干支（简化算法，基于公历年份） */
export function getYearGanZhi(year: number): string {
  const baseYear = 1984; // 甲子年
  const diff = year - baseYear;
  const idx = ((diff % 60) + 60) % 60;
  return SIXTY_JIAZI[idx];
}

/** 获取日干支（公历日期 → 六十甲子索引，使用已知基点计算） */
export function getDayGanZhi(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  const base = new Date(1900, 0, 1);
  const diffDays = Math.round((date.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  // 1900年1月1日是甲戌日，甲戌在六十甲子中索引为10
  const idx = ((diffDays % 60) + 10 + 60) % 60;
  return SIXTY_JIAZI[idx];
}

/** 获取当前日期的完整干支信息（精确节气版） */
export function getMonthDayInfo(date?: Date): MonthDayInfo {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const yearGZ = getYearGanZhi(year);
  const monthZhi = getMonthZhiExact(year, month, day); // 使用节气精确版本
  const dayGZ = getDayGanZhi(year, month, day);

  return {
    yearGanZhi: yearGZ,
    monthZhi,
    dayGanZhi: dayGZ,
    dayGan: dayGZ[0] as TianGan,
    dayZhi: dayGZ[1] as DiZhi,
  };
}

export { SIXTY_JIAZI, TG, DZ };
