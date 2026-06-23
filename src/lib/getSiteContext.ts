import { supabase } from "@/lib/supabaseClient";

const DEVELOPMENT_FALLBACK_SLUG = "brad-hughes-bourbon-reviews";

export async function getSiteContext(slug: string) {
  const { data, error } = await supabase
    .schema("barrel_ledger")
    .from("site_settings")
    .select(`
      site_title,
      site_subtitle,
      logo_url,
      banner_url,
      primary_color,
      organization!inner (
        organization_name,
        organization_slug,
        primary_domain,
        subscription_tier
      )
    `)
    .eq("organization.organization_slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSiteContextByHost(host: string) {
  const cleanHost = host
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(":")[0]
    .toLowerCase();

  const { data, error } = await supabase
    .schema("barrel_ledger")
    .from("site_settings")
    .select(`
      site_title,
      site_subtitle,
      logo_url,
      banner_url,
      primary_color,
      organization!inner (
        organization_name,
        organization_slug,
        primary_domain,
        subscription_tier
      )
    `)
    .eq("organization.primary_domain", cleanHost)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data;
  }

  return getSiteContext(DEVELOPMENT_FALLBACK_SLUG);
}