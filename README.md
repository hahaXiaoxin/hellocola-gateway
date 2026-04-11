# HelloCola Gateway

轻量级动态域名网关，支持服务注册、心跳保活、自动反向代理和过期清理。适用于个人或小团队在同一台服务器上托管多个服务，并通过子域名自动路由。

## 工作原理

```
用户请求 xxx.hellocola.cloud
        │
        ▼
┌──────────────┐     ┌───────────────────┐
│    Nginx     │────▶│   Gateway (3000)  │
│  (SSL 终止)  │     │   Express 应用     │
└──────────────┘     └───────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
            ProxyEngine            StaticServe
         (匹配 Host → 转发)      (门户首页 SPA)
```

1. 外部服务通过 API 注册自身（域名 + 转发目标地址）
2. Gateway 自动为该域名创建反向代理
3. 服务需定时发送心跳保活，超时未心跳将被自动注销
4. 访问主域名 `hellocola.cloud` 展示所有已注册服务的导航页

## 技术栈

- **后端**: Node.js + Express + TypeScript + http-proxy-middleware
- **前端**: React 18 + Vite + Tailwind CSS
- **部署**: Docker + Nginx（SSL 终止）
- **包管理**: pnpm monorepo

## 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 8

### 本地开发

```bash
# 安装依赖
pnpm install

# 同时启动前后端开发服务
pnpm dev:server   # 后端 http://localhost:3000
pnpm dev:web      # 前端 http://localhost:5173 (代理 /api → localhost:3000)
```

### 生产构建

```bash
# 构建前端和后端
pnpm build

# 启动生产服务
pnpm start
```

### Docker 部署

```bash
# 创建外部网络（首次）
docker network create hellocola-net

# 启动服务
docker compose up -d
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `DATA_DIR` | `server/data` | 数据持久化目录 |
| `LOG_LEVEL` | `info` | 日志级别 |
| `REAPER_INTERVAL_MS` | `10000` | 过期检查间隔（ms） |
| `DEFAULT_TTL` | `30` | 默认心跳超时（秒） |
| `PENDING_CONFIRM_TIMEOUT` | `60` | 待确认服务超时（秒） |

## API 文档

Base URL: `https://hellocola.cloud/api`

### 注册/更新服务

```
POST /api/services
Content-Type: application/json

{
  "domain": "myapp.hellocola.cloud",
  "target": "http://localhost:8080",
  "name": "My App",
  "description": "我的应用服务",
  "ttl": 30
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "domain": "myapp.hellocola.cloud",
    "target": "http://localhost:8080",
    "name": "My App",
    "description": "我的应用服务",
    "status": "active",
    "ttl": 30,
    "lastHeartbeat": "2025-01-01T00:00:00.000Z",
    "registeredAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 心跳保活

```
PUT /api/services/:domain/heartbeat
```

示例: `PUT /api/services/myapp.hellocola.cloud/heartbeat`

### 注销服务

```
DELETE /api/services/:domain
```

### 查询所有服务

```
GET /api/services
```

### 查询单个服务

```
GET /api/services/:domain
```

### 健康检查

```
GET /api/health
```

## 如何接入（面向 AI / 自动化服务）

以下是一个完整的接入示例，展示如何让你的服务自动注册到 `hellocola.cloud` 网关并保持在线。

### 接入流程

```
你的服务启动
    │
    ├─ 1. POST /api/services  → 注册到网关
    │
    ├─ 2. 定时 PUT /heartbeat → 心跳保活（建议每 10~15 秒）
    │
    └─ 3. 用户访问 xxx.hellocola.cloud → 流量自动转发到你的服务
```

### Node.js 接入示例

```typescript
const GATEWAY_URL = 'https://hellocola.cloud';
const SERVICE_CONFIG = {
  domain: 'myapp.hellocola.cloud',  // 你的子域名
  target: 'http://localhost:8080',   // 你的服务实际地址
  name: 'My App',
  description: '这是我的应用',
  ttl: 30,                           // 心跳超时秒数
};

