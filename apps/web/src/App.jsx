import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CadCanvas } from './CadCanvas.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
const FOLDER_ID =
  import.meta.env.VITE_DEFAULT_FOLDER_ID || '1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D';

export function App() {
  const [scene, setScene] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState('desktop');
  const abortRef = useRef(null);

  const loadScene = useCallback(async (prof = profile) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus('loading');
    setError(null);
    setMessage('กำลังดึง scene จากเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลานาน)...');

    try {
      const url = `${API_BASE}/api/scene?folderId=${encodeURIComponent(FOLDER_ID)}&profile=${prof}`;
      const res = await fetch(url, { signal: ac.signal });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }
      setScene(data);
      setStatus('ready');
      const cacheTag = data.cache === 'hit' ? 'แคช' : 'แปลงใหม่';
      setMessage(
        `${data.filename || 'drawing'} · ${Number(data.entityCount || 0).toLocaleString()} เส้น/วัตถุ · ${cacheTag}` +
          (data.resolveMs != null ? ` · ${data.resolveMs} ms` : '') +
          (data.monthFolder ? ` · ${data.monthFolder}` : '')
      );
    } catch (e) {
      if (e.name === 'AbortError') return;
      setStatus('error');
      setError(e.message || String(e));
      setMessage('');
    }
  }, [profile]);

  useEffect(() => {
    loadScene(profile);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadScene, profile]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0b1220',
        color: '#e2e8f0',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid #1e293b',
          background: '#0f172a',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>N1 CAD Cloud</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              opacity: 0.95,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'min(70vw, 520px)',
            }}
            title={scene?.filename}
          >
            {scene?.filename || (status === 'loading' ? 'กำลังโหลด…' : 'ยังไม่มีแบบ')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 13,
            }}
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
          <button
            type="button"
            onClick={() => loadScene(profile)}
            disabled={status === 'loading'}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: status === 'loading' ? 'wait' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            {status === 'loading' ? 'กำลังโหลด…' : 'โหลดใหม่'}
          </button>
          <a
            href={`${API_BASE}/api/download?folderId=${encodeURIComponent(FOLDER_ID)}`}
            style={{
              background: '#059669',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ดาวน์โหลด DWG
          </a>
        </div>
      </header>

      {(message || error) && (
        <div
          style={{
            padding: '8px 16px',
            fontSize: 12,
            borderBottom: '1px solid #1e293b',
            background: error ? '#450a0a' : '#0f172a',
            color: error ? '#fecaca' : '#94a3b8',
            flexShrink: 0,
          }}
        >
          {error || message}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {status === 'loading' && !scene && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
          >
            กำลังแปลง/ดึง scene บนเซิร์ฟเวอร์…
          </div>
        )}
        {scene && <CadCanvas scene={scene} />}
      </div>

      <footer
        style={{
          padding: '6px 16px',
          fontSize: 11,
          opacity: 0.55,
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        API: {API_BASE} · Folder: {FOLDER_ID.slice(0, 8)}… · ลากเมาส์ = เลื่อน · ลูกกลิ้ง = ซูม
      </footer>
    </div>
  );
}
