# 云店模拟器后台管理系统

## 项目简介

云店模拟器后台管理系统是云店模拟器Web应用的配套管理平台，提供完整的数据管理、用户管理、配置管理等功能。

## 主要功能

### 1. 仪表盘 📊
- 实时数据统计（用户数、活跃用户、模拟次数、利润等）
- 数据趋势图表（模拟次数、用户增长）
- 店铺等级分布可视化
- 最近模拟记录列表

### 2. 用户管理 👥
- 用户列表展示（分页、搜索）
- 用户详情查看
- 用户活跃度统计
- 模拟数据追踪

### 3. 店铺配置管理 ⚙️
- 7种店铺等级配置管理
- 动态调整进货额度、费率、折扣等参数
- 实时启用/禁用店铺等级
- 颜色自定义

### 4. 福利管理 🎁
- 福利活动创建和编辑
- 奖励设置和管理
- 活动时间控制
- 优先级排序

### 5. 公告管理 📢
- 平台公告发布
- 公告编辑和删除
- 置顶功能
- 优先级设置

### 6. 数据导出 📥
- 用户数据导出（Excel/CSV格式）
- 统计数据导出（PDF格式）
- 自定义导出选项

## 技术架构

### 前端技术栈
- **框架**: Next.js 16 (App Router)
- **UI组件库**: shadcn/ui
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React
- **状态管理**: React Hooks

### 后端技术栈
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT (JSON Web Tokens)
- **验证码**: 短信API（开发环境使用固定验证码）
- **加密**: bcryptjs

### 数据导出
- **Excel/CSV**: xlsx
- **PDF**: jsPDF + jsPDF-autotable

## 快速开始

### 前置要求
- Node.js 24+
- pnpm 9.0+
- PostgreSQL 数据库

### 安装步骤

1. **克隆项目**
   ```bash
   cd /workspace/projects
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   编辑 `.env` 文件，配置数据库连接和管理员账号。

4. **初始化数据库**
   ```bash
   pnpm prisma:generate
   pnpm prisma:push
   pnpm prisma:seed
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

6. **访问后台**
   - URL: http://localhost:5000/admin
   - 手机号: 13800138000
   - 验证码: 123456（开发环境）

## 项目结构

```
src/
├── app/
│   ├── admin/                    # 后台管理页面
│   │   ├── page.tsx             # 登录页
│   │   ├── layout.tsx           # 布局（包含认证检查）
│   │   ├── dashboard/           # 仪表盘
│   │   ├── users/               # 用户管理
│   │   ├── shop-levels/         # 店铺配置
│   │   ├── benefits/            # 福利管理
│   │   └── announcements/       # 公告管理
│   └── api/
│       └── admin/               # 后台API路由
│           ├── auth/            # 认证API
│           ├── dashboard/       # 统计数据API
│           ├── users/           # 用户管理API
│           ├── shop-levels/     # 店铺配置API
│           ├── benefits/        # 福利管理API
│           └── announcements/   # 公告管理API
├── components/
│   ├── admin/                   # 后台专用组件
│   │   └── sidebar.tsx         # 侧边栏导航
│   └── ui/                      # shadcn/ui组件库
├── lib/
│   ├── prisma.ts                # Prisma客户端实例
│   ├── jwt.ts                   # JWT工具函数
│   └── admin/
│       └── auth.ts              # 认证中间件
├── types/
│   └── admin.ts                 # TypeScript类型定义
prisma/
├── schema.prisma                # Prisma数据模型
└── seed.ts                      # 数据库初始化脚本
```

## 数据库设计

### 核心表结构

1. **Admin** - 管理员表
   - 存储管理员账号、密码、权限等信息

2. **User** - 用户表
   - 存储用户基本信息、注册时间、活跃状态等

3. **ShopSimulation** - 店铺模拟数据表
   - 存储用户的模拟记录、利润数据等

4. **ShopLevelConfig** - 店铺等级配置表
   - 存储各等级的配置参数（可动态修改）

5. **Benefit** - 福利表
   - 存储福利活动信息

6. **Announcement** - 公告表
   - 存储平台公告

7. **UserReward** - 用户奖励记录表
   - 记录用户领取奖励的记录

8. **SystemLog** - 系统日志表
   - 记录管理员的操作日志

## API接口文档

### 认证模块
- `POST /api/admin/auth/send-code` - 发送验证码
- `POST /api/admin/auth/login` - 管理员登录

### 仪表盘
- `GET /api/admin/dashboard/stats` - 获取统计数据

### 用户管理
- `GET /api/admin/users?page=1&pageSize=10&search=xxx` - 获取用户列表
- `GET /api/admin/users/[id]` - 获取用户详情

### 店铺配置
- `GET /api/admin/shop-levels` - 获取等级配置
- `PUT /api/admin/shop-levels` - 更新等级配置

### 福利管理
- `GET /api/admin/benefits` - 获取福利列表
- `POST /api/admin/benefits` - 创建福利
- `PUT /api/admin/benefits` - 更新福利
- `DELETE /api/admin/benefits?id=xxx` - 删除福利

### 公告管理
- `GET /api/admin/announcements` - 获取公告列表
- `POST /api/admin/announcements` - 创建公告
- `PUT /api/admin/announcements` - 更新公告
- `DELETE /api/admin/announcements?id=xxx` - 删除公告

## 开发指南

### 添加新功能模块

1. 创建API路由：`src/app/api/admin/[module]/route.ts`
2. 创建管理页面：`src/app/admin/[module]/page.tsx`
3. 添加类型定义：`src/types/admin.ts`
4. 在侧边栏添加导航：`src/components/admin/sidebar.tsx`

### 使用Prisma Studio

```bash
pnpm prisma:studio
```

访问 http://localhost:5555 查看和编辑数据库。

## 部署指南

详细的部署指南请参考 [ADMIN_DEPLOYMENT.md](ADMIN_DEPLOYMENT.md)

### 生产环境检查清单

- [ ] 修改默认管理员密码
- [ ] 配置HTTPS
- [ ] 使用强JWT_SECRET
- [ ] 配置真实短信API
- [ ] 设置数据库备份
- [ ] 配置监控日志
- [ ] 测试所有功能模块

## 安全最佳实践

1. **密码安全**
   - 使用bcryptjs加密存储
   - 强制要求强密码
   - 定期更新密码

2. **Token安全**
   - JWT Token有效期7天
   - Token存储在localStorage
   - 每次请求验证Token

3. **API安全**
   - 所有API需要认证
   - 使用中间件验证权限
   - 防止SQL注入（Prisma自动防护）

4. **数据验证**
   - 输入数据验证
   - 输出数据脱敏
   - 错误信息不暴露敏感信息

## 常见问题

### Q: 如何修改管理员密码？
A: 需要在数据库中直接修改，或使用Prisma Studio更新。

### Q: 验证码一直错误？
A: 开发环境使用固定验证码 `123456`，确保输入正确。

### Q: 如何重置数据库？
A: 运行 `pnpm prisma:push --force-reset` （会清空所有数据，慎用！）

### Q: 数据导出功能在哪里？
A: 在各管理模块的数据表格上方有导出按钮。

## 更新日志

### v1.0.0 (2025-01-18)
- ✅ 初始版本发布
- ✅ 完成所有核心功能
- ✅ 管理员登录认证
- ✅ 仪表盘数据统计
- ✅ 用户管理
- ✅ 店铺配置管理
- ✅ 福利管理
- ✅ 公告管理
- ✅ 数据导出功能

## 技术支持

如有问题或建议，请联系技术支持团队。

---

**云店模拟器后台管理系统** © 2025
