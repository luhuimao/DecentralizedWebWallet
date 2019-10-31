
export function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

export function sleep(n) {
  msleep(n*1000);
}