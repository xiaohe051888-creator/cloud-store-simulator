# 云店模拟器后台管理系统 - 部署指南

## 系统概述

云店模拟器后台管理系统是一个完整的Web管理平台，用于管理云店模拟器的用户、店铺配置、福利、公告等数据。

## 功能特性

✅ **用户管理**
- 查看用户列表（分页、搜索）
- 查看用户详情
- 统计用户活跃度

✅ **数据统计**
- 仪表盘数据展示
- 用户增长趋势图表
- 店铺等级分布
- 模拟次数统计

✅ **店铺配置管理**
- 动态修改店铺等级参数
- 实时调整费率、额度等
- 启用/禁用店铺等级

✅ **福利管理**
- 创建/编辑/删除福利活动
- 管理奖励发放
- 设置活动时间

✅ **公告管理**
- 发布平台公告
- 编辑/删除公告
- 设置公告优先级和置顶

✅ **数据导出**
- 导出用户数据（Excel/CSV）
- 导出统计数据（PDF）
- 自定义导出格式

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI组件**: shadcn/ui + Tailwind CSS 4
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT + 验证码
- **图表**: Recharts
- **导出**: xlsx, jsPDF

## 部署步骤

### 1. 环境准备

确保已安装：
- Node.js 24+
- pnpm 9.0+
- PostgreSQL 数据库

### 2. 配置数据库

#### 2.1 创建数据库

```sql
CREATE DATABASE cloud_shop_db;
```

#### 2.2 配置环境变量

复制 `.env.example` 文件为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/cloud_shop_db?schema=public"

# JWT密钥（请使用随机生成的强密码）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 管理员账号（初始化时创建）
ADMIN_PHONE="13800138000"
ADMIN_PASSWORD="admin123456"

# 验证码配置（生产环境需配置真实短信API）
SMS_API_KEY="your-sms-api-key"
SMS_API_SECRET="your-sms-api-secret"

# 应用配置
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_ADMIN_URL="https://your-domain.com/admin"
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 初始化数据库

#### 4.1 生成 Prisma Client

```bash
pnpm prisma:generate
```

#### 4.2 推送数据库结构

```bash
pnpm prisma:push
```

#### 4.3 填充初始数据

```bash
pnpm prisma:seed
```

初始管理员账号：
- 手机号：13800138000（或您配置的ADMIN_PHONE）
- 密码：admin123456（或您配置的ADMIN_PASSWORD）
- 开发环境验证码：123456

### 5. 本地开发

```bash
pnpm dev
```

访问：http://localhost:5000/admin

### 6. 生产构建

```bash
pnpm build
pnpm start
```

## 目录结构

```
src/
├── app/
│   ├── admin/                    # 后台管理页面
│   │   ├── page.tsx             # 登录页
│   │   ├── dashboard/           # 仪表盘
│   │   ├── users/               # 用户管理
│   │   ├── shop-levels/         # 店铺配置
│   │   ├── benefits/            # 福利管理
│   │   └── announcements/       # 公告管理
│   └── api/
│       └── admin/               # 后台API接口
│           ├── auth/            # 认证相关
│           ├── dashboard/       # 统计数据
│           ├── users/           # 用户管理
│           ├── shop-levels/     # 店铺配置
│           ├── benefits/        # 福利管理
│           └── announcements/   # 公告管理
├── components/
│   ├── admin/                   # 后台组件
│   │   └── sidebar.tsx         # 侧边栏导航
│   └── ui/                      # shadcn/ui组件
├── lib/
│   ├── prisma.ts                # Prisma客户端
│   ├── jwt.ts                   # JWT工具
│   └── admin/
│       └── auth.ts              # 认证中间件
├── types/
│   └── admin.ts                 # 后台类型定义
prisma/
├── schema.prisma                # 数据库模型
└── seed.ts                      # 初始数据
```

## API接口文档

### 认证相关

- `POST /api/admin/auth/send-code` - 发送验证码
- `POST /api/admin/auth/login` - 管理员登录

### 仪表盘

- `GET /api/admin/dashboard/stats` - 获取统计数据

### 用户管理

- `GET /api/admin/users` - 获取用户列表（分页、搜索）
- `GET /api/admin/users/[id]` - 获取用户详情

### 店铺配置

- `GET /api/admin/shop-levels` - 获取所有等级配置
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

## 常见问题

### 1. 数据库连接失败

检查 `DATABASE_URL` 配置是否正确，确保PostgreSQL服务已启动。

### 2. Prisma Client未生成

运行 `pnpm prisma:generate` 重新生成。

### 3. 登录验证码错误

开发环境使用固定验证码 `123456`，生产环境需配置真实短信API。

### 4. 数据导出功能报错

确保已安装相关依赖：`xlsx`, `jspdf`, `jspdf-autotable`。

## 安全建议

1. **修改默认密码**：部署后立即修改管理员默认密码
2. **配置HTTPS**：生产环境必须使用HTTPS
3. **使用强密码**：JWT_SECRET使用随机生成的长字符串
4. **定期备份**：定期备份数据库数据
5. **权限控制**：限制API访问权限

## 维护命令

```bash
# 查看数据库
pnpm prisma:studio

# 重置数据库（慎用！）
pnpm prisma:push --force-reset

# 迁移数据库
pnpm prisma migrate dev

# 检查类型错误
pnpm ts-check
```

## 联系支持

如有问题，请联系技术支持团队。

---

**祝部署顺利！**
