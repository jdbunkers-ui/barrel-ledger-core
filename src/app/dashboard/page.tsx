import Image from "next/image";
import Link from "next/link";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireMember } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";

type DashboardPageProps = {
  searchParams?: Promise<{
    bvSort?: string;
    bvDir?: string;
  }>;
};

type BottleViewSortKey =
  | "bottle_name"
  | "last_24"
  | "last_7"
  | "total";

type SortDirection = "asc" | "desc";

type BottleViewCount = {
  organization_id: string;
  single_barrel_id: string | null;
  bottle_id: string | null;
  bottle_name: string | null;
  bottle_slug: string | null;
  total_bottle_views: number | string | null;
  bottle_views_last_7_days: number | string | null;
  bottle_views_last_30_days: number | string | null;
  bottle_views_last_24_hours: number | string | null;
  most_recent_view_ts: string | null;
};

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

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const member = await requireMember();
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const resolvedSearchParams = searchParams ? await searchParams : {};

  const bottleViewSort = normalizeBottleViewSortKey(
    resolvedSearchParams.bvSort
  );

  const bottleViewSortDirection = normalizeSortDirection(
    resolvedSearchParams.bvDir,
    bottleViewSort
  );

  const [
    { data: pendingSubmissionsRaw },
    { data: bottleCountsRaw },
    { data: updatesRaw },
  ] = await Promise.all([
    supabase
      .schema("barrel_ledger_public")
      .rpc("f_get_pending_bottle_submissions", {
        p_organization_id: member.organization_id,
      }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_bottle_view_counts")
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

  const bottleCounts = sortBottleViewCounts(
    (bottleCountsRaw ?? []) as BottleViewCount[],
    bottleViewSort,
    bottleViewSortDirection
  );

  const updates = (updatesRaw ?? []) as BarrelLedgerUpdate[];
  const pendingSubmissions =
    (pendingSubmissionsRaw ?? []) as PendingBottleSubmission[];

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
            <h2 className="text-2xl font-bold">BarrelLedger Updates</h2>

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
                <article key={update.update_id} className="py-4 first:pt-0">
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
            These bottles were added through the tasting workflow and remain
            available to your organization while the Master Whiskey Library
            details are reviewed.
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
                      key={submission.master_data_submission_id}
                      className="border-b"
                    >
                      <td className="py-2">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 font-semibold">
                        {submission.submitted_display_name}
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                          {submission.submission_status === "needs_more_info"
                            ? "Needs More Information"
                            : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded border border-stone-300 bg-white p-6">
          <h2 className="mb-4 text-2xl font-bold">Bottle Views</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">
                    <BottleViewSortLink
                      label="Bottle Name"
                      sortKey="bottle_name"
                      activeSortKey={bottleViewSort}
                      activeDirection={bottleViewSortDirection}
                      align="left"
                    />
                  </th>

                  <th className="py-2 text-right">
                    <BottleViewSortLink
                      label="Last 24 Hours"
                      sortKey="last_24"
                      activeSortKey={bottleViewSort}
                      activeDirection={bottleViewSortDirection}
                      align="right"
                    />
                  </th>

                  <th className="py-2 text-right">
                    <BottleViewSortLink
                      label="Last 7 Days"
                      sortKey="last_7"
                      activeSortKey={bottleViewSort}
                      activeDirection={bottleViewSortDirection}
                      align="right"
                    />
                  </th>

                  <th className="py-2 text-right">
                    <BottleViewSortLink
                      label="Total"
                      sortKey="total"
                      activeSortKey={bottleViewSort}
                      activeDirection={bottleViewSortDirection}
                      align="right"
                    />
                  </th>
                </tr>
              </thead>

              <tbody>
                {bottleCounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-sm text-stone-500">
                      No bottle views have been logged yet.
                    </td>
                  </tr>
                ) : (
                  bottleCounts.map((row) => (
                    <tr
                      key={
                        row.single_barrel_id ??
                        row.bottle_slug ??
                        row.bottle_name ??
                        "unknown-bottle"
                      }
                      className="border-b"
                    >
                      <td className="py-2 text-left">
                        {row.bottle_name ??
                          row.bottle_slug ??
                          "Unknown Bottle"}
                      </td>

                      <td className="py-2 text-right tabular-nums">
                        {formatCount(row.bottle_views_last_24_hours)}
                      </td>

                      <td className="py-2 text-right tabular-nums">
                        {formatCount(row.bottle_views_last_7_days)}
                      </td>

                      <td className="py-2 text-right tabular-nums">
                        {formatCount(row.total_bottle_views)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
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

function BottleViewSortLink({
  label,
  sortKey,
  activeSortKey,
  activeDirection,
  align,
}: {
  label: string;
  sortKey: BottleViewSortKey;
  activeSortKey: BottleViewSortKey;
  activeDirection: SortDirection;
  align: "left" | "right";
}) {
  const isActive = sortKey === activeSortKey;
  const isBottleName = sortKey === "bottle_name";

  /*
   * Bottle Name may toggle between A–Z and Z–A.
   * Numeric metric columns always sort descending.
   */
  const nextDirection: SortDirection = isBottleName
    ? isActive && activeDirection === "asc"
      ? "desc"
      : "asc"
    : "desc";

  let indicator = "↕";

  if (isActive) {
    indicator =
      isBottleName && activeDirection === "asc"
        ? "↑"
        : "↓";
  }

  return (
    <Link
      href={`/dashboard?bvSort=${sortKey}&bvDir=${nextDirection}`}
      className={`inline-flex items-center gap-1 font-semibold hover:underline ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      <span>{label}</span>

      <span className="text-xs text-stone-500">{indicator}</span>
    </Link>
  );
}

function normalizeBottleViewSortKey(
  value: string | undefined
): BottleViewSortKey {
  if (
    value === "bottle_name" ||
    value === "last_24" ||
    value === "last_7" ||
    value === "total"
  ) {
    return value;
  }

  return "last_24";
}

function normalizeSortDirection(
  value: string | undefined,
  sortKey: BottleViewSortKey
): SortDirection {
  /*
   * All numeric metric columns are always descending.
   * Only Bottle Name honors an ascending or descending URL value.
   */
  if (sortKey !== "bottle_name") {
    return "desc";
  }

  if (value === "desc") {
    return "desc";
  }

  return "asc";
}

function sortBottleViewCounts(
  rows: BottleViewCount[],
  sortKey: BottleViewSortKey,
  direction: SortDirection
) {
  const sortedRows = [...rows];

  sortedRows.sort((a, b) => {
    if (sortKey === "bottle_name") {
      const nameComparison = getBottleName(a).localeCompare(
        getBottleName(b),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );

      if (nameComparison !== 0) {
        return direction === "asc"
          ? nameComparison
          : nameComparison * -1;
      }

      return compareStableBottleIdentity(a, b);
    }

    const aLast24 = toNumber(a.bottle_views_last_24_hours);
    const bLast24 = toNumber(b.bottle_views_last_24_hours);

    const aLast7 = toNumber(a.bottle_views_last_7_days);
    const bLast7 = toNumber(b.bottle_views_last_7_days);

    const aTotal = toNumber(a.total_bottle_views);
    const bTotal = toNumber(b.total_bottle_views);

    let comparisons: number[];

    switch (sortKey) {
      case "last_7":
        comparisons = [
          bLast7 - aLast7,
          bLast24 - aLast24,
          bTotal - aTotal,
        ];
        break;

      case "total":
        comparisons = [
          bTotal - aTotal,
          bLast24 - aLast24,
          bLast7 - aLast7,
        ];
        break;

      case "last_24":
      default:
        comparisons = [
          bLast24 - aLast24,
          bLast7 - aLast7,
          bTotal - aTotal,
        ];
        break;
    }

    for (const comparison of comparisons) {
      if (comparison !== 0) {
        return comparison;
      }
    }

    const bottleNameComparison = getBottleName(a).localeCompare(
      getBottleName(b),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );

    if (bottleNameComparison !== 0) {
      return bottleNameComparison;
    }

    return compareStableBottleIdentity(a, b);
  });

  return sortedRows;
}

function compareStableBottleIdentity(
  a: BottleViewCount,
  b: BottleViewCount
) {
  return getStableBottleIdentity(a).localeCompare(
    getStableBottleIdentity(b),
    undefined,
    {
      numeric: true,
      sensitivity: "base",
    }
  );
}

function getStableBottleIdentity(row: BottleViewCount) {
  return (
    row.single_barrel_id ??
    row.bottle_id ??
    row.bottle_slug ??
    row.bottle_name ??
    ""
  );
}

function getBottleName(row: BottleViewCount) {
  return row.bottle_name ?? row.bottle_slug ?? "Unknown Bottle";
}

function toNumber(value: number | string | null) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return parsedValue;
}

function formatCount(value: number | string | null) {
  return toNumber(value).toLocaleString();
}

function formatUpdateDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}