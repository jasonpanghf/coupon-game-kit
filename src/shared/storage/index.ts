const namespace = 'coupon-game';

export function getStoredValue<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${namespace}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredValue<T>(key: string, value: T) {
  window.localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value));
}
