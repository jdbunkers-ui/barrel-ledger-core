import Link from "next/link";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireMember } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
 
export default async function DashboardPage() {
  const member = await requireMember();
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);
 
  const { data: submissions } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_bottle_submission_status")
    .select("*")
    .eq("organization_id", member.organization_id)
    .order("create_ts", { ascending: false })
    .limit(25);
 
  const { data: pageCounts } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_page_view_counts")
    .select("*")
    .eq("organization_id", member.organization_id)
    .order("total_page_views", { ascending: false });
 
  return (
    <main className="min-h-screen bg-stone-100">
      {site && (
        <CustomerHeader
          siteTitle={site.site_title}
          siteSubtitle={site.site_subtitle}
          logoUrl={site.logo_url}
          bannerUrl={site.banner_url}
          primaryColor={site.primary_color}
        />
      )}
 
      <Navigation />
 
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-4xl font-bold">Dashboard</h1>
 
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/tastings/new"
            className="rounded border border-stone-300 bg-white p-6 text-xl font-semibold hover:shadow"
          >
            Add a Tasting
          </Link>
 
          <Link
            href="/dashboard/bottle-submissions/new"
            className="rounded border border-stone-300 bg-white p-6 text-xl font-semibold hover:shadow"
          >
            Submit a Bottle to the Master Whiskey Library
          </Link>
        </div>
 
        <section className="mb-8 rounded border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-bold">Bottle Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Submitted</th>
                  <th className="py-2">Bottle</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(submissions ?? []).map((s) => (
                  <tr key={s.submission_id} className="border-b">
                    <td className="py-2">{new Date(s.create_ts).toLocaleDateString()}</td>
                    <td className="py-2">
                      {[s.distillery_name, s.brand_name, s.expression_name, s.pick_name]
                        .filter(Boolean)
                        .join(" - ") || "Bottle submission"}
                    </td>
                    <td className="py-2">{s.submitted_bottle_type ?? "Standard"}</td>
                    <td className="py-2 font-semibold">{s.submission_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
 
        <section className="rounded border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-bold">Page Views</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Page Type</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Last 7 Days</th>
                  <th className="py-2">Last 30 Days</th>
                </tr>
              </thead>
              <tbody>
                {(pageCounts ?? []).map((p) => (
                  <tr key={p.page_type} className="border-b">
                    <td className="py-2">{p.page_type}</td>
                    <td className="py-2">{p.total_page_views}</td>
                    <td className="py-2">{p.page_views_last_7_days}</td>
                    <td className="py-2">{p.page_views_last_30_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}