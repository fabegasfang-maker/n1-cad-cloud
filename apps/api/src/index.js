import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { resolveLatestCadFile, downloadDriveFile } from './drive.js';
import { convertDwgBufferToScene } from './convert.js';
import { readSceneCache, writeSceneCache } from './cache.js';

const app = express();
const PORT = Number(process.env.PORT) || 8787;
const DEFAULT_FOLDER_ID =
  process.env.DEFAULT_FOLDER_ID || '1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'n1-cad-cloud-api',
    phase: 1,
    time: new Date().toISOString(),
    defaultFolderId: DEFAULT_FOLDER_ID,
    hasGoogleKey: Boolean(process.env.GOOGLE_API_KEY),
  });
});

app.get('/api/latest', async (req, res) => {
  try {
    const folderId = String(req.query.folderId || DEFAULT_FOLDER_ID);
    const file = await resolveLatestCadFile(folderId);
    res.json({ folderId, file });
  } catch (err) {
    res.status(500).json({ error: 'latest_failed', message: err.message || String(err) });
  }
});

app.get('/api/scene', async (req, res) => {
  const folderId = String(req.query.folderId || DEFAULT_FOLDER_ID);
  const profile = req.query.profile === 'mobile' ? 'mobile' : 'desktop';
  const t0 = Date.now();

  try {
    const file = await resolveLatestCadFile(folderId);

    const cached = readSceneCache(file.id, file.modifiedTime, profile);
    if (cached) {
      res.json({
        ...cached,
        cache: 'hit',
        resolveMs: Date.now() - t0,
      });
      return;
    }

    const dwg = await downloadDriveFile(file.id);
    const scene = await convertDwgBufferToScene(dwg, {
      filename: file.name,
      fileId: file.id,
      modifiedTime: file.modifiedTime,
      monthFolder: file.monthFolder,
      profile,
    });

    writeSceneCache(file.id, file.modifiedTime, profile, scene);

    res.json({
      ...scene,
      cache: 'miss',
      resolveMs: Date.now() - t0,
      dwgBytes: dwg.byteLength,
    });
  } catch (err) {
    console.error('[scene]', err);
    res.status(500).json({
      error: 'scene_failed',
      message: err.message || String(err),
      folderId,
      profile,
      resolveMs: Date.now() - t0,
    });
  }
});

app.get('/api/download', async (req, res) => {
  try {
    const fileId = req.query.fileId;
    let name = 'drawing.dwg';
    if (!fileId) {
      const folderId = String(req.query.folderId || DEFAULT_FOLDER_ID);
      const file = await resolveLatestCadFile(folderId);
      const buf = await downloadDriveFile(file.id);
      name = file.name || name;
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
      res.send(buf);
      return;
    }
    const buf = await downloadDriveFile(String(fileId));
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: 'download_failed', message: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[n1-cad-cloud-api] phase 1 — http://localhost:${PORT}/api/health`);
});
