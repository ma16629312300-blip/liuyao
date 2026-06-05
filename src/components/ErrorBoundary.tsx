import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 组件崩溃:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0602' }}>
          <motion.div
            className="text-center px-8 py-12 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#f0e6d3] mb-3">
              灵台震动，卦象暂隐
            </h2>
            <p className="text-[#8b7355] text-sm mb-2">
              天机运转中出了点小差错，请重新来过。
            </p>
            {this.state.error && (
              <details className="mb-6">
                <summary className="text-xs text-[#4a3d2e] cursor-pointer hover:text-[#6b5c44]">
                  查看详情
                </summary>
                <pre className="mt-2 text-xs text-left text-[#8b7355] bg-[rgba(0,0,0,0.3)] rounded-lg p-3 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <motion.button
              onClick={this.handleReset}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-serif shadow-lg transition-colors"
            >
              <RotateCcw size={18} />
              重新起卦
            </motion.button>
            <p className="mt-6 text-xs text-[#4a3d2e]">
              若问题持续，请刷新页面
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
