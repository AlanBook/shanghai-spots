# 百度地图API配置说明

## 配置步骤

### 1. 获取百度地图AK

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 登录您的百度账号
3. 进入【控制台】→【我的应用】
4. 点击【创建应用】
5. 选择应用类型为"浏览器端"
6. 设置白名单（开发时可设置为 `*`）
7. 创建完成后，复制您的 AK（访问密钥）

### 2. 配置AK

#### 方法一：直接修改 index.html

在 `index.html` 文件的第9行，将 `YOUR_AK_HERE` 替换为您的实际AK：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=YOUR_AK_HERE"></script>
```

改为：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=你的实际AK"></script>
```

#### 方法二：修改 config.js

在 `config.js` 文件中修改：

```javascript
const AppConfig = {
    baiduMapAK: '你的实际AK',
    enableSmartRoute: true
};
```

然后在 `index.html` 中使用：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=' + AppConfig.baiduMapAK + '"></script>
```

### 3. 启用智能路线规划

在 `config.js` 中设置：

```javascript
const AppConfig = {
    baiduMapAK: '你的实际AK',
    enableSmartRoute: true  // 设置为 true 启用智能路线规划
};
```

## 智能路线规划功能说明

### 功能特点

1. **路线优化**：通过百度地图路径规划API自动计算最优路线
2. **多出行方式**：支持驾车、公交、骑行、步行等多种出行方式
3. **途经点支持**：3个及以上景点自动识别途经点
4. **坐标转换**：自动将WGS84坐标转换为百度墨卡托坐标

### 使用方法

1. 点击"智能路线规划模式"按钮进入模式
2. 在景点列表中点击checkbox选择景点（至少2个）
3. 点击"确定选择"按钮
4. 系统自动调用百度地图API计算最优路线
5. 选择出行方式，在百度地图中查看详细路线

### 技术实现

- **API调用**：使用百度地图JavaScript API v3.0
- **路线规划**：使用 `BMap.DrivingRoute` 进行驾车路线规划
- **坐标转换**：WGS84 ↔ 百度墨卡托坐标转换
- **智能排序**：根据路线规划结果自动优化景点访问顺序

## 注意事项

1. 确保网络连接正常
2. AK必须在百度地图开放平台正确配置
3. 百度地图API有调用次数限制，请注意配额
4. 智能路线规划需要至少2个景点
5. 途经点功能仅在驾车模式下可用

## 常见问题

### Q: API调用失败怎么办？

A: 请检查：
- AK是否正确配置
- 百度地图API是否正常加载
- 网络连接是否正常
- 百度地图开放平台应用是否启用

### Q: 景点坐标不准确？

A: 系统会自动从景点数据中提取坐标信息。如果坐标不准确，可以：
- 检查 `spots.json` 中的 `location` 字段
- 或者在百度地图开放平台更新景点坐标

### Q: 如何测试智能路线规划？

A: 
1. 选择2-3个上海知名景点（如外滩、东方明珠、上海中心）
2. 点击"确定选择"
3. 查看路线规划结果
4. 在百度地图中查看详细路线
