# 代码审查和质量检查技能

## 描述
系统化的代码审查流程，帮助发现潜在问题、提升代码质量、确保最佳实践。

## 审查维度

### 1. 功能正确性
- [ ] 代码是否实现了需求的全部功能
- [ ] 边界条件是否处理正确
- [ ] 错误处理是否完善
- [ ] 业务逻辑是否正确

### 2. 代码质量
- [ ] 命名是否清晰、有意义
- [ ] 函数是否单一职责
- [ ] 代码是否有重复（DRY 原则）
- [ ] 是否有过度复杂的逻辑
- [ ] 是否有魔法数字或硬编码

### 3. 性能问题
- [ ] 是否有 N+1 查询问题
- [ ] 循环中是否有不必要的计算
- [ ] 是否缺少必要的缓存
- [ ] 数据库查询是否优化
- [ ] 是否有内存泄漏风险

### 4. 安全性
- [ ] 用户输入是否验证
- [ ] SQL 注入防护
- [ ] XSS 攻击防护
- [ ] CSRF 防护
- [ ] 敏感信息是否加密
- [ ] 权限检查是否完善

### 5. 可维护性
- [ ] 代码是否易读易懂
- [ ] 是否有必要的注释
- [ ] 是否遵循项目编码规范
- [ ] 是否有单元测试
- [ ] 是否有文档更新

## 常见问题检测

### 后端 (NestJS) 常见问题

#### ❌ 问题 1: 没有数据验证
```typescript
// 错误示例
@Post()
async create(@Body() dto: any) {  // any 类型
  return this.service.create(dto);
}

// ✅ 正确示例
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

@Post()
@UsePipes(ValidationPipe)
async create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}
```

#### ❌ 问题 2: 缺少错误处理
```typescript
// 错误示例
async findOne(id: number) {
  const user = await this.repository.findOne({ where: { id } });
  return user.profile; // 如果 user 为 null 会报错
}

// ✅ 正确示例
async findOne(id: number) {
  const user = await this.repository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User #${id} not found`);
  }
  return user.profile;
}
```

#### ❌ 问题 3: N+1 查询问题
```typescript
// 错误示例
async getUsers() {
  const users = await this.userRepository.find();
  // 循环中查询，产生 N+1 问题
  for (const user of users) {
    user.orders = await this.orderRepository.find({ 
      where: { userId: user.id } 
    });
  }
  return users;
}

// ✅ 正确示例
async getUsers() {
  return this.userRepository.find({
    relations: ['orders'], // 使用 join 一次性查询
  });
}
```

#### ❌ 问题 4: 缺少事务
```typescript
// 错误示例
async transferMoney(fromId, toId, amount) {
  await this.walletService.deduct(fromId, amount);
  await this.walletService.add(toId, amount); // 如果这里失败，前面已经扣款
}

// ✅ 正确示例
async transferMoney(fromId, toId, amount) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    await queryRunner.manager.decrement(Wallet, { userId: fromId }, 'balance', amount);
    await queryRunner.manager.increment(Wallet, { userId: toId }, 'balance', amount);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

#### ❌ 问题 5: 密码未加密
```typescript
// 错误示例
async createUser(dto: CreateUserDto) {
  const user = this.repository.create({
    ...dto,
    password: dto.password // 明文存储
  });
  return this.repository.save(user);
}

// ✅ 正确示例
async createUser(dto: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user = this.repository.create({
    ...dto,
    password: hashedPassword
  });
  return this.repository.save(user);
}
```

### 前端 (Vue 3) 常见问题

#### ❌ 问题 1: 响应式数据使用错误
```javascript
// 错误示例
const user = ref({ name: 'John' })
user.name = 'Jane' // 错误！没有使用 .value

// ✅ 正确示例
const user = ref({ name: 'John' })
user.value.name = 'Jane'
```

#### ❌ 问题 2: 内存泄漏
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

// 错误示例
onMounted(() => {
  setInterval(() => {
    console.log('tick')
  }, 1000)
  // 没有清理定时器！
})

// ✅ 正确示例
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    console.log('tick')
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
```

#### ❌ 问题 3: 不必要的重复渲染
```vue
<!-- 错误示例 -->
<template>
  <div v-for="item in expensiveComputation()" :key="item.id">
    {{ item.name }}
  </div>
</template>

<!-- ✅ 正确示例 -->
<script setup>
import { computed } from 'vue'

const processedItems = computed(() => expensiveComputation())
</script>

