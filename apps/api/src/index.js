import 'dotenv/config';
import express from 'express';
import cors from 'cors';

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
    phase: 0,
    time: new Date().toISOString(),
    defaultFolderId: DEFAULT_FOLDER_ID,
    hasGoogleKey: Boolean(process.env.GOOGLE_API_KEY),
  });
});

/** เฟส 1: จะคืน metadata ไฟล์ DWG ล่าสุดจาก Drive */
app.get('/api/latest', (req, res) => {
  const folderId = String(req.query.folderId || DEFAULT_FOLDER_ID);
  res.status(501).json({
    error: 'not_implemented',
    message: 'เฟส 1: ยังไม่ได้เชื่อม Google Drive + เลือกเดือน/ไฟล์ล่าสุด',
    folderId,
  });
});

/** เฟส 1–2: แปลง DWG บนเซิร์ฟเวอร์ แล้วคืน scene JSON */
app.get('/api/scene', (req, res) => {
  const folderId = String(req.query.folderId || DEFAULT_FOLDER_ID);
  const profile = req.query.profile === 'mobile' ? 'mobile' : 'desktop';
  res.status(501).json({
    error: 'not_implemented',
    message: 'เฟส 1: ยังไม่ได้แปลง DWG → scene บนเซิร์ฟเวอร์',
    folderId,
    profile,
  });
});

/** เฟส 3: สตรีมไฟล์ DWG ต้นฉบับ */
app.get('/api/download', (req, res) => {
  const fileId = req.query.fileId;
  if (!fileId) {
    res.status(400).json({ error: 'fileId_required' });
    return;
  }
  res.status(501).json({
    error: 'not_implemented',
    message: 'เฟส 3: ยังไม่รองรับดาวน์โหลด DWG',
    fileId,
  });
});

app.listen(PORT, () => {
  console.log(`[n1-cad-cloud-api] http://localhost:${PORT}/api/health`);
});
