/**
 * Google Drive: โฟลเดอร์หลัก → เดือนล่าสุด → ไฟล์ .dwg ล่าสุด
 */
const API = 'https://www.googleapis.com/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

const THAI_MONTHS = {
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
};

function apiKey() {
  const k = process.env.GOOGLE_API_KEY;
  if (!k) throw new Error('ยังไม่ได้ตั้ง GOOGLE_API_KEY ใน .env');
  return k;
}

async function apiJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error?.message || msg;
    } catch {
      /* ignore */
    }
    if (res.status === 403) msg += ' (ตรวจ Drive API + API key + การแชร์โฟลเดอร์)';
    throw new Error(msg);
  }
  return res.json();
}

export function monthFolderSortKey(name) {
  const n = (name || '').trim();
  for (const [th, mon] of Object.entries(THAI_MONTHS)) {
    if (n.includes(th)) {
      const yearMatch = n.match(/(\d{4})/);
      const yearBe = yearMatch ? parseInt(yearMatch[1], 10) : 0;
      return yearBe * 100 + mon;
    }
  }
  const iso = n.match(/(20\d{2}|25\d{2})[-_/](\d{1,2})/);
  if (iso) return parseInt(iso[1], 10) * 100 + parseInt(iso[2], 10);
  return 0;
}

function byModifiedDesc(a, b) {
  const ta = a.modifiedTime ? Date.parse(a.modifiedTime) : 0;
  const tb = b.modifiedTime ? Date.parse(b.modifiedTime) : 0;
  return tb - ta;
}

async function listChildren(folderId) {
  const key = `key=${encodeURIComponent(apiKey())}`;
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const list = await apiJson(
    `${API}?q=${q}&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=modifiedTime desc&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true&${key}`
  );
  return list.files || [];
}

function pickLatestDwg(files) {
  const dwgs = files
    .filter((f) => /\.dwg$/i.test(f.name || '') && f.mimeType !== FOLDER_MIME)
    .filter((f) => !/mobile|_mobile/i.test(f.name || ''))
    .sort(byModifiedDesc);
  if (dwgs.length) return dwgs[0];
  const any = files
    .filter((f) => /\.dwg$/i.test(f.name || '') && f.mimeType !== FOLDER_MIME)
    .sort(byModifiedDesc);
  return any[0] || null;
}

/**
 * @returns {{ id, name, size?, modifiedTime?, monthFolder? }}
 */
export async function resolveLatestCadFile(folderId) {
  const key = `key=${encodeURIComponent(apiKey())}`;
  const meta = await apiJson(
    `${API}/${folderId}?fields=id,name,mimeType,size,modifiedTime&supportsAllDrives=true&${key}`
  );

  if (meta.mimeType !== FOLDER_MIME) {
    if (!/\.dwg$/i.test(meta.name || '')) {
      throw new Error(`ID นี้ไม่ใช่โฟลเดอร์หรือไฟล์ .dwg: ${meta.name}`);
    }
    return {
      id: meta.id,
      name: meta.name,
      size: meta.size ? Number(meta.size) : undefined,
      modifiedTime: meta.modifiedTime,
    };
  }

  const children = await listChildren(folderId);
  const subfolders = children.filter((f) => f.mimeType === FOLDER_MIME);
  const monthFolders = subfolders
    .filter((f) => monthFolderSortKey(f.name) > 0)
    .sort((a, b) => monthFolderSortKey(b.name) - monthFolderSortKey(a.name));

  for (const folder of monthFolders) {
    const inner = await listChildren(folder.id);
    const picked = pickLatestDwg(inner);
    if (picked) {
      return {
        id: picked.id,
        name: picked.name,
        size: picked.size ? Number(picked.size) : undefined,
        modifiedTime: picked.modifiedTime,
        monthFolder: folder.name,
      };
    }
  }

  const rootPick = pickLatestDwg(children);
  if (rootPick) {
    return {
      id: rootPick.id,
      name: rootPick.name,
      size: rootPick.size ? Number(rootPick.size) : undefined,
      modifiedTime: rootPick.modifiedTime,
    };
  }

  throw new Error('ไม่พบไฟล์ .dwg ในโฟลเดอร์หรือโฟลเดอร์ย่อยรายเดือน');
}

export async function downloadDriveFile(fileId) {
  const key = `key=${encodeURIComponent(apiKey())}`;
  const res = await fetch(`${API}/${fileId}?alt=media&supportsAllDrives=true&${key}`);
  if (!res.ok) throw new Error(`ดาวน์โหลดจาก Drive ไม่สำเร็จ (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}
