const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'spots.json');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  
  const updatedData = data.replace(/baike\.baidu\.com/g, 'm.baike.com');
  
  fs.writeFile(filePath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('写入文件失败:', err);
      return;
    }
    console.log('成功更新所有链接为 m.baike.com 格式');
  });
});