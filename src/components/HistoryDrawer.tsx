import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useLiuyaoStore } from '../store/useLiuyaoStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ isOpen, onClose }: Props) {
  const { history, deleteHistoryEntry, clearHistory, setQuestion, setPaiPan } = useLiuyaoStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleViewEntry = (entry: (typeof history)[0]) => {
    setQuestion(entry.question, entry.questionType);
    setPaiPan(entry.paiPan);
    onClose();
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[rgba(20,14,8,0.6)] shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(184,160,128,0.1)]">
              <h3 className="text-lg font-serif font-bold text-[#f0e6d3] flex items-center gap-2">
                <Clock size={20} className="text-gold-500" />
                占卜历史
              </h3>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    onClick={() => setConfirmClear(!confirmClear)}
                    className="p-2 text-[#6b5c44] hover:text-[#ef4444] rounded-lg hover:bg-red-50 transition-colors"
                    title="清空历史"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-[#6b5c44] hover:text-[#c9a96e] rounded-lg hover:bg-[rgba(30,22,14,0.5)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Clear confirmation */}
            <AnimatePresence>
              {confirmClear && (
                <motion.div
                  className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertTriangle size={18} className="text-[#ef4444] shrink-0" />
                  <span className="text-sm text-[#f87171] flex-1">确认清空全部历史？此操作不可恢复。</span>
                  <button
                    onClick={() => { clearHistory(); setConfirmClear(false); }}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 bg-[rgba(20,14,8,0.6)] border border-[rgba(239,68,68,0.2)] text-[#f87171] text-xs rounded-lg"
                  >
                    取消
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#6b5c44]">
                  <Clock size={40} className="mb-3 opacity-30" />
                  <p>暂无占卜历史</p>
                  <p className="text-xs mt-1">完成一次占卜后将自动保存</p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(184,160,128,0.04)]">
                  {history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      className="px-5 py-4 hover:bg-[rgba(30,22,14,0.5)]/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => handleViewEntry(entry)}
                          className="flex-1 text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#d4c0a0] group-hover:text-gold-700 transition-colors line-clamp-1">
                              {entry.question}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#6b5c44]">
                            <span>{formatDate(entry.timestamp)}</span>
                            <span>·</span>
                            <span className="px-1.5 py-0.5 bg-[rgba(35,25,16,0.6)] rounded-full text-[#8b7355]">
                              {entry.questionType}
                            </span>
                            <span>·</span>
                            <span className="text-[#8b7355] font-medium">
                              {entry.paiPan.originalHexagram.name}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => deleteHistoryEntry(entry.id)}
                          className="p-1.5 text-[#4a3d2e] hover:text-[#ef4444] rounded-lg hover:bg-red-50 transition-colors shrink-0 mt-0.5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[rgba(184,160,128,0.1)] text-center">
              <span className="text-xs text-[#6b5c44]">
                最多保留 50 条记录 · 数据存储在本地浏览器
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
