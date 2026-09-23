const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

async function optimizeImages() {
  console.log('Optimizing images in:', imagesDir);
  const files = fs.readdirSync(imagesDir);
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const inputPath = path.join(imagesDir, file);
      const originalStat = fs.statSync(inputPath);
      totalOriginal += originalStat.size;

      const baseName = file.replace(/\.(jpg|jpeg)$/, '');
      const outputPath = path.join(imagesDir, `${baseName}.webp`);

      // Determine max dimension
      const isHero = baseName === 'court-1';
      const maxWidth = isHero ? 1440 : 1080;

      await sharp(inputPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      const optimizedStat = fs.statSync(outputPath);
      totalOptimized += optimizedStat.size;

      const reduction = ((1 - optimizedStat.size / originalStat.size) * 100).toFixed(1);
      console.log(`✓ ${file} (${(originalStat.size / 1024).toFixed(1)} KB) -> ${baseName}.webp (${(optimizedStat.size / 1024).toFixed(1)} KB) [ -${reduction}% ]`);
    }
  }

  const totalSaved = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
  console.log('==============================================');
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Optimized WebP total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total data saved: -${totalSaved}%`);
  console.log('==============================================');
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
