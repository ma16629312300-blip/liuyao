// ====== 基础类型 ======

/** 天干 */
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 地支 */
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 八卦 */
export type BaGua = '乾' | '兑' | '离' | '震' | '巽' | '坎' | '艮' | '坤';

/** 六亲 */
export type LiuQin = '父母' | '兄弟' | '妻财' | '官鬼' | '子孙';

/** 六兽 */
export type LiuShou = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

/** 爻的阴阳属性 */
export type YaoYinYang = '阳' | '阴';

/** 四象：少阳、少阴、老阳、老阴 */
export type SiXiang = '少阳' | '少阴' | '老阳' | '老阴';

/** 八宫 */
export type BaGongName = '乾' | '坎' | '艮' | '震' | '巽' | '离' | '坤' | '兑';

// ====== 卦相关 ======

/** 八卦基础信息 */
export interface Trigrams {
  name: BaGua;
  wuxing: WuXing;
  nature: string;       // 象征
  direction: string;    // 方位
  lines: number[];      // 三爻 [下,中,上]  1=阳 0=阴
}

/** 单根爻 */
export interface YaoLine {
  index: number;          // 0=初爻 ... 5=上爻
  siXiang: SiXiang;       // 四象属性
  isYang: boolean;        // 本象是否为阳
  isChanging: boolean;    // 是否为动爻（老阳变阴、老阴变阳）
  /** 纳甲装卦后 */
  dizhi?: DiZhi;          // 地支
  tianGan?: TianGan;      // 天干（纳甲）
  wuxing?: WuXing;        // 此爻地支对应的五行
  liuqin?: LiuQin;         // 六亲
  liushou?: LiuShou;       // 六兽
  isShi?: boolean;        // 是否为世爻
  isYing?: boolean;       // 是否为应爻
  wangshuai?: WangShuai;  // 旺衰状态
  yaoci?: string;         // 爻辞
  /** 旬空 */
  isXunKong?: boolean;    // 此爻是否落空亡
  /** 伏神 */
  feiShen?: FuShen;        // 飞伏信息（用神不上卦时有）
}

/** 伏神信息 */
export interface FuShen {
  liuqin: LiuQin;         // 伏藏的六亲
  dizhi: DiZhi;            // 伏藏的地支
  wuxing: WuXing;          // 伏藏的五行
  feiYaoDizhi: DiZhi;      // 飞爻地支（压在上面的爻）
  feiYaoLiuQin: LiuQin;    // 飞爻六亲
  relation: string;        // 伏神与飞神的关系（生/克/比和）
}

/** 旺衰状态 */
export type WangShuai = '旺' | '相' | '休' | '囚' | '死';

/** 六十四卦 */
export interface Hexagram {
  id: number;              // 1-64
  name: string;            // 卦名
  upperTrigram: BaGua;     // 上卦（外卦）
  lowerTrigram: BaGua;     // 下卦（内卦）
  lines: YaoLine[];        // 六爻（初爻→上爻）
  palace: BaGongName;      // 所属八宫
  shiIndex: number;        // 世爻位置（0-5）
  yingIndex: number;       // 应爻位置（0-5）
  description: string;     // 卦辞
  judgment: string;        // 彖辞
  image: string;           // 象辞
}

/** 八宫世应表 */
export interface BaGongEntry {
  palace: BaGongName;
  hexagramIds: number[];   // 本宫八卦的id（按变爻顺序）
}

/** 月建日辰信息 */
export interface MonthDayInfo {
  yearGanZhi: string;      // 年干支如 "丙午"
  monthZhi: DiZhi;         // 月支
  dayGanZhi: string;       // 日干支如 "甲子"
  dayGan: TianGan;         // 日干
  dayZhi: DiZhi;           // 日支
}

/** 用神信息 */
export interface YongShen {
  liuqin: LiuQin;          // 用神对应的六亲
  description: string;     // 用神说明
  lineIndex: number | null; // 用神所在的爻位
}

// ====== 排盘结果 ======

/** 完整的排盘结果 */
export interface PaiPanResult {
  originalHexagram: Hexagram;   // 本卦
  changedHexagram: Hexagram | null; // 变卦（静卦时为null）
  changingLines: number[];      // 动爻位置（0-5）
  monthDay: MonthDayInfo;       // 月建日辰
  yongShen: YongShen;           // 用神
  questionType: QuestionType;   // 问题类型
  /** 卦象关系 */
  hexagramRelation: HexagramRelation | null; // 本卦与变卦的关系
  /** 动爻进退 */
  lineAdvanceRetreat: (AdvanceRetreat | null)[]; // 每个动爻的进退神
}

/** 卦象之间的关系 */
export type HexagramRelation =
  | '六合'    // 本卦与变卦地支六合
  | '六冲'    // 本卦与变卦地支六冲
  | '伏吟'    // 动变后地支不变
  | '反吟'    // 动变后地支相冲
  | '游魂'    // 游魂卦
  | '归魂'    // 归魂卦
  | null;

/** 动爻进退神 */
export type AdvanceRetreat = '进神' | '退神' | '化进' | '化退' | null;

/** 问题类型 — 决定用神 */
export type QuestionType =
  | '婚姻' | '事业' | '财运' | '考试' | '出行'
  | '疾病' | '官司' | '失物' | '天气' | '生育'
  | '投资' | '求职' | '感情' | '家庭' | '其他';

/** 摇卦结果（一次摇卦 = 3枚铜钱） */
export interface TossResult {
  round: number;           // 第几次摇卦（1-6，对应初爻到上爻）
  coinValues: number[];    // 三枚铜钱的面值 [3或2, 3或2, 3或2]
  total: number;           // 总分 6/7/8/9
  siXiang: SiXiang;        // 四象
}

/** 解卦请求 */
export interface InterpretationRequest {
  question: string;
  questionType: QuestionType;
  paiPan: PaiPanResult;
}

/** 历史记录 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  question: string;
  questionType: QuestionType;
  paiPan: PaiPanResult;
  interpretation?: string;
}
