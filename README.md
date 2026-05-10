# 🌸 产后 AI 疗愈卡片 (Postpartum AI Healing Card)

> _“她不是变胖了，她只是刚刚完成一场生命的接力。”_
> _不用急着改变自己，先给身体一点温柔的回应。本应用旨在为产后妈妈提供一个无评判、充满共情的数字疗愈空间。_

## 📖 项目立意 (Project Purpose)

产后妈妈往往面临着身材变化、身份认同缺失、孤独感、疲惫以及深深的内疚感。本项目旨在为产后女性提供一个**无评判、充满共情**的数字疗愈空间。

通过抽取和选择“负面念头”，结合刮刮卡等隐喻交互，最终引导用户进入由大语言模型（AI）驱动的疗愈陪伴系统。AI 将扮演一个温暖的倾听者，不急于给出说教式的建议，而是给予深深的接纳与共情，帮助产后妈妈缓解焦虑，重建自我认同。

主打理念：**倾诉 · 陪伴 · 疗愈**

## 🚀 核心功能 & 使用流程 (Features & Workflow)

本应用设计了完整且沉浸的疗愈心流，主要包含以下步骤：

1. **🌟 启程接纳 (HomePage)**
   - 温暖的视觉与文案，传递对产后身体的感激与接纳，点击“我准备好了”即可开启专属的疗愈之旅。
2. **🌧️ 直面焦虑 (AnxietyPage)**
   - 具象化产后常见的痛点场景（身材焦虑、身份缺失、缺乏支持、养育内疚、身心疲惫、社交隔离）。
   - 用户可以多选符合自身当下状态的“负面念头”。
3. **✨ 情绪刮刮卡 (ScratchPage)**
   - **核心交互**：利用 HTML5 Canvas 实现刮刮卡效果 (`useScratchCard.js`)。
   - 用户通过手指涂抹/鼠标刮开屏幕上的“苛责与焦虑”，底层会显露出温暖的自我感激与关怀文案，完成情绪的初步转化。
4. **💬 击碎与重塑 (TransformPage & ChatWindow)**
   - 将收集到的所有负念进行“击碎”的隐喻操作。
   - **AI 专属疗愈**：系统将用户的负面情绪作为上下文，发送至云端大语言模型（基于 DeepSeek-V4-flash），通过 Server-Sent Events (SSE) 流式返回一段量身定制的温柔寄语。
   - **陪伴对话**：提供持续的聊天窗口，AI 扮演温暖的倾听者，不急于给建议，而是给予深深的共情与接纳。

## 🛠️ 技术栈 (Tech Stack)

本项目基于现代前端化工程构建，轻量且高效：

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) (用于全局管理页面流转、用户选项及 AI 对话上下文)
- **AI 驱动**: 大语言模型 (通过 `/api/chat` 代理调用 `deepseek-v4-flash`，采用 SSE 数据流传输，实现打字机效果)
- **辅助库**: `html2canvas` (用于将最终生成的疗愈卡片保存/分享为图片)

## 📁 核心目录结构 (Directory Structure)

```text
├── src/
│   ├── components/      # UI 组件 (如 ChatWindow 聊天组件)
│   ├── composables/     # 组合式函数 (如 useScratchCard 刮刮卡交互逻辑)
│   ├── data/            # 静态配置数据 (如 healingData.js 中的文案与图片地址)
│   ├── pages/           # 页面视图 (如 HomePage, AnxietyPage, ScratchPage 等)
│   ├── store/           # Pinia 状态管理 (useHealingStore.js 集中管理应用状态与 AI 接口)
│   ├── style.css        # 全局样式
│   ├── App.vue          # 根组件
│   └── main.js          # 应用入口
├── package.json         # 项目依赖与脚本配置
└── vite.config.js       # Vite 配置文件 (通常包含 /api/chat 的本地跨域代理)
```
