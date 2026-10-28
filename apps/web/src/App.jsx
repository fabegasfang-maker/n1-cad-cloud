import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CadCanvas } from './CadCanvas.jsx';
import { isMobileDevice } from './device.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
const FOLDER_ID =
  import.meta.env.VITE_DEFAULT_FOLDER_ID || '1mP47qarQZxPF-ln5Dy7VZrJlcq0uPJ4D';

export function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState('desktop');
  const [scene, setScene] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  /** มือถือ: รอให้กดดูแบบย่อก่อน auto-load */
  const [awaitingMobileChoice, setAwaitingMobileChoice] = useState(false);
  const abortRef = useRef(null);
  const bootedRef = useRef(false);

  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    if (mobile) {
      setProfile('mobile');
      setAwaitingMobileChoice(true);
    }
    bootedRef.current = true;
  }, []);

  const loadScene = useCallback(async (prof) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatus('loading');
    setError(null);
    setMessage(
      prof === 'mobile'
        ? 'โหมดมือถือ: กำลังดึง scene ย่อจากเซิร์ฟเวอร์…'
        : 'กำลังดึง scene จากเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลานาน)…'
    );

    try {
      const url = `${API_BASE}/api/scene?folderId=${encodeURIComponent(FOLDER_ID)}&profile=${prof}`;
      const res = await fetch(url, { signal: ac.signal });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }
      setScene(data);
      setStatus('ready');
      setAwaitingMobileChoice(false);
      const cacheTag = data.cache === 'hit' ? 'แคช' : 'แปลงใหม่';
      setMessage(
        `${data.filename || 'drawing'} · ${Number(data.entityCount || 0).toLocaleString()} วัตถุ · ${cacheTag}` +
          (data.resolveMs != null ? ` · ${data.resolveMs} ms` : '') +
          (data.monthFolder ? ` · ${data.monthFolder}` : '') +
          (prof === 'mobile' ? ' · mobile' : '')
      );
    } catch (e) {
      if (e.name === 'AbortError') return;
      setStatus('error');
      setError(e.message || String(e));
      setMessage('');
    }
  }, []);

  // Desktop: โหลดอัตโนมัติหลัง boot
  useEffect(() => {
    if (!bootedRef.current) return;
    if (isMobile) return;
    loadScene(profile);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [isMobile, profile, loadScene]);

  const downloadUrl = `${API_BASE}/api/download?folderId=${encodeURIComponent(FOLDER_ID)}`;

  const onViewLight = () => {
    setAwaitingMobileChoice(false);
    setProfile('mobile');
    loadScene('mobile');
  };

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
          gap: 10,
          padding: isMobile ? '10px 12px' : '10px 16px',
          borderBottom: '1px solid #1e293b',
          background: '#0f172a',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 16 }}>N1 CAD Cloud</div>
          <div
            style={{
              fontSize: isMobile ? 14 : 13,
              fontWeight: 700,
              opacity: 0.95,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: isMobile ? '92vw' : 'min(70vw, 520px)',
            }}
            title={scene?.filename}
          >
            {scene?.filename || (status === 'loading' ? 'กำลังโหลด…' : 'พร้อมเปิดแบบร่าง')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {!isMobile && (
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
          )}
          <button
            type="button"
            onClick={() => loadScene(isMobile ? 'mobile' : profile)}
            disabled={status === 'loading'}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: status === 'loading' ? 'wait' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            {status === 'loading' ? 'กำลังโหลด…' : isMobile ? 'ดูแบบย่อ' : 'โหลดใหม่'}
          </button>
          <a
            href={downloadUrl}
            style={{
              background: '#059669',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ดาวน์โหลด DWG
          </a>
        </div>
      </header>

      {isMobile && awaitingMobileChoice && !scene && (
        <div
          style={{
            padding: 16,
            background: '#064e3b',
            borderBottom: '1px solid #047857',
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>มือถือ / iPad</div>
          <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.45, opacity: 0.95 }}>
            แนะนำให้ <strong>ดาวน์โหลด DWG</strong> ไปเปิดในแอป CAD บนเครื่อง
            หรือกด <strong>ดูแบบย่อ</strong> เพื่อดูในเว็บ (โหลดจากเซิร์ฟเวอร์ ไม่แปลงบนเครื่องคุณ)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <a
              href={downloadUrl}
              style={{
                flex: 1,
                minWidth: 140,
                textAlign: 'center',
                background: '#10b981',
                color: '#fff',
                borderRadius: 10,
                padding: '12px 14px',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ดาวน์โหลดไฟล์งาน
            </a>
            <button
              type="button"
              onClick={onViewLight}
              style={{
                flex: 1,
                minWidth: 120,
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: '12px 14px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ดูแบบย่อในเว็บ
            </button>
          </div>
        </div>
      )}

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
              padding: 24,
              textAlign: 'center',
              opacity: 0.85,
            }}
          >
            กำลังดึง scene จากเซิร์ฟเวอร์…
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>เครื่องคุณไม่ต้องแปลง DWG</span>
          </div>
        )}
        {scene && <CadCanvas scene={scene} isMobile={isMobile} />}
      </div>

      <footer
        style={{
          padding: isMobile ? '8px 12px' : '6px 16px',
          fontSize: 11,
          opacity: 0.55,
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        {isMobile
          ? 'สองนิ้วซูม · นิ้วเดียวเลื่อน · แปลงอยู่บนเซิร์ฟเวอร์'
          : 'ลาก = เลื่อน · ลูกกลิ้ง = ซูม · แปลงอยู่บนเซิร์ฟเวอร์'}
      </footer>
    </div>
  );
}
