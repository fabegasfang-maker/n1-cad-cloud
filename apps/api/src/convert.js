import { init, convertDwgToDxf } from 'dwgdxf';
import { dxfToScene } from './dxfToScene.js';

let initPromise = null;

async function ensureInit() {
  if (!initPromise) {
    initPromise = init().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

/**
 * DWG Buffer → CadScene
 * @param {Buffer} dwgBuffer
 * @param {object} meta
 */
export async function convertDwgBufferToScene(dwgBuffer, meta = {}) {
  await ensureInit();
  const u8 = dwgBuffer instanceof Uint8Array ? dwgBuffer : new Uint8Array(dwgBuffer);
  const dxfBytes = await convertDwgToDxf(u8);
  if (!dxfBytes || dxfBytes.byteLength < 50) {
    throw new Error('dwgdxf แปลงได้ผลว่าง — ไฟล์อาจเสียหรือเวอร์ชันไม่รองรับ');
  }
  const dxfText = new TextDecoder('utf-8', { fatal: false }).decode(dxfBytes);
  return dxfToScene(dxfText, meta);
}
