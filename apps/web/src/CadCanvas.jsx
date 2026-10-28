import React, { useEffect, useRef, useState } from 'react';

/**
 * วาด CadScene — pan / zoom (เมาส์ + สัมผัส)
 */
export function CadCanvas({ scene, isMobile = false }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0 });
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !scene?.bounds) return;
    const { minX, minY, maxX, maxY } = scene.bounds;
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const cw = el.clientWidth || 800;
    const ch = el.clientHeight || 600;
    const pad = isMobile ? 24 : 40;
    const sx = (cw - pad * 2) / w;
    const sy = (ch - pad * 2) / h;
    const scale = Math.min(sx, sy);
    const ox = pad - minX * scale + (cw - pad * 2 - w * scale) / 2;
    const oy = pad + maxY * scale + (ch - pad * 2 - h * scale) / 2;
    viewRef.current = { scale, ox, oy };
    setTick((t) => t + 1);
  }, [scene, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !scene) return;

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const { scale, ox, oy } = viewRef.current;
    const toX = (x) => ox + x * scale;
    const toY = (y) => oy - y * scale;

    ctx.lineWidth = Math.max(0.5, (isMobile ? 1.2 : 1) / Math.max(scale, 0.001));
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `${Math.max(9, 11 / Math.sqrt(Math.max(scale, 0.05)))}px system-ui,sans-serif`;

    const ents = scene.entities || [];
    const margin = 40;
    const vx0 = -margin;
    const vy0 = -margin;
    const vx1 = rect.width + margin;
    const vy1 = rect.height + margin;

    // มือถือ: ข้ามบางเส้นตอนซูมออกมากเพื่อลื่นขึ้น
    const stride =
      isMobile && ents.length > 12000 && scale < 0.05
        ? Math.max(1, Math.floor(ents.length / 10000))
        : 1;

    for (let i = 0; i < ents.length; i++) {
      if (stride > 1 && i % stride !== 0) continue;
      const e = ents[i];
      if (e.t === 'L') {
        const x1 = toX(e.x1);
        const y1 = toY(e.y1);
        const x2 = toX(e.x2);
        const y2 = toY(e.y2);
        if (
          (x1 < vx0 && x2 < vx0) ||
          (x1 > vx1 && x2 > vx1) ||
          (y1 < vy0 && y2 < vy0) ||
          (y1 > vy1 && y2 > vy1)
        ) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (e.t === 'T' && e.text) {
        const x = toX(e.x);
        const y = toY(e.y);
        if (x < vx0 || x > vx1 || y < vy0 || y > vy1) continue;
        ctx.fillText(String(e.text).slice(0, 80), x, y);
      }
    }
  }, [scene, tick, isMobile]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onWheel = (ev) => {
      ev.preventDefault();
      const rect = wrap.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      const v = viewRef.current;
      const factor = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newScale = Math.min(500, Math.max(0.001, v.scale * factor));
      const worldX = (mx - v.ox) / v.scale;
      const worldY = (v.oy - my) / v.scale;
      v.scale = newScale;
      v.ox = mx - worldX * newScale;
      v.oy = my + worldY * newScale;
      setTick((t) => t + 1);
    };

    const onDown = (ev) => {
      if (ev.pointerType === 'touch' && wrap.setPointerCapture) {
        try {
          wrap.setPointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
      }
      dragRef.current = {
        x: ev.clientX,
        y: ev.clientY,
        ox: viewRef.current.ox,
        oy: viewRef.current.oy,
      };
    };
    const onMove = (ev) => {
      if (!dragRef.current || pinchRef.current) return;
      const d = dragRef.current;
      viewRef.current.ox = d.ox + (ev.clientX - d.x);
      viewRef.current.oy = d.oy + (ev.clientY - d.y);
      setTick((t) => t + 1);
    };
    const onUp = () => {
      dragRef.current = null;
    };

    // pinch zoom
    const onTouchStart = (ev) => {
      if (ev.touches.length === 2) {
        const [a, b] = ev.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchRef.current = { dist, scale: viewRef.current.scale };
        dragRef.current = null;
      }
    };
    const onTouchMove = (ev) => {
      if (ev.touches.length === 2 && pinchRef.current) {
        ev.preventDefault();
        const [a, b] = ev.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const factor = dist / Math.max(pinchRef.current.dist, 1);
        viewRef.current.scale = Math.min(
          500,
          Math.max(0.001, pinchRef.current.scale * factor)
        );
        setTick((t) => t + 1);
      }
    };
    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchmove', onTouchMove, { passive: false });
    wrap.addEventListener('touchend', onTouchEnd);
    return () => {
      wrap.removeEventListener('wheel', onWheel);
      wrap.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchmove', onTouchMove);
      wrap.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
