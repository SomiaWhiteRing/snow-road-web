export type SupportedLocale = "zh" | "ja" | "en";

const LOCALE_KEY = "snow-road-web-locale";
const ROTATE_SCREEN_KEY = "snow-road-web-rotate-screen";

const readStorage = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read preference: ${key}`, error);
    return null;
  }
};

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }

    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to write preference: ${key}`, error);
  }
};

export const loadStoredLocalePreference = (): SupportedLocale | null => {
  const raw = readStorage(LOCALE_KEY);
  return raw === "zh" || raw === "ja" || raw === "en" ? raw : null;
};

export const persistLocalePreference = (locale: SupportedLocale | null) => {
  writeStorage(LOCALE_KEY, locale);
};

export const detectAutoLocale = (): SupportedLocale => {
  if (typeof navigator === "undefined") {
    return "zh";
  }

  const candidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const normalized = String(candidate).toLowerCase();
    if (normalized.startsWith("ja")) {
      return "ja";
    }
    if (normalized.startsWith("zh")) {
      return "zh";
    }
    if (normalized.startsWith("en")) {
      return "en";
    }
  }

  return "zh";
};

export const getInitialLocale = (): SupportedLocale =>
  loadStoredLocalePreference() ?? detectAutoLocale();

export const loadStoredRotateScreenPreference = (): boolean | null => {
  const raw = readStorage(ROTATE_SCREEN_KEY);
  if (raw === "1") {
    return true;
  }
  if (raw === "0") {
    return false;
  }
  return null;
};

export const persistRotateScreenPreference = (rotateScreen: boolean | null) => {
  writeStorage(ROTATE_SCREEN_KEY, rotateScreen === null ? null : rotateScreen ? "1" : "0");
};

export const detectAutoRotateScreen = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIpad =
    /ipad/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isPhoneToken = /iphone|ipod|windows phone|mobile/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const shortSide = Math.min(
    window.innerWidth,
    window.innerHeight,
    window.screen?.width ?? window.innerWidth,
    window.screen?.height ?? window.innerHeight
  );

  if (isIpad) {
    return false;
  }

  if (isPhoneToken) {
    return true;
  }

  if (isAndroid || navigator.maxTouchPoints > 0) {
    return shortSide < 768;
  }

  return false;
};
