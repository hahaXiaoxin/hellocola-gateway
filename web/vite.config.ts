import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const defaultConfig = {
  site: {
    name: 'MySite',
    title: 'MySite - 个人主页',
    description: 'MySite - 个人主页与服务导航',
    subtitle: '个人空间',
    welcomeText: '欢迎来到我的站点',
    heroDescription: '这里是我的个人空间，汇集了我搭建和运行的各项服务。探索下方卡片，发现更多精彩内容。',
    copyright: 'MySite',
  },
  links: {
    github: 'https://github.com',
  },
  features: [
    { icon: 'Code2', label: '热爱编程', color: 'primary' },
    { icon: 'Server', label: '自建服务', color: 'emerald' },
    { icon: 'Rocket', label: '持续折腾', color: 'violet' },
  ],
};

function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof (result as any)[key] === 'object') {
      (result as any)[key] = deepMerge((result as any)[key], val);
    } else {
      (result as any)[key] = val;
    }
  }
  return result;
}

// Read user config, fall back to default if file doesn't exist
const siteConfigPath = path.resolve(__dirname, 'site.config.json');
let userConfig = {};
if (fs.existsSync(siteConfigPath)) {
  userConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
}
const siteConfig = deepMerge(defaultConfig, userConfig);

export default defineConfig({
  plugins: [react()],
  define: {
    __SITE_CONFIG__: JSON.stringify(siteConfig),
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
