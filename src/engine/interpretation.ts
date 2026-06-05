import type { PaiPanResult } from './types';
import { getXunKongDesc } from './xunkong';
import { getHexagramRelationDesc, getAdvanceRetreatDesc } from './hexagramRelation';
import yaociData from '../data/yaoci.json';

/**
 * 构建 AI 解卦的系统提示
 */
export function buildInterpretationSystemPrompt(): string {
  return `你是一位精通六爻预测的易学大师。你熟悉《增删卜易》、《卜筮正宗》、《易隐》等经典六爻著作，
精通纳甲筮法、五行生克、六亲六兽、世应用神、旺衰空破、伏神飞神、旬空月破、六合六冲、进神退神等六爻理论。

请根据卦象为用户提供专业、详尽的解卦分析。你的解读应包含：

1. **卦象总览**：本卦和变卦的基本含义，动爻信息，爻辞解读
2. **旬空分析**：空亡之爻对事态的影响
3. **世应用神分析**：世爻和应爻的关系，用神的旺衰状态。若有伏神，分析伏神能否出现
4. **五行生克**：用神受生受克情况，吉凶判断
5. **六亲六兽**：六亲分布和六兽的辅助信息
6. **卦象关系**：六合六冲伏吟反吟等关系对事态的影响
7. **进神退神**：动爻的进退方向对事态发展的影响
8. **综合论断**：结合用户的问题给出直接、明确的回答
9. **建议**：根据卦象给出具体的行动建议

注意：
- 用专业术语但要通俗易懂地解释
- 不要模棱两可，给出明确的判断
- 结合用户具体问题，不要泛泛而谈
- 保持传统六爻的严谨性，不要随意编造
- 如果看到爻辞，务必结合爻辞内容进行解读`;
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
