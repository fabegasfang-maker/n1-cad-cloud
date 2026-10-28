/** ตรวจจับมือถือ / iPad สำหรับเลือก profile และ UI */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const touch = (navigator.maxTouchPoints || 0) > 1;
  const narrow = window.innerWidth < 900;
  const mobileUa = /Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  // iPadOS 13+ มักรายงานเป็น Mac — ใช้ maxTouchPoints
  const iPad =
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
  return mobileUa || iPad || (touch && narrow);
}
