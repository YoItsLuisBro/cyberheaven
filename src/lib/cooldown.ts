const PREFIX = "ch.cooldown.";

export function canRun(key: string, seconds: number) {
  const k = PREFIX + key;
  const now = Date.now();
  const last = Number(localStorage.getItem(k) ?? "0");
  return now - last > seconds * 1000;
}

export function markRan(key: string) {
  localStorage.setItem(PREFIX + key, String(Date.now()));
}
