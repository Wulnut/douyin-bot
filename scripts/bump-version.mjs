import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function readJson(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  return { filePath, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function bumpPatch(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }

  const patch = Number(match[3]) + 1;
  return `${match[1]}.${match[2]}.${patch}`;
}

function replaceInFile(relativePath, replacers) {
  const filePath = path.join(rootDir, relativePath);
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [pattern, replacement] of replacers) {
    content = content.replace(pattern, replacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

const { filePath: manifestPath, data: manifest } = readJson('manifest.json');
const currentVersion = manifest.version;
const nextVersion = bumpPatch(currentVersion);

manifest.version = nextVersion;
writeJson(manifestPath, manifest);

const { filePath: packagePath, data: pkg } = readJson('package.json');
pkg.version = nextVersion;
writeJson(packagePath, pkg);

const { filePath: lockPath, data: lockfile } = readJson('package-lock.json');
lockfile.version = nextVersion;
if (lockfile.packages?.['']) {
  lockfile.packages[''].version = nextVersion;
}
writeJson(lockPath, lockfile);

replaceInFile('README.md', [
  [/^# 抖音AI托评助手 v[\d.]+/m, `# 抖音AI托评助手 v${nextVersion}`],
  [/badge\/版本-v[\d.]+-red/, `badge/版本-v${nextVersion}-red`]
]);

replaceInFile('src/content/index.js', [
  [/抖音AI托评助手 v[\d.]+/, `抖音AI托评助手 v${nextVersion}`]
]);

console.log(`Version bumped: ${currentVersion} -> ${nextVersion}`);
