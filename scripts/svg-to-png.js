// SVG转PNG脚本
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSVGToPNG(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`✓ 已转换: ${pngPath} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`✗ 转换失败 ${svgPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('开始转换SVG图标为PNG...\n');

  const results = await Promise.all([
    convertSVGToPNG(
      path.join(__dirname, '../public/icon-192.svg'),
      path.join(__dirname, '../public/icon-192.png'),
      192
    ),
    convertSVGToPNG(
      path.join(__dirname, '../public/icon-512.svg'),
      path.join(__dirname, '../public/icon-512.png'),
      512
    ),
  ]);

  if (results.every(r => r)) {
    console.log('\n✅ 所有图标转换完成！');
  } else {
    console.log('\n⚠️  部分图标转换失败');
    process.exit(1);
  }
}

main().catch(console.error);
