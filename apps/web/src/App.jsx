import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
const FOLDER_ID =
  import.meta.env.VITE_DEFAULT_FOLDER_ID || '1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D';

export function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(e.message || String(e)));
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>N1 CAD Cloud</h1>
      <p style={{ opacity: 0.85 }}>
        Viewer รุ่น 2 — แปลง DWG บนเซิร์ฟเวอร์ (เฟส 0: โครง + health)
      </p>
      <p style={{ fontSize: 13, opacity: 0.7 }}>
        Folder: <code>{FOLDER_ID}</code>
        <br />
        API: <code>{API_BASE}</code>
      </p>

      {error && (
        <div
          style={{
            background: '#7f1d1d',
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          เชื่อม API ไม่ได้: {error}
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>
            รัน <code>npm run dev</code> ใน <code>apps/api</code> ก่อน
          </div>
        </div>
      )}

      {health && (
        <pre
          style={{
            background: '#1e293b',
            padding: 16,
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 13,
          }}
        >
          {JSON.stringify(health, null, 2)}
        </pre>
      )}

      <p style={{ marginTop: 24, fontSize: 13, opacity: 0.6 }}>
        ขั้นถัดไป: เฟส 1 — <code>GET /api/latest</code> + แปลง scene บนเซิร์ฟเวอร์
      </p>
    </div>
  );
}
