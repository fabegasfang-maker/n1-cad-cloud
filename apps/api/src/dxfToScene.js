/**
 * แปลง DXF ข้อความ → scene JSON เบา (LINE / LWPOLYLINE / CIRCLE / ARC / TEXT / MTEXT)
 * ไม่ครบทุก entity type — เฟส 1 เน้นแผนผังเส้นเป็นหลัก
 */

function num(v, fallback = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function round(n, p = 3) {
  const m = 10 ** p;
  return Math.round(n * m) / m;
}

/**
 * Parse group-code DXF pairs from string
 * @param {string} dxfText
 */
export function dxfToScene(dxfText, meta = {}) {
  const lines = dxfText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const pairs = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim();
    const value = lines[i + 1] ?? '';
    pairs.push([code, value]);
  }

  const entities = [];
  const layerSet = new Map();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  function touch(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  function ensureLayer(name) {
    const n = name || '0';
    if (!layerSet.has(n)) layerSet.set(n, { name: n, visible: true });
  }

  let i = 0;
  // seek ENTITIES section
  while (i < pairs.length) {
    if (pairs[i][0] === '0' && pairs[i][1].trim() === 'SECTION') {
      if (i + 1 < pairs.length && pairs[i + 1][0] === '2' && pairs[i + 1][1].trim() === 'ENTITIES') {
        i += 2;
        break;
      }
    }
    i++;
  }

  while (i < pairs.length) {
    const [code, rawVal] = pairs[i];
    const val = rawVal.trim();
    if (code === '0' && val === 'ENDSEC') break;
    if (code !== '0') {
      i++;
      continue;
    }

    const type = val;
    i++;
    const fields = {};
    const vertices = [];

    while (i < pairs.length && pairs[i][0] !== '0') {
      const c = pairs[i][0];
      const v = pairs[i][1].trim();
      if (c === '10' || c === '20' || c === '11' || c === '21' || c === '40' || c === '50' || c === '51') {
        // collect polyline vertices: sequential 10/20
        if (type === 'LWPOLYLINE' && c === '10') {
          const x = num(v);
          let y = 0;
          if (i + 1 < pairs.length && pairs[i + 1][0] === '20') {
            y = num(pairs[i + 1][1]);
            i += 2;
            vertices.push({ x, y });
            continue;
          }
        }
        fields[c] = v;
      } else if (c === '8' || c === '1' || c === '62') {
        fields[c] = v;
      }
      i++;
    }

    const layer = fields['8'] || '0';
    ensureLayer(layer);

    if (type === 'LINE') {
      const x1 = num(fields['10']);
      const y1 = num(fields['20']);
      const x2 = num(fields['11']);
      const y2 = num(fields['21']);
      touch(x1, y1);
      touch(x2, y2);
      entities.push({
        t: 'L',
        x1: round(x1),
        y1: round(y1),
        x2: round(x2),
        y2: round(y2),
        layer,
      });
    } else if (type === 'LWPOLYLINE' && vertices.length >= 2) {
      for (const p of vertices) touch(p.x, p.y);
      for (let v = 0; v < vertices.length - 1; v++) {
        entities.push({
          t: 'L',
          x1: round(vertices[v].x),
          y1: round(vertices[v].y),
          x2: round(vertices[v + 1].x),
          y2: round(vertices[v + 1].y),
          layer,
        });
      }
    } else if (type === 'CIRCLE') {
      const cx = num(fields['10']);
      const cy = num(fields['20']);
      const r = Math.abs(num(fields['40'], 1));
      touch(cx - r, cy - r);
      touch(cx + r, cy + r);
      const segs = 24;
      for (let s = 0; s < segs; s++) {
        const a0 = (s / segs) * Math.PI * 2;
        const a1 = ((s + 1) / segs) * Math.PI * 2;
        entities.push({
          t: 'L',
          x1: round(cx + r * Math.cos(a0)),
          y1: round(cy + r * Math.sin(a0)),
          x2: round(cx + r * Math.cos(a1)),
          y2: round(cy + r * Math.sin(a1)),
          layer,
        });
      }
    } else if (type === 'TEXT' || type === 'MTEXT') {
      const x = num(fields['10']);
      const y = num(fields['20']);
      const text = (fields['1'] || '').replace(/\\P/g, '\n').replace(/\{\\.*?}/g, '');
      if (text) {
        touch(x, y);
        entities.push({
          t: 'T',
          x: round(x),
          y: round(y),
          text: text.slice(0, 200),
          h: round(Math.abs(num(fields['40'], 2.5)), 2),
          layer,
        });
      }
    }
  }

  if (!Number.isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 100;
    maxY = 100;
  }

  const profile = meta.profile || 'desktop';
  let outEntities = entities;
  if (profile === 'mobile' && entities.length > 25000) {
    outEntities = entities.slice(0, 25000);
  }

  return {
    filename: meta.filename || 'drawing.dxf',
    fileId: meta.fileId,
    modifiedTime: meta.modifiedTime,
    monthFolder: meta.monthFolder,
    profile,
    bounds: {
      minX: round(minX),
      minY: round(minY),
      maxX: round(maxX),
      maxY: round(maxY),
    },
    layers: [...layerSet.values()],
    entities: outEntities,
    entityCount: outEntities.length,
    sourceEntityCount: entities.length,
  };
}
