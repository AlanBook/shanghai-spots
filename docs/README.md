# 景点展示网页项目

## 项目简介

这是一个基于 JSON 数据的景点展示网页系统，采用模块化开发方式，支持景点卡片式展示。

## 技术栈

- **HTML5**: 页面结构
- **CSS3**: 样式和布局（Grid 布局）
- **JavaScript (ES6+)**: 交互逻辑
- **JSON**: 数据存储

## 项目结构

```
spots/
├── index.html              # 主页面
├── spots.json              # 景点数据
├── .gitignore              # Git 忽略文件
├── .trae/
│   └── rules/
│       └── user_rules.md   # 项目开发规则
├── data/                   # 数据文件
│   └── scenic_spots.json
├── img/                    # 图片资源
├── js/
│   └── app.js              # 应用逻辑
├── styles/
│   ├── main.css            # 基础样式
│   └── style.css           # 主要样式
├── tests/                  # 测试文件
│   ├── unit/               # 单元测试
│   │   └── app.test.js
│   └── integration/        # 集成测试
│       └── integration.test.js
└── docs/                   # 文档
    ├── README.md           # 项目说明
    ├── test-records.md     # 测试记录
    └── code-review.md      # 代码评审记录
```

## 功能特性

### 1. 景点卡片展示

- 图片显示（带错误处理）
- 名称、城市、标签
- 评分（保留1位小数）
- 价格（0显示"免费"）
- 开放时间
- 描述信息

### 2. 交互功能

- 菜单切换（首页/景点列表）
- 卡片悬停效果
- 响应式网格布局

### 3. 数据处理

- JSON 数据加载
- 数据格式化
- 错误处理

## 开发规则

详见 [user_rules.md](.trae/rules/user_rules.md)

### 1. 模块化开发与测试

- 每个模块/函数都有对应的测试代码
- 新增或修改代码时确保测试用例覆盖
- 运行测试用例确保代码质量

### 2. 功能添加流程

- 生成自动测试代码
- 添加到菜单中提供手动测试入口

### 3. 本地化约定

- 图形界面文字默认使用中文

## 运行方式

1. 直接打开 `index.html` 文件
2. 或使用本地服务器：
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js
   npx http-server
   ```

## 测试

### 单元测试

```bash
# 使用 Jest 运行测试
npm test
```

测试覆盖范围：
- App 模块功能
- 景点卡片渲染
- 数据格式化
- 错误处理

### 集成测试

测试完整的页面加载和交互流程。

## 代码评审

详见 [docs/code-review.md](docs/code-review.md)

## 测试记录

详见 [docs/test-records.md](docs/test-records.md)

## 数据格式

### 景点数据结构

```json
{
  "id": "s1",
  "name": "外滩",
  "city": "Shanghai",
  "tags": ["地标", "城市景观"],
  "rating": 4.8,
  "price": 0,
  "open_time": "全天",
  "visit_minutes": 90,
  "description": "上海最具代表性的地标",
  "image": "img/s1_waitan.jpg"
}
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 版本历史

### v1.0.0 (2026-03-27)

- 初始版本
- 实现景点卡片展示
- 支持 JSON 数据加载
- 完成基础测试和文档

## 贡献指南

1. 遵循模块化开发原则
2. 新增功能必须添加测试
3. 运行测试确保质量
4. 代码提交前进行自测

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。
