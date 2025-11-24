<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 项目总览：Neon Snake（React + Vite + Supabase）

一个现代化、响应式的经典贪吃蛇实现，支持移动端触控、邮箱注册登录、全局排行榜与实时刷新。技术栈为 React 19 + TypeScript + Vite 6，界面使用 TailwindCSS CDN，数据层使用 Supabase。

## 技术栈与关键依赖
- 前端：`react@^19.2.0`、`react-dom@^19.2.0`
- 构建：`vite@^6.2.0`、`@vitejs/plugin-react`
- 类型：`typescript@~5.8.2`、`@types/node`
- UI：TailwindCSS CDN、`lucide-react` 图标
- 后端服务：`@supabase/supabase-js@^2.84.0`

## 目录结构
```
.
├─ components/               # 组件
│  ├─ AuthModal.tsx          # 登录/注册弹窗
│  ├─ Leaderboard.tsx        # 排行榜侧栏
│  ├─ MobileControls.tsx     # 移动端方向控制
│  └─ SnakeGame.tsx          # 核心游戏逻辑与渲染
├─ services/
│  └─ api.ts                 # Supabase API 封装（用户、成绩、排行榜）
├─ supabase/
│  ├─ client.ts              # Supabase 客户端初始化
│  ├─ types.ts               # 数据库类型定义
│  └─ migrations/            # 数据库触发器/视图等迁移脚本
├─ App.tsx                   # 根组件，挂载游戏
├─ constants.ts              # 游戏常量（棋盘、速度、按键映射等）
├─ types.ts                  # 游戏类型（方向、状态、点位等）
├─ index.html                # 入口 HTML（Tailwind CDN、importmap）
├─ index.tsx                 # 入口 TS，渲染 React 应用
├─ vite.config.ts            # Vite 配置（env 注入、别名等）
├─ vercel.json               # Vercel 静态部署配置
├─ package.json              # 脚本与依赖
└─ README.md                 # 项目文档（当前文件）
```

## 架构与模块说明
- 应用入口：`index.tsx:10-15` 挂载 `App`，严格模式渲染。
- 根组件：`App.tsx:6-9` 包裹背景与 `SnakeGame`。
- 核心玩法：`components/SnakeGame.tsx`
  - 游戏时钟：`gameTick` 在 `components/SnakeGame.tsx:145-224`
  - 输入防抖与 180° 反转保护：`components/SnakeGame.tsx:233-248`
  - 生成食物：`generateFood` 在 `components/SnakeGame.tsx:13-38`
  - 暂停与恢复：`components/SnakeGame.tsx:281-284`
  - 本地最高分：`components/SnakeGame.tsx:114-119`
  - 游戏结束后上报成绩并刷新榜单：`components/SnakeGame.tsx:286-296`
- 组件配套：
  - 移动端方向键：`components/MobileControls.tsx`
  - 排行榜展示：`components/Leaderboard.tsx`
  - 登录注册弹窗：`components/AuthModal.tsx`
- 常量与类型：
  - 游戏常量：`constants.ts:3-26`
  - 类型定义：`types.ts:1-28`
- 服务封装：`services/api.ts`
  - 获取当前用户：`services/api.ts:6-12`
  - 写入/更新用户信息：`services/api.ts:14-33`
  - 上报成绩：`services/api.ts:35-58`
  - 查询全局排行榜：`services/api.ts:60-72`
- Supabase 客户端：`supabase/client.ts`
  - 多来源环境变量解析并创建客户端：`supabase/client.ts:7-25`
  - 构建期注入常量：`vite.config.ts:13-18`（`__SUPABASE_URL__`、`__SUPABASE_ANON_KEY__`）
- 数据库类型：`supabase/types.ts`（`leaderboard`/`leaderboard_global` 视图、`profiles`/`scores` 表）
- 数据库迁移：自动创建/更新用户档案触发器：`supabase/migrations/20251124_create_auth_user_profile_trigger.sql:1-29`

