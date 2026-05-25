import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'manifest.json');
const versionInfoPath = path.join(rootDir, 'src', 'version.json');

function getGitCommit() {
  try {
    const full = execSync('git rev-parse HEAD', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    const short = execSync('git rev-parse --short HEAD', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return { full, short };
  } catch {
    return { full: 'unknown', short: 'unknown' };
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const { full, short } = getGitCommit();
const info = {
  version: manifest.version,
  commit: short,
  commitFull: full
};

fs.mkdirSync(path.dirname(versionInfoPath), { recursive: true });
fs.writeFileSync(versionInfoPath, `${JSON.stringify(info, null, 2)}\n`, 'utf8');

console.log(`Version info: v${info.version} · ${info.commit}`);

export default info;
