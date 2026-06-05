# 🔮 六爻占卜 · 纳甲筮法

> 传统六爻纳甲筮法在线起卦排盘解卦系统  
> 暗夜庙堂主题 · 沉浸式摇卦体验 · AI + 本地双模式解卦

## ✨ 功能

- **铜钱起卦** — 模拟三枚铜钱六次摇卦，含电影级仪式动画
- **完整排盘** — 纳甲、六亲、六兽、世应、旺衰、旬空、伏神飞神
- **六合六冲** — 卦象关系识别（六合/六冲/伏吟/反吟/游魂/归魂）
- **进神退神** — 动爻进退方向判断
- **用神取用** — 15 种问题类型自动匹配用神
- **双模式解卦** — AI 云端解卦 + 本地规则引擎（离线可用）
- **64 卦详解** — 全部 64 卦×6 爻共 384 条爻辞
- **历史记录** — 本地存储，最多 50 条
- **键盘操作** — 空格/回车摇卦
- **PWA 支持** — 可添加到桌面离线使用

## 🛠 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion + CSS Animations |
| 状态管理 | Zustand |
| 后端 | Express 5 (本地) / Vercel Serverless (生产) |
| AI | DeepSeek / OpenAI / Claude (可配置) |
| PWA | vite-plugin-pwa |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 启动开发（前端 + 后端）
npm run dev:all
```

打开 http://localhost:5173

## 📦 部署

### Vercel（推荐）

1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. 设置环境变量：
   - `API_PROVIDER` — `deepseek` / `openai` / `claude`
   - `API_KEY` — 你的 API 密钥
   - `API_BASE_URL` — API 地址
   - `API_MODEL` — 模型名称

### 自行部署

```bash
npm run build    # 构建前端
npm run start    # 启动后端（Express + 静态文件）
```

## 📁 项目结构

```
src/
├── components/        # React 组件
│   ├── QuestionStep   # 首页（问题输入）
│   ├── TossStep       # 摇卦仪式
│   ├── ResultView     # 结果展示
│   ├── HexagramCard   # 卦象卡片（爻线绘制动画）
│   ├── PaiPanTable    # 排盘详情表
│   ├── InterpretationPanel  # 解卦面板
│   ├── HistoryDrawer  # 历史记录
│   └── BackgroundEffects    # 背景特效
├── engine/            # 核心引擎
│   ├── toss           # 起卦
│   ├── hexagram       # 卦象匹配
│   ├── najia          # 纳甲装卦
│   ├── liuqin/liushou # 六亲六兽
│   ├── wangshuai      # 旺衰判断
│   ├── yongshen       # 用神取用
│   ├── calendar       # 干支/节气历
│   ├── xunkong        # 旬空计算
│   ├── fushen         # 伏神飞神
│   ├── hexagramRelation  # 六合六冲进退
│   └── localInterpretation  # 本地解卦
├── data/              # 数据
│   ├── hexagrams.json # 64 卦
│   ├── yaoci.json     # 384 爻辞
│   ├── ganzhi.json    # 干支
│   └── najia-rules.json  # 纳甲规则
└── store/             # 状态管理
```

## ⚠️ 声明

卦象仅供参考，最终决策请结合实际情况理性判断。
