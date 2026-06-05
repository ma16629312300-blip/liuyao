import type { PaiPanResult } from './types';
import { getXunKongDesc } from './xunkong';
import { getHexagramRelationDesc, getAdvanceRetreatDesc } from './hexagramRelation';
import yaociData from '../data/yaoci.json';

/**
 * 构建 AI 解卦的系统提示
 */
export function buildInterpretationSystemPrompt(): string {
  return `你是六爻易学大师。请根据卦象用200字以内给用户直接的吉凶判断和行动建议。结合用神旺衰、世应关系、动爻爻辞，回答要明确不模棱两可。`;
}

/**
 * 构建解卦的用户提示（包含完整排盘数据）
 */
export function buildInterpretationPrompt(result: PaiPanResult, question: string): string {
  const { originalHexagram, changedHexagram, changingLines, monthDay, yongShen, questionType, hexagramRelation, lineAdvanceRetreat } = result;

  let prompt = `## 用户问题
类型：${questionType}
问题：${question}

## 时间信息
年干支：${monthDay.yearGanZhi}
月建：${monthDay.monthZhi}月
日辰：${monthDay.dayGanZhi}（日干：${monthDay.dayGan}，日支：${monthDay.dayZhi}）
旬空：${getXunKongDesc(monthDay.dayGanZhi)}

## 起卦结果

### 本卦：${originalHexagram.name}（${originalHexagram.palace}宫）
卦辞：${originalHexagram.description}
${originalHexagram.judgment ? `彖曰：${originalHexagram.judgment}` : ''}
${originalHexagram.image ? `象曰：${originalHexagram.image}` : ''}

六爻排盘：
| 爻位 | 四象 | 干支 | 五行 | 六亲 | 六兽 | 世应 | 旺衰 | 旬空 |
|------|------|------|------|------|------|------|------|------|
`;

  for (let i = 5; i >= 0; i--) {
    const line = originalHexagram.lines[i];
    const position = ['初', '二', '三', '四', '五', '上'][i];
    const yaoLabel = line.isChanging ? `${position}爻 ✗` : `${position}爻`;
    const ganZhi = `${line.tianGan || ''}${line.dizhi || ''}`;
    const wx = line.wuxing || '';
    const lq = line.liuqin || '';
    const ls = line.liushou || '';
    const sy = line.isShi ? '世' : line.isYing ? '应' : '';
    const ws = line.wangshuai || '';
    const xk = line.isXunKong ? '空' : '';
    prompt += `| ${yaoLabel} | ${line.siXiang} | ${ganZhi} | ${wx} | ${lq} | ${ls} | ${sy} | ${ws} | ${xk} |\n`;
  }

  // 动爻爻辞
  if (changingLines.length > 0) {
    const yaociHex = yaociData.find(h => h.id === originalHexagram.id);
    if (yaociHex) {
      prompt += `\n### 动爻爻辞\n`;
      changingLines.forEach(ci => {
        const yc = yaociHex.lines[ci];
        prompt += `- ${yc.position}：${yc.text}`;
        if (yc.xiang) prompt += `（象曰：${yc.xiang}）`;
        prompt += '\n';
      });
    }
  }

  // 伏神信息
  const fushenLines = originalHexagram.lines.filter(l => l.feiShen);
  if (fushenLines.length > 0) {
    prompt += `\n### 伏神信息\n`;
    fushenLines.forEach(l => {
      const fs = l.feiShen!;
      const pos = ['初', '二', '三', '四', '五', '上'][l.index];
      prompt += `- ${pos}爻之下伏${fs.liuqin} ${fs.dizhi}（${fs.wuxing}），飞神${fs.feiYaoLiuQin} ${fs.feiYaoDizhi}，${fs.relation}\n`;
    });
  }

  // 变卦
  if (changedHexagram) {
    prompt += `\n### 变卦：${changedHexagram.name}（${changedHexagram.palace}宫）\n`;
    prompt += `卦辞：${changedHexagram.description}\n`;
    const changedIndices = changingLines.map(i => i + 1).join('、');
    prompt += `动爻：第${changedIndices}爻\n`;
  } else {
    prompt += `\n此卦为静卦（无动爻）\n`;
  }

  // 卦象关系
  if (hexagramRelation) {
    prompt += `\n### 卦象关系\n${hexagramRelation}：${getHexagramRelationDesc(hexagramRelation)}\n`;
  }

  // 进神退神
  if (lineAdvanceRetreat && lineAdvanceRetreat.some(ar => ar)) {
    prompt += `\n### 进神退神\n`;
    changingLines.forEach((ci, idx) => {
      const ar = lineAdvanceRetreat[idx];
      if (ar) {
        const pos = ['初', '二', '三', '四', '五', '上'][ci];
        prompt += `- ${pos}爻${ar}：${getAdvanceRetreatDesc(ar)}\n`;
      }
    });
  }

  prompt += `
## 分析要点
- 用神：${yongShen.liuqin}（${yongShen.description}）
- 世爻在${['初','二','三','四','五','上'][originalHexagram.shiIndex]}爻（${originalHexagram.lines[originalHexagram.shiIndex].liuqin || ''}，${originalHexagram.lines[originalHexagram.shiIndex].wangshuai || ''}）
- 应爻在${['初','二','三','四','五','上'][originalHexagram.yingIndex]}爻（${originalHexagram.lines[originalHexagram.yingIndex].liuqin || ''}）
- 月建${monthDay.monthZhi}月，日辰${monthDay.dayZhi}

请根据以上完整信息为用户解卦。`;
  return prompt;
}
