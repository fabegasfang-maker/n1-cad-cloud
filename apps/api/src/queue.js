/**
 * คิวงานแปลง DWG — จำกัดจำนวนแปลงพร้อมกัน กัน OOM บนเซิร์ฟเวอร์เล็ก
 */
const MAX_CONCURRENT = Math.max(1, Number(process.env.CONVERT_CONCURRENCY) || 1);
const MAX_QUEUE = Math.max(1, Number(process.env.CONVERT_QUEUE_MAX) || 8);

let active = 0;
const waiters = [];

export function queueStats() {
  return {
    active,
    waiting: waiters.length,
    maxConcurrent: MAX_CONCURRENT,
    maxQueue: MAX_QUEUE,
  };
}

function pump() {
  while (active < MAX_CONCURRENT && waiters.length > 0) {
    const next = waiters.shift();
    active++;
    Promise.resolve()
      .then(() => next.fn())
      .then(next.resolve, next.reject)
      .finally(() => {
        active--;
        pump();
      });
  }
}

/**
 * รัน fn ภายใต้คิว (เช่น convert หนัก)
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function enqueueConvert(fn) {
  if (active >= MAX_CONCURRENT && waiters.length >= MAX_QUEUE) {
    return Promise.reject(
      new Error(
        `คิวแปลงเต็ม (รอ ${waiters.length}/${MAX_QUEUE}) — ลองใหม่ในอีกสักครู่`
      )
    );
  }
  return new Promise((resolve, reject) => {
    waiters.push({ fn, resolve, reject });
    pump();
  });
}
