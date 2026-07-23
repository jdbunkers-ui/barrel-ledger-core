import Image from "next/image";
import Link from "next/link";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import AnalyticsDashboard, {
  type AnalyticsSummary,
  type BottleAnalyticsRow,
  type DailyAnalyticsRow,
  type TrafficSourceRow,
} from "@/components/dashboard/AnalyticsDashboard";
import { requireMember } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";

type BarrelLedgerUpdate = {
  update_id: string;
  update_title: string;
  update_description: string | null;
  publish_ts: string;
  new_update: boolean;
};

type PendingBottleSubmission = {
  master_data_submission_id: string;
  submitted_display_name: string;
  submission_status: string;
  created_at: string;
};

export default async function DashboardPage() {
  const member = await requireMember();
  const supabase = await createSupabaseServerClient();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const ninetyDaysAgo = getDateDaysAgo(89);

  const [
    pendingSubmissionsResult,
    analyticsSummaryResult,
    dailyAnalyticsResult,
    trafficSourcesResult,
    bottleAnalyticsResult,
    updatesResult,
  ] = await Promise.all([
    supabase
      .schema("barrel_ledger_public")
      .rpc("f_get_pending_bottle_submissions", {
        p_organization_id: member.organization_id,
      }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_analytics_summary")
      .select("*")
      .eq("organization_id", member.organization_id)
      .maybeSingle(),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_analytics_daily")
      .select("*")
      .eq("organization_id", member.organization_id)
      .gte("view_date", ninetyDaysAgo)
      .order("view_date", { ascending: true }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_traffic_source_summary")
      .select("*")
      .eq("organization_id", member.organization_id)
      .order("views_last_30_days", { ascending: false }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_bottle_analytics")
      .select("*")
      .eq("organization_id", member.organization_id),

    supabase
      .schema("barrel_ledger_public")
      .from("v_barrel_ledger_updates")
      .select(
        "update_id, update_title, update_description, publish_ts, new_update"
      )
      .order("publish_ts", { ascending: false })
      .limit(3),
  ]);

  logQueryError(
    "pending bottle submissions",
    pendingSubmissionsResult.error
  );

  logQueryError(
    "analytics summary",
    analyticsSummaryResult.error
  );

  logQueryError(
    "daily analytics",
    dailyAnalyticsResult.error
  );

  logQueryError(
    "traffic sources",
    trafficSourcesResult.error
  );

  logQueryError(
    "bottle analytics",
    bottleAnalyticsResult.error
  );

  logQueryError(
    "BarrelLedger updates",
    updatesResult.error
  );

  const pendingSubmissions =
    (pendingSubmissionsResult.data ??
      []) as PendingBottleSubmission[];

  const analyticsSummary =
    (analyticsSummaryResult.data ??
      null) as AnalyticsSummary | null;

  const dailyAnalytics =
    (dailyAnalyticsResult.data ??
      []) as DailyAnalyticsRow[];

  const trafficSources =
    (trafficSourcesResult.data ??
      []) as TrafficSourceRow[];

  const bottleAnalytics =
    (bottleAnalyticsResult.data ??
      []) as BottleAnalyticsRow[];

  const updates =
    (updatesResult.data ??
      []) as BarrelLedgerUpdate[];

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

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="mb-6 text-4xl font-bold text-stone-950">
          Dashboard
        </h1>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/tastings/new"
            className="rounded border border-stone-300 bg-white p-6 text-xl font-semibold hover:shadow"
          >
            Add a Tasting
          </Link>

          <div className="rounded border border-stone-300 bg-stone-50 p-6">
            <div className="text-xl font-semibold text-stone-700">
              Add a Barrel Picker Experience
            </div>

            <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
              Coming Soon
            </div>
          </div>

          <Link
            href="/dashboard/change-password"
            className="rounded border border-stone-300 bg-white p-6 text-xl font-semibold hover:shadow"
          >
            Change Password
          </Link>
        </div>

        <section className="mb-8 rounded border border-stone-300 bg-white p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">
              BarrelLedger Updates
            </h2>

            <Link
              href="/dashboard/updates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center rounded border border-stone-400 px-4 py-2 text-sm font-semibold hover:bg-stone-100"
            >
              View All Updates

              <span className="ml-2" aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>

          {updates.length === 0 ? (
            <p className="text-sm text-stone-500">
              No BarrelLedger updates have been published yet.
            </p>
          ) : (
            <div className="divide-y divide-stone-200">
              {updates.map((update) => (
                <article
                  key={update.update_id}
                  className="py-4 first:pt-0"
                >
                  <div className="flex items-start gap-3">
                    {update.new_update && <NewUpdateStar />}

                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900">
                        {update.update_title}
                      </h3>

                      <p className="mt-1 text-xs text-stone-500">
                        {formatUpdateDate(update.publish_ts)}
                      </p>

                      {update.update_description && (
                        <p className="mt-2 text-sm leading-6 text-stone-700">
                          {update.update_description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 rounded border border-stone-300 bg-white p-6">
          <h2 className="mb-2 text-2xl font-bold">
            Bottles Pending Curation
          </h2>

          <p className="mb-4 text-sm leading-6 text-stone-600">
            These bottles were added through the tasting workflow
            and remain available to your organization while the
            Master Whiskey Library details are reviewed.
          </p>

          {pendingSubmissions.length === 0 ? (
            <p className="text-sm text-stone-500">
              No bottles are currently pending curation.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Submitted</th>
                    <th className="py-2">Bottle</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingSubmissions.map((submission) => (
                    <tr
                      key={
                        submission.master_data_submission_id
                      }
                      className="border-b"
                    >
                      <td className="py-2">
                        {formatSubmissionDate(
                          submission.created_at
                        )}
                      </td>

                      <td className="py-2 font-semibold">
                        {submission.submitted_display_name}
                      </td>

                      <td className="py-2">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                          {formatSubmissionStatus(
                            submission.submission_status
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <AnalyticsDashboard
          summary={analyticsSummary}
          dailyAnalytics={dailyAnalytics}
          trafficSources={trafficSources}
          bottleAnalytics={bottleAnalytics}
        />
      </section>
    </main>
  );
}

function NewUpdateStar() {
  return (
    <Image
      src="/images/gold_spinning_star.gif"
      alt="New update"
      width={28}
      height={28}
      unoptimized
      className="mt-0.5 shrink-0"
    />
  );
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString().slice(0, 10);
}

function logQueryError(
  queryName: string,
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null
) {
  if (!error) {
    return;
  }

  console.error(`Dashboard ${queryName} query failed`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function formatSubmissionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
}

function formatSubmissionStatus(value: string) {
  if (value === "needs_more_info") {
    return "Needs More Information";
  }

  return "Pending";
}

function formatUpdateDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}