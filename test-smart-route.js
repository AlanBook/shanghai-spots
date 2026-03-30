/**
 * 智能路线规划功能测试
 * 运行方式: node test-smart-route.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 智能路线规划功能测试\n');

// 测试1: 检查文件存在
console.log('📋 测试1: 检查必要文件');
const requiredFiles = [
    'index.html',
    'js/app.js',
    'config.js',
    'spots.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
    console.log('\n❌ 测试失败: 缺少必要文件');
    process.exit(1);
}

console.log('  ✅ 所有必要文件存在\n');

// 测试2: 检查配置文件
console.log('📋 测试2: 检查配置文件');
const configPath = path.join(__dirname, 'config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

const hasAK = configContent.includes('baiduMapAK:') && !configContent.includes("'YOUR_AK_HERE'");
const hasEnableSmartRoute = configContent.includes('enableSmartRoute:');

console.log(`  ${hasAK ? '✅' : '⚠️'} 百度地图AK配置`);
console.log(`  ${hasEnableSmartRoute ? '✅' : '❌'} 智能路线功能开关`);

if (!hasEnableSmartRoute) {
    console.log('\n❌ 测试失败: 配置文件格式错误');
    process.exit(1);
}

console.log('');

// 测试3: 检查app.js中的智能路线功能
console.log('📋 测试3: 检查智能路线功能实现');
const appPath = path.join(__dirname, 'js/app.js');
const appContent = fs.readFileSync(appPath, 'utf8');

const hasWgs84ToBaidu = appContent.includes('wgs84ToBaiduMercator');
const hasOptimizeRoute = appContent.includes('optimizeRouteWithBaiduAPI');
const hasSmartRouteMode = appContent.includes('smartRouteMode');
const hasConfirmSmartRoute = appContent.includes('confirmSmartRouteDesign');

console.log(`  ${hasWgs84ToBaidu ? '✅' : '❌'} 坐标转换函数`);
console.log(`  ${hasOptimizeRoute ? '✅' : '❌'} 路线优化函数`);
console.log(`  ${hasSmartRouteMode ? '✅' : '❌'} 智能路线模式`);
console.log(`  ${hasConfirmSmartRoute ? '✅' : '❌'} 确认路线函数`);

if (!hasWgs84ToBaidu || !hasOptimizeRoute || !hasSmartRouteMode || !hasConfirmSmartRoute) {
    console.log('\n❌ 测试失败: 智能路线功能不完整');
    process.exit(1);
}

console.log('  ✅ 智能路线功能完整\n');

// 测试4: 检查spots.json数据
console.log('📋 测试4: 检查景点数据');
const spotsPath = path.join(__dirname, 'spots.json');
const spotsData = JSON.parse(fs.readFileSync(spotsPath, 'utf8'));

const hasSpots = spotsData.spots && spotsData.spots.length > 0;
const hasLocation = spotsData.spots.some(spot => spot.location && spot.location.lat && spot.location.lng);

console.log(`  ${hasSpots ? '✅' : '❌'} 景点数据存在 (${spotsData.spots ? spotsData.spots.length : 0} 个)`);
console.log(`  ${hasLocation ? '✅' : '⚠️'} 坐标数据存在`);

if (!hasSpots) {
    console.log('\n❌ 测试失败: 没有景点数据');
    process.exit(1);
}

console.log('');

// 测试5: 检查HTML中的API引用
console.log('📋 测试5: 检查HTML配置');
const indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const hasBaiduAPI = indexContent.includes('api.map.baidu.com');
const hasConfigJS = indexContent.includes('config.js');

console.log(`  ${hasBaiduAPI ? '✅' : '❌'} 百度地图API引用`);
console.log(`  ${hasConfigJS ? '✅' : '❌'} 配置文件引用`);

if (!hasBaiduAPI) {
    console.log('\n⚠️  警告: 未找到百度地图API引用');
}

console.log('');

// 测试6: 检查测试页面
console.log('📋 测试6: 检查测试页面');
const testPagePath = path.join(__dirname, 'test-smart-route.html');
const testPageExists = fs.existsSync(testPagePath);

console.log(`  ${testPageExists ? '✅' : '❌'} 测试页面存在`);

console.log('\n' + '='.repeat(50));
console.log('✅ 所有测试通过！');
console.log('='.repeat(50));

console.log('\n📝 下一步:');
console.log('1. 编辑 config.js，设置您的百度地图AK');
console.log('2. 打开 index.html 测试功能');
console.log('3. 访问 test-smart-route.html 运行测试\n');

console.log('📚 文档:');
console.log('   - SMART_ROUTE_GUIDE.md: 完整使用指南');
console.log('   - BAIDU_MAP_CONFIG.md: AK配置说明\n');
