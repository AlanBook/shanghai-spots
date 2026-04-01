#!/usr/bin/env node

/**
 * 百度地图AK配置脚本
 * 用于快速配置百度地图API密钥
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.js');
const indexPath = path.join(__dirname, 'index.html');

console.log('🤖 百度地图AK配置工具\n');

// 读取当前配置
let configContent = fs.readFileSync(configPath, 'utf8');
let indexContent = fs.readFileSync(indexPath, 'utf8');

console.log('当前配置:');
console.log('- config.js: 已找到');
console.log('- index.html: 已找到\n');

// 提示用户输入AK
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('请输入您的百度地图AK (从 https://lbsyun.baidu.com/ 获取): ', (ak) => {
    if (!ak || ak.trim() === 'YOUR_AK_HERE') {
        console.log('\n⚠️  未输入有效的AK，配置未更改');
        console.log('请手动编辑 config.js 文件');
        rl.close();
        return;
    }

    // 更新 config.js
    const newConfig = configContent.replace(
        /baiduMapAK: '.*?'/,
        `baiduMapAK: '${ak.trim()}'`
    );
    
    fs.writeFileSync(configPath, newConfig, 'utf8');
    console.log('\n✅ config.js 已更新');

    // 更新 index.html
    const newIndex = indexContent.replace(
        /ak=YOUR_AK_HERE/,
        `ak=${ak.trim()}`
    );
    
    fs.writeFileSync(indexPath, newIndex, 'utf8');
    console.log('✅ index.html 已更新');

    console.log('\n🎉 配置完成！');
    console.log('\n下一步:');
    console.log('1. 重新加载 index.html');
    console.log('2. 点击"智能路线规划模式"按钮');
    console.log('3. 选择景点并测试路线规划功能\n');
    
    console.log('详细说明请查看: SMART_ROUTE_GUIDE.md\n');
    
    rl.close();
});
