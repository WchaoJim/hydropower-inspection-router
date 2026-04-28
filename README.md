# 水电站智能巡检系统界面原型

这是根据 6 张界面图整理的可预览、可交互 React 前端原型。

## 已完成

1. 更接近附件图的深蓝科技大屏视觉风格。
2. 使用 React Router 进行页面切换。
3. 使用 ECharts 生成真实图表。
4. 左侧“某某水电站智能巡检平台”可编辑，并通过 localStorage 本地保存，刷新不丢失。
5. 已整理为可上传 GitHub 的完整 Vite + React 项目结构。
6. 已附带 GitHub Pages 自动部署 workflow。

## 页面

- 首页驾驶舱
- 机器狗巡检
- 无人机巡检
- 缺陷与报警
- 巡检报告
- 系统设置

## 本地运行

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
```

## 本地预览打包结果

```bash
npm run preview
```

## 部署到 GitHub Pages

1. 新建 GitHub 仓库。
2. 上传本项目全部文件。
3. 进入仓库 Settings → Pages。
4. Source 选择 GitHub Actions。
5. 推送到 main 或 master 分支后，会自动构建并部署。

## 说明

当前为前端原型，数据均为静态模拟数据。正式项目还需要接入：

- 后端接口
- 数据库
- 机器狗 SDK / API
- 无人机 SDK / API
- 视频流服务
- AI 识别服务
- 权限与账号体系