<template>
  <div v-for="item in processedItems" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

#### ❌ 问题 4: API 请求未处理错误
```javascript
// 错误示例
async function loadData() {
  const data = await api.getData()
  list.value = data
}

// ✅ 正确示例
async function loadData() {
  loading.value = true
  try {
    const data = await api.getData()
    list.value = data
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
    console.error('Load data error:', error)
  } finally {
    loading.value = false
  }
}
```

#### ❌ 问题 5: 组件通信不规范
```vue
<!-- 错误示例：直接修改 props -->
<script setup>
const props = defineProps(['count'])
props.count++ // 错误！
</script>

<!-- ✅ 正确示例：使用 emit -->
<script setup>
const props = defineProps(['count'])
const emit = defineEmits(['update:count'])

function increment() {
  emit('update:count', props.count + 1)
}
</script>
```

## 自动化检查工具

### 1. ESLint 配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'vue/multi-word-component-names': 'off'
  }
}
```

### 2. 提交前检查
```json
// package.json
{
  "scripts": {
    "lint": "eslint --ext .ts,.vue src",
    "lint:fix": "eslint --ext .ts,.vue src --fix",
    "type-check": "tsc --noEmit"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check"
    }
  }
}
```

## 安全审查清单

### 数据验证
- [ ] 所有用户输入都经过验证
- [ ] 使用 DTO 和 class-validator
- [ ] 前后端都有验证

### 认证授权
- [ ] API 端点有认证守卫
- [ ] 权限检查正确实现
- [ ] Token 正确存储和传输

### 敏感数据
- [ ] 密码使用 bcrypt 加密
- [ ] 不在日志中输出敏感信息
- [ ] API 响应不返回敏感字段

### SQL 安全
- [ ] 使用参数化查询
- [ ] 避免字符串拼接 SQL
- [ ] 使用 ORM 的安全方法

### XSS 防护
- [ ] 用户输入经过转义
- [ ] 使用 v-html 时要谨慎
- [ ] CSP 策略配置

## 性能审查清单

### 数据库
- [ ] 关键字段添加索引
- [ ] 避免 N+1 查询
- [ ] 使用分页而非全量查询
- [ ] 关键操作使用事务

### 缓存
- [ ] 频繁查询使用缓存
- [ ] 缓存过期策略合理
- [ ] 缓存更新逻辑正确

### 前端
- [ ] 路由懒加载
- [ ] 图片懒加载
- [ ] 使用 computed 缓存计算
- [ ] 长列表虚拟滚动

## 可维护性审查

### 代码结构
- [ ] 文件组织清晰
- [ ] 模块职责单一
- [ ] 没有循环依赖

### 命名规范
- [ ] 变量命名语义化
- [ ] 函数名动词开头
- [ ] 类名使用 PascalCase
- [ ] 常量使用 UPPER_CASE

### 注释文档
- [ ] 复杂逻辑有注释
- [ ] 公共 API 有文档注释
- [ ] TODO/FIXME 有跟踪
- [ ] 业务规则有说明

## 审查流程

1. **自查阶段**
   - 运行 lint 检查
   - 运行测试用例
   - 自己 review 一遍代码

2. **提交前检查**
   - 确认功能完整
   - 检查控制台无错误
   - 验证边界情况

3. **代码审查**
   - 检查上述所有维度
   - 提出改进建议
   - 标记必须修改的问题

4. **修改验证**
   - 确认问题已修复
   - 重新测试
   - 通过后合并

## 审查输出模板

```markdown
## 代码审查报告

### 文件：path/to/file.ts

#### 功能正确性
- ✅ 功能实现完整
- ⚠️  缺少边界情况处理（第 45 行）

#### 代码质量
- ❌ 函数过长，建议拆分（第 100-200 行）
- ⚠️  变量命名不清晰：`data1`, `temp`

#### 性能问题
- ❌ 存在 N+1 查询（第 78 行）
- ✅ 数据库查询已优化

#### 安全性
- ❌ 缺少输入验证（第 34 行）
- ✅ 密码加密正确

#### 可维护性
- ⚠️  复杂逻辑缺少注释（第 120-150 行）
- ✅ 代码结构清晰

### 总体评价
需要修改后再审查

### 必须修改的问题
1. 添加输入验证
2. 修复 N+1 查询
3. 拆分过长函数

### 建议改进
1. 改进变量命名
2. 添加注释说明业务逻辑
```
