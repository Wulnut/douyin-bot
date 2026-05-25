import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { obfuscatorOptions } from './obfuscator-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const jsTargets = [
  'src/background.js',
  'src/content/index.js'
];

const copyTargets = [
  'manifest.json',
  'icons',
  'src/styles',
  'src/version.json'
];

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyPath(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyPath(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function obfuscateFile(relativePath) {
  const sourcePath = path.join(rootDir, relativePath);
  const targetPath = path.join(distDir, relativePath);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(source, obfuscatorOptions);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, result.getObfuscatedCode(), 'utf8');

  const sourceSize = Buffer.byteLength(source, 'utf8');
  const outputSize = Buffer.byteLength(result.getObfuscatedCode(), 'utf8');
  console.log(`  ${relativePath}  ${formatSize(sourceSize)} -> ${formatSize(outputSize)}`);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

console.log('Cleaning dist/...');
removeDir(distDir);
fs.mkdirSync(distDir, { recursive: true });

console.log('Writing version info...');
await import('./write-version-info.mjs');

console.log('Copying static assets...');
for (const target of copyTargets) {
  const sourcePath = path.join(rootDir, target);
  const targetPath = path.join(distDir, target);
  copyPath(sourcePath, targetPath);
  console.log(`  ${target}`);
}

console.log('Obfuscating JavaScript...');
for (const target of jsTargets) {
  obfuscateFile(target);
}

console.log(`\nBuild complete: ${distDir}`);
