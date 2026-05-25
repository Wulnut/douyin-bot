import fs from 'node:fs';
import path from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import crx3 from 'crx3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const buildDir = path.join(rootDir, 'build');
const releaseDir = path.join(rootDir, 'release');
const manifestPath = path.join(distDir, 'manifest.json');
const keyPath = path.join(buildDir, 'key.pem');
const crxPath = path.join(releaseDir, 'douyin-auto-helper.crx');
const zipPath = path.join(releaseDir, 'douyin-auto-helper.zip');

if (!fs.existsSync(manifestPath)) {
  console.error('dist/manifest.json not found. Run "npm run build" first.');
  process.exit(1);
}

fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(releaseDir, { recursive: true });

function ensureSigningKey() {
  if (fs.existsSync(keyPath)) {
    return;
  }

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 4096 });
  fs.writeFileSync(
    keyPath,
    privateKey.export({ type: 'pkcs8', format: 'pem' })
  );
  console.log('  Generated signing key: build/key.pem');
}

console.log('Packing extension...');
ensureSigningKey();

const versionInfoPath = path.join(distDir, 'src', 'version.json');
if (fs.existsSync(versionInfoPath)) {
  const versionInfo = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
  console.log(`  Version: v${versionInfo.version} · ${versionInfo.commit}`);
}

await crx3([manifestPath], {
  keyPath,
  crxPath,
  zipPath
});

const crxSize = fs.statSync(crxPath).size;
console.log(`\nPack complete:`);
console.log(`  CRX: ${crxPath} (${(crxSize / 1024).toFixed(1)} KB)`);
console.log(`  ZIP: ${zipPath}`);
console.log(`  Key: ${keyPath} (keep this file to publish updates with the same extension ID)`);
