import { supabase } from "@/lib/supabaseClient";

const DEVELOPMENT_FALLBACK_SLUG = "brad-hughes-bourbon-reviews";

type SiteContextRow = {
  site_title: string;
  site_subtitle: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  primary_domain: string | null;
  subscription_tier: string;
};

function mapSiteContext(data: SiteContextRow) {
  return {
    site_title: data.site_title,
    site_subtitle: data.site_subtitle,
    logo_url: data.logo_url,
    banner_url: data.banner_url,
    primary_color: data.primary_color,
    organization: {
      organization_id: data.organization_id,
      organization_name: data.organization_name,
      organization_slug: data.organization_slug,
      primary_domain: data.primary_domain,
      subscription_tier: data.subscription_tier,
    },
  };
}

export async function getSiteContext(slug: string) {
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
    .eq("organization_slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapSiteContext(data as SiteContextRow);
}

export async function getSiteContextByHost(host: string) {
  const cleanHost = host
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(":")[0]
    .toLowerCase()
    .trim();

  if (!cleanHost) {
    return getSiteContext(DEVELOPMENT_FALLBACK_SLUG);
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
    throw new Error(error.message);
  }

  if (data) {
    return mapSiteContext(data as SiteContextRow);
  }

  return getSiteContext(DEVELOPMENT_FALLBACK_SLUG);
}