// 1. 注册服务
async function register() {
  const res = await fetch(`${GATEWAY_URL}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(SERVICE_CONFIG),
  });
  const data = await res.json();
  console.log('注册结果:', data);
}

// 2. 心跳保活（每 10 秒）
function startHeartbeat() {
  setInterval(async () => {
    try {
      await fetch(
        `${GATEWAY_URL}/api/services/${SERVICE_CONFIG.domain}/heartbeat`,
        { method: 'PUT' }
      );
    } catch (err) {
      console.error('心跳失败:', err);
    }
  }, 10_000);
}

// 3. 优雅退出时注销
async function deregister() {
  await fetch(
    `${GATEWAY_URL}/api/services/${SERVICE_CONFIG.domain}`,
    { method: 'DELETE' }
  );
}

process.on('SIGTERM', async () => {
  await deregister();
  process.exit(0);
});

// 启动
register().then(startHeartbeat);
```

### Python 接入示例

```python
import requests
import threading
import signal
import sys

GATEWAY_URL = 'https://hellocola.cloud'
DOMAIN = 'myapp.hellocola.cloud'

def register():
    """注册服务到网关"""
    res = requests.post(f'{GATEWAY_URL}/api/services', json={
        'domain': DOMAIN,
        'target': 'http://localhost:8080',
        'name': 'My App',
        'description': '这是我的应用',
        'ttl': 30,
    })
    print('注册结果:', res.json())

def heartbeat():
    """每 10 秒发送心跳"""
    try:
        requests.put(f'{GATEWAY_URL}/api/services/{DOMAIN}/heartbeat')
    except Exception as e:
        print(f'心跳失败: {e}')
    threading.Timer(10, heartbeat).start()

def deregister(*args):
    """注销服务"""
    requests.delete(f'{GATEWAY_URL}/api/services/{DOMAIN}')
    sys.exit(0)

signal.signal(signal.SIGTERM, deregister)

register()
heartbeat()
```

### cURL 快速测试

```bash
# 注册服务
curl -X POST https://hellocola.cloud/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test.hellocola.cloud",
    "target": "http://localhost:8080",
    "name": "Test Service"
  }'

# 发送心跳
curl -X PUT https://hellocola.cloud/api/services/test.hellocola.cloud/heartbeat

# 查看所有服务
curl https://hellocola.cloud/api/services

# 注销服务
curl -X DELETE https://hellocola.cloud/api/services/test.hellocola.cloud
```

### 接入注意事项

1. **心跳间隔**: 建议设置为 TTL 的 1/3（默认 TTL=30s，心跳间隔 10s）
2. **幂等注册**: 重复调用 `POST /api/services` 不会创建重复服务，而是更新已有记录
3. **域名格式**: 使用 `xxx.hellocola.cloud` 格式的子域名
4. **target 地址**: 如果你的服务和网关在同一 Docker 网络中，可使用容器名作为 host（如 `http://my-container:8080`）；否则使用宿主机可访问的地址
5. **优雅退出**: 建议在服务关闭时主动调用 DELETE 注销，避免等待超时

## 项目结构

```
hellocola-gateway/
├── server/                    # 后端服务
│   └── src/
│       ├── index.ts           # 入口文件
│       ├── app.ts             # GatewayApp 主应用
│       ├── api/               # REST API 控制器
│       ├── core/              # 核心模块（注册中心/代理引擎/收割器）
│       ├── middleware/        # Express 中间件
│       ├── types/             # TypeScript 类型
│       └── utils/             # 配置/日志工具
├── web/                       # 前端门户
│   └── src/
│       ├── components/        # React 组件
│       ├── hooks/             # 自定义 Hook
│       ├── services/          # API 调用层
│       └── types/             # 前端类型
├── nginx/                     # Nginx 配置
├── docker-compose.yml         # Docker 编排
├── Dockerfile                 # 多阶段构建
└── pnpm-workspace.yaml        # Monorepo 配置
```

## License

MIT
