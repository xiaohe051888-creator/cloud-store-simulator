// PWA图标生成脚本
const fs = require('fs');
const path = require('path');

// 创建简单的SVG图标
function generateSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="bg-gradient-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- 圆角矩形背景 -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" fill="url(#bg-gradient-${size})"/>

  <!-- 云朵图标 -->
  <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size * 0.7 / 100})">
    <!-- 主云朵形状 -->
    <path d="M50 65 C35 65 25 55 25 40 C25 25 35 15 50 15 C55 5 70 5 80 15 C90 15 95 25 95 35 C105 40 105 55 95 60 C95 65 80 70 50 65" fill="white" opacity="0.95"/>

    <!-- 简化的云朵形状 -->
    <ellipse cx="45" cy="45" rx="25" ry="20" fill="white" opacity="0.9"/>
    <ellipse cx="65" cy="42" rx="20" ry="18" fill="white" opacity="0.9"/>
    <ellipse cx="55" cy="38" rx="18" ry="15" fill="white" opacity="0.9"/>
  </g>

  <!-- 店铺/闪电图标 -->
  <g transform="translate(${size * 0.35}, ${size * 0.35}) scale(${size * 0.3 / 100})">
    <polygon points="50,5 20,60 45,60 35,95 80,35 55,35" fill="#fbbf24" stroke="white" stroke-width="4"/>
  </g>

  <!-- 文字：云店 -->
  <text x="${size / 2}" y="${size * 0.85}" 
        text-anchor="middle" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.12}" 
        font-weight="bold" 
        fill="white">云店</text>
</svg>`;
}

// 保存SVG文件
function saveSVG(size) {
  const svg = generateSVG(size);
  const svgPath = path.join(__dirname, '../public', `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ 已生成: ${svgPath}`);
  return svgPath;
}

// 主函数
async function main() {
  console.log('开始生成PWA图标...\n');

  // 生成SVG文件
  const svg192 = saveSVG(192);
  const svg512 = saveSVG(512);

  console.log('\n提示：');
  console.log('1. SVG图标已生成，可以直接使用（浏览器支持）');
  console.log('2. 如需PNG格式，可使用在线转换工具或以下命令：');
  console.log('   - 使用rsvg-convert（需安装librsvg）:');
  console.log(`     rsvg-convert -w 192 -h 192 -o ../public/icon-192.png ${svg192}`);
  console.log(`     rsvg-convert -w 512 -h 512 -o ../public/icon-512.png ${svg512}`);
  console.log('3. 或者使用在线SVG转PNG工具\n');

  console.log('✅ SVG图标生成完成！');
}

main().catch(console.error);
