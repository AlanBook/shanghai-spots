# 智能路线规划功能使用指南

## 功能概述

智能路线规划功能已集成百度地图路径规划API，提供以下特性：

### ✅ 已实现功能

1. **百度地图API集成**
   - 自动加载百度地图JavaScript API
   - 支持自定义AK配置
   - 坐标自动转换（WGS84 ↔ 百度墨卡托）

2. **路线优化算法**
   - 调用百度地图路径规划API
   - 自动计算最优路线
   - 支持多出行方式（驾车/公交/骑行/步行）
   - 途经点自动识别

3. **用户界面**
   - 智能路线规划模式按钮
   - 景点选择（checkbox多选）
   - 路线规划结果展示
   - 出行方式选择

## 配置步骤

### 1. 获取百度地图AK

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 登录百度账号
3. 进入【控制台】→【我的应用】
4. 点击【创建应用】
   - 应用类型：浏览器端
   - 白名单：`*`（开发阶段）
5. 复制生成的AK

### 2. 配置AK

#### 方式一：修改 index.html（推荐）

在 `index.html` 第9行：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=YOUR_AK_HERE"></script>
```

将 `YOUR_AK_HERE` 替换为您的实际AK：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=你的实际AK"></script>
```

#### 方式二：修改 config.js

在 `config.js` 中：

```javascript
const AppConfig = {
    baiduMapAK: '你的实际AK',
    enableSmartRoute: true
};
```

### 3. 测试配置

访问 `test-smart-route.html` 运行测试：

```
file:///d:/Download/模块课/生成式软件开发/lab2/Lab2/spots/test-smart-route.html
```

测试内容：
- ✅ API加载状态
- ✅ 坐标转换功能
- ✅ 路线规划API调用

## 使用方法

### 启用智能路线规划

1. 打开 `index.html`
2. 点击"🤖 智能路线规划模式"按钮
3. 在景点列表中点击checkbox选择景点
   - 至少选择2个景点
   - 可以选择任意数量
4. 点击"确定选择"按钮
5. 系统自动调用百度地图API计算最优路线
6. 选择出行方式
7. 在百度地图中查看详细路线

### 智能路线优化原理

```
用户选择景点
    ↓
提取景点坐标（WGS84）
    ↓
转换为百度墨卡托坐标
    ↓
调用百度地图路径规划API
    ↓
计算最优路线（考虑距离、时间）
    ↓
优化景点访问顺序
    ↓
展示路线规划结果
```

### 出行方式说明

- **🚗 驾车**：推荐，支持途经点，自动优化路线
- **🚌 公共交通**：不支持途经点，仅适用于2个景点
- **🚲 骑行**：不支持途经点，仅适用于2个景点
- **🚶 步行**：不支持途经点，仅适用于2个景点

## 技术实现

### 核心函数

#### 1. `wgs84ToBaiduMercator(lat, lng)`
将WGS84坐标转换为百度墨卡托坐标

```javascript
const mc = App.wgs84ToBaiduMercator(31.069224, 121.500653);
// 返回: { x: 13525390.82, y: 3641742.51 }
```

#### 2. `optimizeRouteWithBaiduAPI(spotInfos)`
调用百度地图API进行路线优化

```javascript
const optimizedSpots = await App.optimizeRouteWithBaiduAPI(spotInfos);
```

#### 3. `confirmSmartRouteDesign()`
确认智能路线设计

```javascript
App.confirmSmartRouteDesign();
```

### 数据流程

```
spots.json (WGS84坐标)
    ↓
loadScenicSpots()
    ↓
selectedSmartRouteSpots (用户选择)
    ↓
confirmSmartRouteDesign()
    ↓
wgs84ToBaiduMercator() (坐标转换)
    ↓
optimizeRouteWithBaiduAPI() (API调用)
    ↓
showSmartRouteResult() (展示结果)
```

## 测试指南

### 单元测试

运行 `test-smart-route.html` 进行功能测试：

```javascript
// 测试API加载
testBaiduMapAPI();

// 测试坐标转换
testCoordinateConversion();

// 测试路线规划
testRoutePlanning();

// 运行全部测试
runAllTests();
```

### 手动测试

1. 选择2-3个上海景点：
   - 外滩 (s1)
   - 东方明珠 (s2)
   - 上海中心 (s3)

2. 点击"确定选择"

3. 查看路线规划结果

4. 选择出行方式（推荐驾车）

5. 在百度地图中查看详细路线

### 预期结果

- ✅ 路线规划结果展示
- ✅ 景点顺序优化
- ✅ 出行方式选择
- ✅ 百度地图链接生成

## 常见问题

### Q1: API加载失败？

**问题**：控制台显示 `BMap is not defined`

**解决方案**：
1. 检查 `index.html` 中的AK配置
2. 确认网络连接正常
3. 访问 百度地图开放平台 确认应用已启用
4. 检查白名单设置

### Q2: 坐标转换不准确？

**问题**：路线规划结果不准确

**解决方案**：
1. 检查 `spots.json` 中的 `location` 字段
2. 确认使用WGS84坐标（经纬度）
3. 系统会自动转换，无需手动处理

### Q3: 路线规划结果不符合预期？

**问题**：景点顺序未优化

**解决方案**：
1. 确保选择了至少2个景点
2. 检查百度地图API是否正常调用
3. 查看浏览器控制台错误信息
4. 尝试重新选择景点

### Q4: 途经点功能不可用？

**问题**：只有驾车模式支持途经点

**说明**：
- 途经点功能仅在驾车模式下可用
- 公交、骑行、步行模式不支持途经点
- 选择3个及以上景点时自动识别途经点

## 文件结构

```
spots/
├── index.html              # 主页面
├── config.js              # 配置文件（AK等）
├── js/
│   └── app.js             # 主应用逻辑
├── styles/
│   └── style.css          # 样式文件
├── spots.json             # 景点数据
├── test-smart-route.html  # 测试页面
└── BAIDU_MAP_CONFIG.md    # 配置说明
```

## 开发者说明

### 修改路线优化算法

在 `app.js` 中修改 `optimizeRouteWithBaiduAPI` 函数：

```javascript
optimizeRouteWithBaiduAPI: async function(spotInfos) {
    // 自定义路线优化逻辑
    // 返回优化后的景点数组
    return optimizedSpots;
}
```

### 添加新的出行方式

在 `showSmartRouteResult` 函数中添加：

```javascript
const travelModes = ['transit', 'riding', 'walking', 'driving', 'your_new_mode'];
```

### 调试技巧

```javascript
// 在控制台查看当前配置
console.log(App);

// 查看已选择的景点
console.log(App.selectedSmartRouteSpots);

// 测试坐标转换
console.log(App.wgs84ToBaiduMercator(31.069224, 121.500653));
```

## 版本历史

### v1.0.0 (2026-03-30)
- ✅ 集成百度地图JavaScript API v3.0
- ✅ 实现路线优化算法
- ✅ 支持多出行方式
- ✅ 添加测试页面
- ✅ 完善坐标转换功能

## 许可证

本项目使用百度地图API，需遵守百度地图开放平台服务条款。

## 支持

如有问题，请检查：
1. 百度地图开放平台状态
2. AK配置是否正确
3. 浏览器控制台错误信息
4. 网络连接状态
