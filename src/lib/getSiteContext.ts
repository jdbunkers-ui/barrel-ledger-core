import { supabase } from "@/lib/supabaseClient";

const DEFAULT_DEVELOPMENT_FALLBACK_SLUG = "honey-barrel-hunter";

type SiteContextRow = {
  site_title: string;
  site_subtitle: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  primary_domain: string | null;
  subscription_tier: string;
};

export type SiteContext = {
  site_title: string;
  site_subtitle: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  organization: {
    organization_id: string;
    organization_name: string;
    organization_slug: string;
    primary_domain: string | null;
    subscription_tier: string;
  };
};

function mapSiteContext(data: SiteContextRow): SiteContext {
  return {
    site_title: data.site_title,
    site_subtitle: data.site_subtitle,
    logo_url: data.logo_url,
    banner_url: data.banner_url,
    primary_color: data.primary_color ?? "#0B4F8A",
    organization: {
      organization_id: data.organization_id,
      organization_name: data.organization_name,
      organization_slug: data.organization_slug,
      primary_domain: data.primary_domain,
      subscription_tier: data.subscription_tier,
    },
  };
}

function normalizeHost(host: string): string {
  return host
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(":")[0]
    .toLowerCase()
    .trim();
}

function isDevelopmentHost(host: string): boolean {
  return (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".app.github.dev")
  );
}

function getDevelopmentFallbackSlug(): string {
  return (
    process.env.DEV_DEFAULT_ORGANIZATION_SLUG?.trim() ||
    DEFAULT_DEVELOPMENT_FALLBACK_SLUG
  );
}

export async function getSiteContext(
  slug: string
): Promise<SiteContext | null> {
  const cleanSlug = slug.trim();

  if (!cleanSlug) {
    return null;
  }

  const { data, error } = await supabase
    .schema("barrel_ledger_public")
    .from("v_site_context")
    .select(`
      site_title,
      site_subtitle,
      logo_url,
      banner_url,
      primary_color,
      organization_id,
      organization_name,
      organization_slug,
      primary_domain,
      subscription_tier
    `)
    .eq("organization_slug", cleanSlug)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load site context for slug "${cleanSlug}": ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapSiteContext(data as SiteContextRow);
}

export async function getSiteContextByHost(
  host: string
): Promise<SiteContext | null> {
  const cleanHost = normalizeHost(host);

  /*
   * Localhost and GitHub Codespaces do not have customer domains mapped in
   * v_site_context, so they intentionally use the configured development
   * organization.
   */
  if (isDevelopmentHost(cleanHost)) {
    return getSiteContext(getDevelopmentFallbackSlug());
  }

  const { data, error } = await supabase
    .schema("barrel_ledger_public")
    .from("v_site_context")
    .select(`
      site_title,
      site_subtitle,
      logo_url,
      banner_url,
      primary_color,
      organization_id,
      organization_name,
      organization_slug,
      primary_domain,
      subscription_tier
    `)
    .eq("primary_domain", cleanHost)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load site context for host "${cleanHost}": ${error.message}`
    );
  }

  if (data) {
    return mapSiteContext(data as SiteContextRow);
  }

  /*
   * Do not silently show Honey Barrel Hunter for an unknown production
   * hostname. An unmapped production domain should fail safely.
   */
  return null;
}