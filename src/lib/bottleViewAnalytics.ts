type BottleViewAnalytics = {
  visitorKey: string;
  sessionKey: string;
  referrerUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
  browserName: string | null;
  operatingSystem: string | null;
  languageCode: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
};

const VISITOR_STORAGE_KEY = "barrel_ledger_visitor_key";
const SESSION_STORAGE_KEY = "barrel_ledger_session_key";

function generateIdentifier(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateVisitorKey(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (existing) {
      return existing;
    }

    const created = generateIdentifier();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, created);

    return created;
  } catch {
    return generateIdentifier();
  }
}

function getOrCreateSessionKey(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (existing) {
      return existing;
    }

    const created = generateIdentifier();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);

    return created;
  } catch {
    return generateIdentifier();
  }
}

function detectDeviceType(
  userAgent: string,
  width: number
): BottleViewAnalytics["deviceType"] {
  const normalizedUserAgent = userAgent.toLowerCase();

  const tabletPattern =
    /ipad|tablet|kindle|silk|playbook|android(?!.*mobile)/i;

  const mobilePattern =
    /iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i;

  if (tabletPattern.test(normalizedUserAgent)) {
    return "tablet";
  }

  if (mobilePattern.test(normalizedUserAgent)) {
    return "mobile";
  }

  if (width > 0 && width <= 767) {
    return "mobile";
  }

  if (width >= 768 && width <= 1024) {
    return "tablet";
  }

  if (width > 1024) {
    return "desktop";
  }

  return "unknown";
}

function detectBrowser(userAgent: string): string | null {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/chrome\//i.test(userAgent) || /crios\//i.test(userAgent)) {
    return "Chrome";
  }
  if (/safari\//i.test(userAgent)) return "Safari";

  return null;
}

function detectOperatingSystem(userAgent: string): string | null {
  if (/windows nt/i.test(userAgent)) return "Windows";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/cros/i.test(userAgent)) return "ChromeOS";
  if (/linux/i.test(userAgent)) return "Linux";

  return null;
}

function normalizeText(
  value: string | null,
  maxLength: number
): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

export function collectBottleViewAnalytics(): BottleViewAnalytics {
  const currentUrl = new URL(window.location.href);
  const userAgent = window.navigator.userAgent ?? "";
  const width = window.screen?.width ?? 0;
  const height = window.screen?.height ?? 0;

  return {
    visitorKey: getOrCreateVisitorKey(),
    sessionKey: getOrCreateSessionKey(),

    referrerUrl: normalizeText(document.referrer, 2000),

    utmSource: normalizeText(
      currentUrl.searchParams.get("utm_source"),
      255
    ),

    utmMedium: normalizeText(
      currentUrl.searchParams.get("utm_medium"),
      255
    ),

    utmCampaign: normalizeText(
      currentUrl.searchParams.get("utm_campaign"),
      255
    ),

    utmContent: normalizeText(
      currentUrl.searchParams.get("utm_content"),
      255
    ),

    deviceType: detectDeviceType(userAgent, width),
    browserName: detectBrowser(userAgent),
    operatingSystem: detectOperatingSystem(userAgent),

    languageCode: normalizeText(
      window.navigator.language ?? null,
      50
    ),

    screenWidth: width > 0 ? width : null,
    screenHeight: height > 0 ? height : null,
  };
}