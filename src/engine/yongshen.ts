import type { LiuQin, QuestionType } from './types';

/** 问题类型 → 用神（对应的六亲） */
const QUESTION_YONGSHEN: Record<QuestionType, LiuQin> = {
  '婚姻': '妻财',
  '感情': '妻财',
  '事业': '官鬼',
  '求职': '官鬼',
  '财运': '妻财',
  '投资': '妻财',
  '考试': '父母',
  '家庭': '父母',
  '出行': '子孙',
  '生育': '子孙',
  '疾病': '官鬼',
  '官司': '官鬼',
  '失物': '妻财',
  '天气': '父母',
  '其他': '妻财',
};

/** 根据问题类型确定用神 */
export function getYongShen(questionType: QuestionType): { liuqin: LiuQin; description: string } {
  const liuqin = QUESTION_YONGSHEN[questionType] || '妻财';
  const descriptions: Record<LiuQin, string> = {
    '父母': '父母爻为用，主文书、考试、房屋、长辈之事',
    '兄弟': '兄弟爻为用，主同辈、竞争、口舌之事',
    '妻财': '妻财爻为用，主财运、妻子、财物之事',
    '官鬼': '官鬼爻为用，主事业、官运、疾病、官司之事',
    '子孙': '子孙爻为用，主子嗣、出行、解忧之事',
  };
  return { liuqin, description: descriptions[liuqin] };
}
