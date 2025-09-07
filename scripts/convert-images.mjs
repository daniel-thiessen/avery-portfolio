#!/usr/bin/env node
/**
 * Image conversion script
 * - Scans ./images for .jpg/.jpeg/.png
 * - Outputs AVIF + WebP variants alongside originals
 * - Skips if variants already newer than source
 * - Targets perceptually acceptable quality (not retina specific)
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, 'images');
const exts = ['.jpg', '.jpeg', '.png'];

const qualityWebp = 72; // perceptual balance
const qualityAvif = 55; // AVIF usually needs lower numeric quality
const maxWidth = 1200;  // cap large originals

async function processFile(file){
  const ext = path.extname(file).toLowerCase();
  if(!exts.includes(ext)) return;
  const base = file.slice(0, -ext.length);
  const fullPath = path.join(IMAGES_DIR, file);

  const avifOut = path.join(IMAGES_DIR, base + '.avif');
  const webpOut = path.join(IMAGES_DIR, base + '.webp');

  const srcStat = fs.statSync(fullPath);
  const needsAvif = !fs.existsSync(avifOut) || fs.statSync(avifOut).mtimeMs < srcStat.mtimeMs;
  const needsWebp = !fs.existsSync(webpOut) || fs.statSync(webpOut).mtimeMs < srcStat.mtimeMs;

  if(!needsAvif && !needsWebp){
    console.log('Skipping (up-to-date):', file);
    return;
  }

  const img = sharp(fullPath).rotate();
  const meta = await img.metadata();
  const width = meta.width || maxWidth;
  const targetWidth = Math.min(width, maxWidth);

  if(needsAvif){
    await img
      .clone()
      .resize({ width: targetWidth })
      .avif({ quality: qualityAvif, effort: 4 })
      .toFile(avifOut);
    console.log('AVIF ->', path.basename(avifOut));
  }
  if(needsWebp){
    await img
      .clone()
      .resize({ width: targetWidth })
      .webp({ quality: qualityWebp })
      .toFile(webpOut);
    console.log('WebP ->', path.basename(webpOut));
  }
}

async function run(){
  if(!fs.existsSync(IMAGES_DIR)){
    console.error('Images directory not found:', IMAGES_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(IMAGES_DIR);
  for(const file of files){
    try { await processFile(file); } catch(err){ console.error('Error processing', file, err.message); }
  }
  console.log('\nDone. Use newly generated .avif/.webp in <picture> or dynamic helper.');
}
run();
