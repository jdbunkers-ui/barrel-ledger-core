import { supabase } from "@/lib/supabaseClient";

const DEVELOPMENT_FALLBACK_SLUG = "brad-hughes-bourbon-reviews";

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

export async function getSiteContextByHost(host: string) {
  const cleanHost = host
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(":")[0]
    .toLowerCase();

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
    .or(`primary_domain.eq.${cleanHost},primary_domain.eq.www.${cleanHost}`)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
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

  return getSiteContext(DEVELOPMENT_FALLBACK_SLUG);
}