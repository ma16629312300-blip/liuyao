import { motion } from 'framer-motion';
import type { PaiPanResult } from '../engine/types';
import { getXunKongDesc } from '../engine/xunkong';
import { getHexagramRelationDesc, getAdvanceRetreatDesc } from '../engine/hexagramRelation';

interface Props {
  paiPan: PaiPanResult;
}

const POSITIONS = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

const SI_XIANG_LABEL: Record<string, string> = {
  '老阳': '⚊ ○', '少阴': '⚍', '少阳': '⚌', '老阴': '⚋ ×',
};

const WANG_SHUAI_COLOR: Record<string, string> = {
  '旺': 'text-green-400 font-semibold',
  '相': 'text-green-500',
  '休': 'text-yellow-500',
  '囚': 'text-orange-400',
  '死': 'text-red-400',
};

export default function PaiPanTable({ paiPan }: Props) {
  const {
    originalHexagram, changedHexagram, changingLines,
    monthDay, yongShen, hexagramRelation, lineAdvanceRetreat,
  } = paiPan;
  const lines = originalHexagram.lines;

  return (
    <motion.div
      className="bg-[rgba(20,14,8,0.6)] backdrop-blur-xl rounded-2xl border border-[rgba(184,160,128,0.15)] shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[rgba(30,22,14,0.5)] to-[rgba(232,185,49,0.05)] border-b border-[rgba(184,160,128,0.1)]">
        <h3 className="text-lg font-serif font-bold text-[#f0e6d3] text-center">六爻排盘</h3>
        <div className="flex items-center justify-center gap-4 mt-2 text-sm text-[#b8a080] flex-wrap">
          <span>年：{monthDay.yearGanZhi}</span>
          <span>月建：{monthDay.monthZhi}月</span>
          <span>日辰：{monthDay.dayGanZhi}</span>
          <span className="text-[#8b7355]">{getXunKongDesc(monthDay.dayGanZhi)}</span>
        </div>

        {/* 卦象关系标注 */}
        {hexagramRelation && (
          <div className="mt-3 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              hexagramRelation === '六合' || hexagramRelation === '归魂'
                ? 'bg-[rgba(34,197,94,0.1)] text-green-400 border border-[rgba(34,197,94,0.2)]'
                : hexagramRelation === '六冲' || hexagramRelation === '反吟'
                ? 'bg-[rgba(239,68,68,0.1)] text-red-400 border border-[rgba(239,68,68,0.2)]'
                : 'bg-[rgba(251,191,36,0.1)] text-amber-400 border border-[rgba(251,191,36,0.2)]'
            }`}>
              {hexagramRelation}　·　{getHexagramRelationDesc(hexagramRelation)}
            </span>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(184,160,128,0.1)] bg-[rgba(30,22,14,0.5)]/50">
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">爻位</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">四象</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">干支</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">五行</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">六亲</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">六兽</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">世应</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">旺衰</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">用神</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">旬空</th>
              <th className="py-3 px-2 text-[#b8a080] font-medium text-center text-xs">伏神</th>
            </tr>
          </thead>
          <tbody>
            {[...lines].reverse().map((line, displayIdx) => {
              const idx = line.index;
              const isChanging = changingLines.includes(idx);
              const isYongShen = yongShen.lineIndex === idx;
              const arIndex = changingLines.indexOf(idx);
              const ar = arIndex >= 0 ? lineAdvanceRetreat[arIndex] : null;

              return (
                <motion.tr
                  key={idx}
                  className={`border-b border-[rgba(184,160,128,0.05)] transition-colors ${
                    isChanging ? 'bg-[rgba(239,68,68,0.06)]' : ''
                  } ${line.isShi ? 'bg-[rgba(232,185,49,0.06)]' : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: displayIdx * 0.06 }}
                >
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-medium text-xs ${isChanging ? 'text-[#f87171]' : 'text-[#d4c0a0]'}`}>
                      {POSITIONS[idx]}
                    </span>
                    {isChanging && (
                      <span className="block text-[10px] text-[#f87171] mt-0.5">动</span>
                    )}
                  </td>
                  <td className={`py-2.5 px-2 text-center text-sm ${isChanging ? 'text-[#f87171] font-medium' : 'text-[#b8a080]'}`}>
                    {SI_XIANG_LABEL[line.siXiang] || line.siXiang}
                  </td>
                  <td className={`py-2.5 px-2 text-center font-medium ${
                    line.isXunKong ? 'text-[#4a3d2e] line-through' : 'text-[#d4c0a0]'
                  }`}>
                    {line.tianGan}{line.dizhi}
                  </td>
                  <td className="py-2.5 px-2 text-center text-[#c9a96e] text-xs">
                    {line.wuxing}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`text-xs ${
                      line.liuqin === '官鬼' || line.liuqin === '妻财'
                        ? 'font-medium text-[#d4c0a0]'
                        : 'text-[#b8a080]'
                    }`}>
                      {line.liuqin}
                    </span>
                    {/* 进神退神标注 */}
                    {ar && (
                      <span className={`block text-[10px] mt-0.5 ${
                        ar === '进神' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {ar}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-[10px] text-[#8b7355]">
                    {line.liushou}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {line.isShi ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e8b931] text-[#0a0602] text-xs font-bold">世</span>
                    ) : line.isYing ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10b981] text-white text-xs font-bold">应</span>
                    ) : (
                      <span className="text-[#4a3d2e]">—</span>
                    )}
                  </td>
                  <td className={`py-2.5 px-2 text-center text-xs ${WANG_SHUAI_COLOR[line.wangshuai || ''] || 'text-[#b8a080]'}`}>
                    {line.wangshuai}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {isYongShen ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.2)] text-blue-400 text-[10px] font-medium">
                        用神
                      </span>
                    ) : (
                      <span className="text-[#4a3d2e] text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {line.isXunKong ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.1)] text-red-400 text-[10px] font-medium">
                        空
                      </span>
                    ) : (
                      <span className="text-[#4a3d2e] text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {line.feiShen ? (
                      <div className="text-[10px]">
                        <span className="text-[#8b7355]">
                          伏{line.feiShen.liuqin} {line.feiShen.dizhi}
                        </span>
                        <span className="block text-[#6b5c44]">
                          {line.feiShen.relation}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#4a3d2e] text-[10px]">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[rgba(184,160,128,0.06)]">
        {[...lines].reverse().map((line, displayIdx) => {
          const idx = line.index;
          const isChanging = changingLines.includes(idx);
          const isYongShen = yongShen.lineIndex === idx;
          const arIndex = changingLines.indexOf(idx);
          const ar = arIndex >= 0 ? lineAdvanceRetreat[arIndex] : null;

          return (
            <motion.div
              key={idx}
              className={`p-4 grid grid-cols-3 gap-2 text-sm ${
                isChanging ? 'bg-[rgba(239,68,68,0.06)] border-l-2 border-red-400/50' : ''
              } ${line.isShi ? 'border-l-2 border-gold-400/50' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayIdx * 0.06 }}
            >
              {/* Row 1: Position + markers */}
              <div className="col-span-3 flex items-center gap-2 mb-1">
                <span className={`text-lg font-bold ${isChanging ? 'text-[#f87171]' : 'text-[#d4c0a0]'}`}>
                  {POSITIONS[idx]}
                </span>
                {line.isShi && <span className="px-1.5 py-0.5 rounded bg-[#e8b931]/80 text-[#0a0602] text-xs font-bold">世</span>}
                {line.isYing && <span className="px-1.5 py-0.5 rounded bg-[#10b981]/80 text-white text-xs font-bold">应</span>}
                {isYongShen && <span className="px-1.5 py-0.5 rounded bg-[rgba(59,130,246,0.3)] text-blue-300 text-xs font-bold">用</span>}
                {isChanging && <span className="px-1.5 py-0.5 rounded bg-[rgba(239,68,68,0.2)] text-red-400 text-xs">动</span>}
                {line.isXunKong && <span className="px-1.5 py-0.5 rounded bg-[rgba(239,68,68,0.1)] text-red-400 text-xs border border-[rgba(239,68,68,0.2)]">旬空</span>}
                {ar && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    ar === '进神' ? 'bg-[rgba(34,197,94,0.1)] text-green-400' : 'bg-[rgba(239,68,68,0.1)] text-red-400'
                  }`}>{ar}</span>
                )}
              </div>

              <div>
                <span className="text-[#6b5c44] text-xs">干支：</span>
                <span className={`text-[#d4c0a0] font-medium text-xs ${line.isXunKong ? 'line-through opacity-50' : ''}`}>
                  {line.tianGan}{line.dizhi}
                </span>
              </div>
              <div>
                <span className="text-[#6b5c44] text-xs">六亲：</span>
                <span className="text-[#c9a96e] text-xs">{line.liuqin}</span>
              </div>
              <div className="text-right">
                <span className="text-[#b8a080] text-xs">{SI_XIANG_LABEL[line.siXiang] || line.siXiang}</span>
              </div>

              <div>
                <span className="text-[#6b5c44] text-xs">五行：</span>
                <span className="text-[#c9a96e] text-xs">{line.wuxing}</span>
              </div>
              <div>
                <span className="text-[#6b5c44] text-xs">六兽：</span>
                <span className="text-[#b8a080] text-xs">{line.liushou}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs ${WANG_SHUAI_COLOR[line.wangshuai || ''] || 'text-[#b8a080]'}`}>
                  {line.wangshuai}
                </span>
              </div>

              {/* 伏神 row */}
              {line.feiShen && (
                <div className="col-span-3 mt-1 pt-1.5 border-t border-[rgba(184,160,128,0.1)]">
                  <span className="text-[#8b7355] text-xs">
                    伏神：{line.feiShen.liuqin} {line.feiShen.dizhi}（{line.feiShen.wuxing}）
                    飞神：{line.feiShen.feiYaoLiuQin} {line.feiShen.feiYaoDizhi}
                  </span>
                  <span className="block text-[#6b5c44] text-[10px]">{line.feiShen.relation}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="px-6 py-4 bg-[rgba(30,22,14,0.5)]/50 border-t border-[rgba(184,160,128,0.1)]">
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[#b8a080]">
          <span>
            <strong className="text-[#d4c0a0]">用神：</strong>
            {yongShen.liuqin}（{yongShen.description}）
          </span>
          <span>
            <strong className="text-[#d4c0a0]">世爻：</strong>
            {POSITIONS[originalHexagram.shiIndex]}（{lines[originalHexagram.shiIndex].liuqin}）
          </span>
          <span>
            <strong className="text-[#d4c0a0]">应爻：</strong>
            {POSITIONS[originalHexagram.yingIndex]}（{lines[originalHexagram.yingIndex].liuqin}）
          </span>
          {changingLines.length > 0 && (
            <span>
              <strong className="text-[#f87171]">动爻：</strong>
              {changingLines.map(i => POSITIONS[i]).join('、')}
            </span>
          )}
          {lineAdvanceRetreat.some(ar => ar) && (
            <span>
              <strong className="text-[#c9a96e]">进退：</strong>
              {changingLines.map((i, idx) =>
                lineAdvanceRetreat[idx]
                  ? `${POSITIONS[i]}${lineAdvanceRetreat[idx]}`
                  : null
              ).filter(Boolean).join('、')}
            </span>
          )}
          {/* 伏神汇总 */}
          {lines.some(l => l.feiShen) && (
            <span className="w-full mt-1 text-xs text-[#8b7355]">
              <strong className="text-[#c9a96e]">伏神：</strong>
              用神不上卦，伏藏于本宫。需待日辰月建冲开飞神方可得出。
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
