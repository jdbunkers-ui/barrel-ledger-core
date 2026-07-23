import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const analyticsHashSecret =
  process.env.ANALYTICS_HASH_SECRET;

type BottleViewRequestBody = {
  organizationId?: unknown;
  singleBarrelId?: unknown;
  bottleId?: unknown;
  bottleSlug?: unknown;
  bottleName?: unknown;
  routePath?: unknown;
  siteHost?: unknown;

  visitorKey?: unknown;
  sessionKey?: unknown;
  referrerUrl?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  deviceType?: unknown;
  browserName?: unknown;
  operatingSystem?: unknown;
  languageCode?: unknown;
  screenWidth?: unknown;
  screenHeight?: unknown;
};

function optionalString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function requiredString(
  value: unknown,
  maxLength: number
): string | null {
  return optionalString(value, maxLength);
}

function optionalInteger(
  value: unknown,
  minimum: number,
  maximum: number
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    return null;
  }

  return value;
}

function hashIdentifier(value: string | null): string | null {
  if (!value || !analyticsHashSecret) {
    return null;
  }

  return createHmac("sha256", analyticsHashSecret)
    .update(value)
    .digest("hex");
}

function normalizeDeviceType(
  value: unknown
): "mobile" | "tablet" | "desktop" | "unknown" {
  if (
    value === "mobile" ||
    value === "tablet" ||
    value === "desktop" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function getReferrerDomain(referrerUrl: string | null): string | null {
  if (!referrerUrl) {
    return null;
  }

  try {
    return new URL(referrerUrl).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

function deriveTrafficSource(args: {
  referrerDomain: string | null;
  utmSource: string | null;
  siteHost: string | null;
}): string {
  const utmSource = args.utmSource?.toLowerCase() ?? null;

  if (utmSource) {
    if (utmSource.includes("instagram")) return "instagram";
    if (utmSource.includes("youtube")) return "youtube";
    if (utmSource.includes("facebook")) return "facebook";
    if (utmSource.includes("tiktok")) return "tiktok";
    if (utmSource.includes("google")) return "google";
    if (utmSource.includes("bing")) return "bing";
    if (utmSource.includes("email")) return "email";

    return utmSource.slice(0, 100);
  }

  const referrerDomain = args.referrerDomain;

  if (!referrerDomain) {
    return "direct";
  }

  const normalizedSiteHost = args.siteHost
    ?.toLowerCase()
    .replace(/^www\./, "");

  if (
    normalizedSiteHost &&
    referrerDomain === normalizedSiteHost
  ) {
    return "internal";
  }

  if (referrerDomain.includes("instagram.com")) return "instagram";
  if (referrerDomain.includes("youtube.com")) return "youtube";
  if (referrerDomain.includes("youtu.be")) return "youtube";
  if (referrerDomain.includes("facebook.com")) return "facebook";
  if (referrerDomain.includes("tiktok.com")) return "tiktok";
  if (referrerDomain.includes("google.")) return "google";
  if (referrerDomain.includes("bing.com")) return "bing";
  if (referrerDomain.includes("yahoo.com")) return "yahoo";
  if (referrerDomain.includes("duckduckgo.com")) return "duckduckgo";

  return "referral";
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!analyticsHashSecret) {
      console.error("Missing ANALYTICS_HASH_SECRET");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as BottleViewRequestBody;

    const organizationId = requiredString(
      body.organizationId,
      100
    );

    const singleBarrelId = requiredString(
      body.singleBarrelId,
      100
    );

    const bottleId = optionalString(body.bottleId, 100);
    const bottleSlug = requiredString(body.bottleSlug, 500);
    const bottleName = optionalString(body.bottleName, 1000);
    const routePath = requiredString(body.routePath, 2000);
    const siteHost = optionalString(body.siteHost, 500);

    if (
      !organizationId ||
      !singleBarrelId ||
      !bottleSlug ||
      !routePath
    ) {
      console.error("Missing required bottle-view fields");

      return NextResponse.json(
        { error: "Missing required bottle-view fields" },
        { status: 400 }
      );
    }

    const visitorKey = optionalString(body.visitorKey, 500);
    const sessionKey = optionalString(body.sessionKey, 500);

    const referrerUrl = optionalString(
      body.referrerUrl,
      2000
    );

    const referrerDomain = getReferrerDomain(referrerUrl);

    const utmSource = optionalString(body.utmSource, 255);
    const utmMedium = optionalString(body.utmMedium, 255);
    const utmCampaign = optionalString(body.utmCampaign, 255);
    const utmContent = optionalString(body.utmContent, 255);

    const trafficSource = deriveTrafficSource({
      referrerDomain,
      utmSource,
      siteHost,
    });

    const insertPayload = {
      organization_id: organizationId,
      single_barrel_id: singleBarrelId,
      bottle_id: bottleId,
      bottle_slug: bottleSlug,
      bottle_name: bottleName,
      route_path: routePath,
      site_host: siteHost,
      page_type: "bottle_detail",

      visitor_key_hash: hashIdentifier(visitorKey),
      session_key_hash: hashIdentifier(sessionKey),

      referrer_url: referrerUrl,
      referrer_domain: referrerDomain,
      traffic_source: trafficSource,

      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,

      device_type: normalizeDeviceType(body.deviceType),

      browser_name: optionalString(
        body.browserName,
        100
      ),

      operating_system: optionalString(
        body.operatingSystem,
        100
      ),

      language_code: optionalString(
        body.languageCode,
        50
      ),

      screen_width: optionalInteger(
        body.screenWidth,
        1,
        20000
      ),

      screen_height: optionalInteger(
        body.screenHeight,
        1,
        20000
      ),
    };

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { error } = await supabase
      .schema("barrel_ledger_public")
      .from("bottle_view_log")
      .insert(insertPayload);

    if (error) {
      console.error("Bottle view insert failed:", error);

      return NextResponse.json(
        {
          error: "Bottle view insert failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Bottle view log API error:", error);

    return NextResponse.json(
      {
        error: "Unexpected bottle-view log error",
      },
      { status: 500 }
    );
  }
}