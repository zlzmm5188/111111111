# AGX API v2 测试指南

## 新版本 API 端点

新版本 API 已部署在 `/api/v1/admins`，与旧版本 `/api/admin` 并存。

---

## 可用的 API 端点

### 1. 管理员登录（公开）
```bash
POST http://localhost:3001/api/v1/admins/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

**预期响应**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "超级管理员",
      "adminGroup": 0,
      "lastLoginAt": "2026-02-01 12:30:00"
    }
  },
  "timestamp": 1738423800000
}
```

---

### 2. 获取管理员列表（需要认证）
```bash
GET http://localhost:3001/api/v1/admins?page=1&pageSize=20
Authorization: Bearer YOUR_TOKEN
```

**预期响应**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "nickname": "超级管理员",
        "adminGroup": 0,
        "status": 1
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": 1738423800000
}
```

---

### 3. 获取管理员详情（需要认证）
```bash
GET http://localhost:3001/api/v1/admins/1
Authorization: Bearer YOUR_TOKEN
```

**预期响应**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "超级管理员",
    "role": "超级管理员",
    "adminGroup": 0,
    "status": 1,
    "createdAt": "2024-01-01 00:00:00"
  },
  "timestamp": 1738423800000
}
```

---

### 4. 创建管理员（超级管理员权限）
```bash
POST http://localhost:3001/api/v1/admins
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "username": "newadmin",
  "password": "password123",
  "nickname": "新管理员",
  "role": "普通管理员",
  "adminGroup": 1,
  "status": 1
}
```

**预期响应**：
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 2,
    "username": "newadmin",
    "nickname": "新管理员",
    "role": "普通管理员",
    "adminGroup": 1,
    "status": 1
  },
  "timestamp": 1738423800000
}
```

**权限不足时**：
```json
{
  "code": 1005,
  "message": "无权限",
  "data": null,
  "timestamp": 1738423800000
}
```

---

### 5. 更新管理员（超级管理员权限）
```bash
PUT http://localhost:3001/api/v1/admins/2
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "nickname": "更新后的管理员",
  "role": "高级管理员",
  "status": 1
}
```

---

### 6. 删除管理员（超级管理员权限）
```bash
DELETE http://localhost:3001/api/v1/admins/2
Authorization: Bearer YOUR_TOKEN
```

---

### 7. 分配用户到管理员（需要认证）
```bash
POST http://localhost:3001/api/v1/admins/1/assign-user
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "userId": 100,
  "assignedAdminId": 1
}
```

---

## 使用 curl 测试

### 步骤 1：登录获取 token
```bash
curl -X POST http://localhost:3001/api/v1/admins/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### 步骤 2：使用 token 访问受保护的 API
```bash
# 将上面返回的 token 替换到这里
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:3001/api/v1/admins?page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 错误处理示例

### 参数验证失败
```json
{
  "code": 1001,
  "message": "username must be longer than or equal to 4 characters",
  "data": null,
  "timestamp": 1738423800000
}
```

### 未授权
```json
{
  "code": 1002,
  "message": "未授权",
  "data": null,
  "timestamp": 1738423800000
}
```

### 资源不存在
```json
{
  "code": 3001,
  "message": "管理员不存在",
  "data": null,
  "timestamp": 1738423800000
}
```

---

## 新旧版本对比

### 旧版本（/api/admin）
```bash
GET /api/admin/admin/list?page=1&pageSize=20
```
响应格式：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 10
  }
}
```

### 新版本（/api/v1/admins）
```bash
GET /api/v1/admins?page=1&pageSize=20
```
响应格式（更规范）：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "items": [...],
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "timestamp": 1738423800000
}
```

---

## 新版本的优势

1. ✅ **RESTful 路由**：符合行业标准
   - `GET /api/v1/admins` 获取列表
   - `POST /api/v1/admins` 创建
   - `GET /api/v1/admins/:id` 获取单个
   - `PUT /api/v1/admins/:id` 更新
   - `DELETE /api/v1/admins/:id` 删除

2. ✅ **统一响应格式**：所有 API 返回一致的结构
   - `code`: 错误码
   - `message`: 消息
   - `data`: 数据
   - `timestamp`: 时间戳

3. ✅ **分页规范**：包含完整的分页信息
   - `items`: 数据列表
   - `total`: 总数
   - `page`: 当前页
   - `pageSize`: 每页大小
   - `totalPages`: 总页数
   - `hasNext`: 是否有下一页
   - `hasPrev`: 是否有上一页

4. ✅ **权限守卫**：使用装饰器声明式权限控制
   ```typescript
   @UseGuards(AdminGuard, SuperAdminGuard)
   ```

5. ✅ **标准错误码**：统一的错误码体系
   - 1000-1999: 通用错误
   - 2000-2999: 业务错误
   - 3000-3999: 管理员错误
   - 9000-9999: 系统错误

---

## 下一步

1. **测试所有端点**：使用 Postman 或 curl 测试每个 API
2. **前端适配**：更新前端代码使用新版本 API
3. **监控日志**：观察错误日志，确保没有遗漏的问题
4. **性能测试**：验证新版本 API 的性能表现

---

## 技术参考

- [API-DESIGN-GUIDE.md](./API-DESIGN-GUIDE.md) - 完整的 API 设计指南
- [API-REFACTOR-EXAMPLE.md](./API-REFACTOR-EXAMPLE.md) - 详细的重构示例
- [API-UPGRADE-PLAN.md](./API-UPGRADE-PLAN.md) - 升级计划和迁移策略
