import { supabase } from "@/lib/supabaseClient";

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