## 游戏机制
- 棋盘与速度：`BOARD_SIZE=20`，初始速度 `150ms`，每吃一枚食物提速 `2ms`，最小 `50ms`。
- 初始蛇身：3 段，默认向上移动（`constants.ts:8-15`）。
- 碰撞判定：越界或自撞触发 `GAME_OVER`（`components/SnakeGame.tsx:169-185`）。
- 食物生成：避开蛇身，极端情况下返回 `(-1,-1)` 作为安全回退（`components/SnakeGame.tsx:13-38`）。
- 色彩路径：每次进食沿彩虹色序列推进蛇身颜色（`components/SnakeGame.tsx:54-76,207-220`）。
- 交互：键盘方向键/WASD、移动端触控；空格暂停/恢复（`components/SnakeGame.tsx:250-259,439-446`）。
- 最高分：保存在 `localStorage`（`components/SnakeGame.tsx:114-119`）。

## 排行榜与账号体系（Supabase）
- 登录/注册：邮箱密码模式（弹窗 UI），出错提示友好（`components/AuthModal.tsx`）。
- 档案同步：注册成功后 `profiles` 表 `upsert` 默认用户名（`services/api.ts:14-33`）。
- 成绩上报：`scores.insert` 写入成绩，携带模式/时长/棋盘大小（`services/api.ts:35-58`）。
- 全局榜单：`leaderboard_global` 视图取用户最高分并展示（`services/api.ts:60-72`）。
- 实时刷新：订阅 `scores` 的 `INSERT` 事件，收到后重拉榜单（`components/SnakeGame.tsx:132-143`）。
- 触发器：`auth.users` 新增后自动插入/更新 `public.profiles`（`supabase/migrations/...sql`）。

## 环境变量与构建
- 必需变量：
  - `VITE_SUPABASE_URL=https://<project>.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<anon-jwt>`
- 可选变量：
  - `GEMINI_API_KEY`（已通过 `define` 注入到 `process.env`，当前项目未直接使用）
- 构建期注入：`vite.config.ts` 使用 `loadEnv` 将上述变量编译为常量，避免运行时缺失。

## 开发与脚本
- 安装依赖：
  - `npm install`
- 本地开发：
  - `npm run dev`（默认端口 `3000`，`vite.config.ts:8-11`）
- 生产构建与预览：
  - `npm run build`
  - `npm run preview`

## 部署（Vercel）
- 静态构建：`vercel.json` 指定 `@vercel/static-build`，产物目录 `dist`。
- 重写规则：将非静态资源路径重写到 `index.html` 以支持前端路由（`vercel.json:13-18`）。
- 部署前检查：确保在 Vercel 的各环境变量中配置 `VITE_SUPABASE_URL/ANON_KEY`。

## 设计与可访问性
- UI 风格：霓虹风格，阴影与渐变提升层次（见 `components/SnakeGame.tsx`）。
- A11y：移动端按钮包含 `aria-label`；键盘操作具备视觉反馈。
- 触控优化：使用 `onPointerDown` 阻止默认滚动行为，`index.html` 设置 `overscroll-behavior`。

## 已知限制
- 当棋盘接近填满时，食物生成将返回回退坐标并停止新增食物（可扩展 WIN 状态）。
- 项目未包含自动化测试、ESLint/Prettier 配置；后续可按团队规范补充。

## 快速开始
1. 安装依赖：
   ```bash
   npm install
   ```
2. 创建环境文件并配置变量（本地或部署平台）：
   ```bash
   # .env.local
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-jwt>
   ```
3. 本地运行：
   ```bash
   npm run dev
   ```
4. 构建与预览：
   ```bash
   npm run build && npm run preview
   ```

## 故障排查
- 登录弹窗显示 “Supabase 未配置”：
  - 检查变量名是否包含 `VITE_` 前缀；确保在构建环境中可见。
  - 确认已使用 `npm run build` 产出并部署 `dist` 静态文件。
  - `supabase/client.ts` 控制台会打印 `hasUrl/hasKey` 布尔值便于定位。
  - 在 Supabase 后台启用 Email/Password 提供方并设置 Redirect URLs。

## 团队协作约定（摘要）
- Git 分支：使用 `feature/`、`bugfix/`、`docs/` 等前缀与 `kebab-case`。
- 提交信息：遵循 Conventional Commits，如 `docs(readme): add project overview`。
- 合并策略：通过 PR，主分支保持可部署；建议使用 squash merge。

—— 完 ——
