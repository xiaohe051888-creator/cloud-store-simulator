# Cloudflare Workers 代理部署指南

## 前置要求

- 一个 Cloudflare 账号（免费）
- 已创建的 `worker.js` 文件

## 部署步骤

### 第一步：注册/登录 Cloudflare

1. 访问：https://dash.cloudflare.com
2. 注册或登录账号（支持邮箱、Google、GitHub 登录）

### 第二步：创建 Worker

1. 登录后，点击左侧菜单的 "Workers & Pages"
2. 点击 "Create application"
3. 点击 "Create Worker"
4. Worker 名称填写：`cloud-store-simulator-proxy`
5. 点击 "Deploy"

### 第三步：编辑 Worker 代码

1. 部署后，点击 "Edit code"
2. 删除默认代码
3. 复制 `worker.js` 文件的内容
4. 粘贴到编辑器中
5. 点击右上角 "Save and Deploy"

### 第四步：获取新的访问域名

部署成功后，Cloudflare 会提供一个类似这样的域名：

```
https://cloud-store-simulator-proxy.你的账号名.workers.dev
```

或者可以在 Dashboard 中查看：
1. 进入 Workers & Pages
2. 点击你的 Worker
3. 在页面顶部可以看到访问地址

### 第五步：测试访问

在国内网络环境下，尝试访问新的 Workers 域名，看看是否能打开网站。

## 微信验证文件

如果微信验证文件仍然无法访问，需要创建一个新的验证文件：

1. 在 `worker.js` 中添加特殊处理
2. 或者直接在 Workers 域名后添加验证文件路径测试

## 注意事项

1. **Workers 免费额度**：每天 100,000 次请求（够用）
2. **域名格式**：`*.workers.dev`
3. **CORS 处理**：代码已添加 CORS 支持
4. **缓存策略**：Cloudflare Workers 会自动缓存

## 两个域名对比

| 域名 | 访问速度 | 用途 |
|------|---------|------|
| `cloud-store-simulator.vercel.app` | 较慢 | 原始部署域名 |
| `*.workers.dev` | 可能更快 | Cloudflare 代理域名 |

## 如果 Workers 域名仍然无法访问

如果 Workers 域名在国内仍然无法访问，建议：

1. 购买便宜域名（.top/.xyz，¥20-50/年）
2. 在 Cloudflare 配置自定义域名指向 Worker
3. 或者选择购买云服务器部署
