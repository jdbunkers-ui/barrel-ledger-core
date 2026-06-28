import { headers } from "next/headers";
import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
 
export async function trackPageView(args: {
  organizationId?: string | null;
  routePath: string;
  pageType: string;
  viewerUserId?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
 
  const host = headersList.get("host") ?? null;
  const forwardedFor = headersList.get("x-forwarded-for") ?? "";
  const userAgent = headersList.get("user-agent") ?? "";
  const visitorKeyHash = createHash("sha256")
    .update(`${forwardedFor}|${userAgent}`)
    .digest("hex");
 
  await supabase.schema("barrel_ledger_public").from("page_view_log").insert({
    organization_id: args.organizationId ?? null,
    site_host: host,
    route_path: args.routePath,
    page_type: args.pageType,
    viewer_user_id: args.viewerUserId ?? null,
    visitor_key_hash: visitorKeyHash,
  });
}