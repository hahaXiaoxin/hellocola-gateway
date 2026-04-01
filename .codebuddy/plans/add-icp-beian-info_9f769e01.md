---
name: add-icp-beian-info
overview: 在站点配置中添加 ICP 备案信息字段，并在 Footer 组件底部展示备案号及链接到工信部首页。
todos:
  - id: update-types
    content: 在 global.d.ts 中添加 icp 字段类型定义
    status: completed
  - id: update-default-config
    content: 在 vite.config.ts 的 defaultConfig 中添加 icp 默认值
    status: completed
  - id: update-footer
    content: 修改 Footer 组件，条件渲染备案信息链接
    status: completed
    dependencies:
      - update-types
  - id: update-example
    content: 更新 site.config.example.json 添加 icp 配置示例
    status: completed
---

## 用户需求

在网站配置和页脚中添加 ICP 备案信息展示功能。

## 核心功能

- 在 `__SITE_CONFIG__` 全局配置中新增 `icp` 字段，包含备案号和工信部链接
- 在网关首页底部（Footer 组件）展示备案号，并链接到工信部首页
- 默认配置中 `icp` 字段留空，用户可通过 `site.config.json` 自行配置

## 技术栈

- 前端框架：React + TypeScript + Vite
- 样式：Tailwind CSS

## 实现方案

在现有配置架构基础上扩展，新增 `icp` 配置项：

1. **类型声明扩展**：在 `global.d.ts` 的 `SiteConfig` 接口中添加 `icp` 字段类型
2. **默认配置补充**：在 `vite.config.ts` 的 `defaultConfig` 中添加 `icp` 默认值（空字符串），确保未配置时不报错也不显示
3. **Footer 组件改造**：条件渲染备案信息，仅当 `icp.code` 非空时才展示

## 实现细节

- `icp.code` 为备案号，如 "粤ICP备2026030105号"
- `icp.url` 为工信部备案查询地址，默认为 "https://beian.miit.gov.cn"
- Footer 中备案号以链接形式展示，点击跳转到工信部页面，新窗口打开

## 目录结构

```
web/
├── src/
│   ├── global.d.ts           # [MODIFY] 添加 icp 类型定义
│   └── components/
│       └── Footer.tsx        # [MODIFY] 添加备案信息展示
├── vite.config.ts            # [MODIFY] 添加 icp 默认配置
└── site.config.example.json  # [MODIFY] 添加 icp 配置示例
```