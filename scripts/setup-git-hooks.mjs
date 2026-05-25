import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.githooks');

try {
  execSync(`git config core.hooksPath "${hooksDir.replace(/\\/g, '/')}"`, {
    stdio: 'ignore'
  });
} catch {
  // Not a git repo or git unavailable; ignore during non-git usage.
}
