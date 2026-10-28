import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CACHE = path.join(__dirname, '..', 'cache');

function cacheDir() {
  return process.env.CACHE_DIR || DEFAULT_CACHE;
}

function safeKey(fileId, modifiedTime, profile) {
  const mt = (modifiedTime || 'unknown').replace(/[^0-9TZ.-]/gi, '');
  return `${fileId}_${mt}_${profile}.json`;
}

export function readSceneCache(fileId, modifiedTime, profile = 'desktop') {
  const dir = cacheDir();
  const file = path.join(dir, safeKey(fileId, modifiedTime, profile));
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeSceneCache(fileId, modifiedTime, profile, scene) {
  const dir = cacheDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, safeKey(fileId, modifiedTime, profile));
  fs.writeFileSync(file, JSON.stringify(scene));
  return file;
}
