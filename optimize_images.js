import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'public', 'herosection.png');
const outputPath = path.join(process.cwd(), 'public', 'herosection.webp');

async function optimizeImage() {
  try {
    console.log('Optimizing herosection.png...');
    
    await sharp(inputPath)
      .resize({ width: 1920, withoutEnlargement: true }) // limit max width
      .webp({ quality: 80 }) // convert to webp with 80% quality
      .toFile(outputPath);
      
    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    
    console.log(`Optimization complete!`);
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Saved ${(100 - (newSize / originalSize) * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeImage();
