"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AnalyticsSummary = {
  organization_id: string;
  views_last_24_hours: number | string | null;
  views_last_7_days: number | string | null;
  views_last_30_days: number | string | null;
  unique_visitors_last_7_days: number | string | null;
  unique_visitors_last_30_days: number | string | null;
  unique_sessions_last_7_days: number | string | null;
  unique_sessions_last_30_days: number | string | null;
  tracked_views_last_30_days: number | string | null;
  total_views_last_30_days: number | string | null;
  mobile_views_last_30_days: number | string | null;
  desktop_views_last_30_days: number | string | null;
  tablet_views_last_30_days: number | string | null;
  external_views_last_30_days: number | string | null;
  source_tracked_views_last_30_days: number | string | null;
  mobile_percentage_last_30_days: number | string | null;
  external_traffic_percentage_last_30_days: number | string | null;
  analytics_coverage_percentage_last_30_days:
    | number
    | string
    | null;
  most_recent_view_ts: string | null;
};

export type DailyAnalyticsRow = {
  organization_id: string;
  view_date: string;
  total_views: number | string | null;
  tracked_views: number | string | null;
  unique_visitors: number | string | null;
  unique_sessions: number | string | null;
  mobile_views: number | string | null;
  desktop_views: number | string | null;
  tablet_views: number | string | null;
  direct_views: number | string | null;
  internal_views: number | string | null;
  instagram_views: number | string | null;
  youtube_views: number | string | null;
  google_views: number | string | null;
  referral_views: number | string | null;
  untracked_source_views: number | string | null;
};

export type TrafficSourceRow = {
  organization_id: string;
  traffic_source: string;
  views_last_30_days: number | string | null;
  percentage_last_30_days: number | string | null;
};

export type BottleAnalyticsRow = {
  organization_id: string;
  single_barrel_id: string;
  bottle_id: string | null;
  bottle_name: string | null;
  bottle_slug: string | null;
  total_bottle_views: number | string | null;
  bottle_views_last_24_hours: number | string | null;
  bottle_views_last_7_days: number | string | null;
  bottle_views_last_30_days: number | string | null;
  unique_visitors_last_7_days: number | string | null;
  unique_visitors_last_30_days: number | string | null;
  unique_sessions_last_7_days: number | string | null;
  unique_sessions_last_30_days: number | string | null;
  tracked_views_last_30_days: number | string | null;
  mobile_views_last_30_days: number | string | null;
  desktop_views_last_30_days: number | string | null;
  tablet_views_last_30_days: number | string | null;
  mobile_percentage_last_30_days: number | string | null;
  analytics_coverage_percentage_last_30_days:
    | number
    | string
    | null;
  top_traffic_source_last_30_days: string | null;
  top_traffic_source_views_last_30_days:
    | number
    | string
    | null;
  most_recent_view_ts: string | null;
};

type TrendMetric =
  | "total_views"
  | "unique_visitors"
  | "unique_sessions";

type TrendRange = 7 | 30 | 90;

type BottleSortKey =
  | "bottle_name"
  | "last_24"
  | "last_7"
  | "total"
  | "visitors"
  | "sessions";

type AnalyticsDashboardProps = {
  summary: AnalyticsSummary | null;
  dailyAnalytics: DailyAnalyticsRow[];
  trafficSources: TrafficSourceRow[];
  bottleAnalytics: BottleAnalyticsRow[];
};

export default function AnalyticsDashboard({
  summary,
  dailyAnalytics,
  trafficSources,
  bottleAnalytics,
}: AnalyticsDashboardProps) {
  const [trendMetric, setTrendMetric] =
    useState<TrendMetric>("total_views");

  const [trendRange, setTrendRange] =
    useState<TrendRange>(30);

  const [bottleSortKey, setBottleSortKey] =
    useState<BottleSortKey>("last_24");

  const trendData = useMemo(
    () => buildTrendData(dailyAnalytics, trendRange),
    [dailyAnalytics, trendRange]
  );

  const sourceData = useMemo(
    () =>
      [...trafficSources]
        .sort(
          (a, b) =>
            toNumber(b.views_last_30_days) -
            toNumber(a.views_last_30_days)
        )
        .map((row) => ({
          source: formatTrafficSource(row.traffic_source),
          views: toNumber(row.views_last_30_days),
          percentage: toNumber(row.percentage_last_30_days),
        })),
    [trafficSources]
  );

  const deviceData = useMemo(
    () => [
      {
        device: "Mobile",
        views: toNumber(summary?.mobile_views_last_30_days),
      },
      {
        device: "Desktop",
        views: toNumber(summary?.desktop_views_last_30_days),
      },
      {
        device: "Tablet",
        views: toNumber(summary?.tablet_views_last_30_days),
      },
    ],
    [summary]
  );

  const sortedBottleAnalytics = useMemo(
    () =>
      sortBottleAnalytics(
        bottleAnalytics,
        bottleSortKey
      ),
    [bottleAnalytics, bottleSortKey]
  );

  const trackedViews = toNumber(
    summary?.tracked_views_last_30_days
  );

  const sourceTrackedViews = toNumber(
    summary?.source_tracked_views_last_30_days
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-stone-950">
          Bottle Analytics
        </h2>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Traffic, visitor, source, device, and bottle-level
          performance for your Barrel Ledger pages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Views — 24 Hours"
          value={formatCount(summary?.views_last_24_hours)}
          detail="Deduplicated bottle-page views recorded during the last 24 hours."
        />

        <MetricCard
          label="Views — 7 Days"
          value={formatCount(summary?.views_last_7_days)}
          detail="Deduplicated bottle-page views recorded during the last seven days."
        />

        <MetricCard
          label="Unique Visitors — 30 Days"
          value={formatCount(
            summary?.unique_visitors_last_30_days
          )}
          subtext={`Based on ${formatCount(
            trackedViews
          )} tracked views`}
          detail="Anonymous visitors are counted using a privacy-preserving hashed browser identifier."
        />

        <MetricCard
          label="Unique Sessions — 30 Days"
          value={formatCount(
            summary?.unique_sessions_last_30_days
          )}
          subtext={`Based on ${formatCount(
            trackedViews
          )} tracked views`}
          detail="A session represents activity within the same browser tab session."
        />

        <MetricCard
          label="Mobile Share — 30 Days"
          value={formatPercentage(
            summary?.mobile_percentage_last_30_days
          )}
          subtext={`Based on ${formatCount(
            trackedViews
          )} tracked views`}
          detail="The percentage of tracked device views identified as mobile."
        />

        <MetricCard
          label="External Discovery — 30 Days"
          value={formatPercentage(
            summary?.external_traffic_percentage_last_30_days
          )}
          subtext={`Based on ${formatCount(
            sourceTrackedViews
          )} source-tracked views`}
          detail="Traffic attributed to external sources rather than direct or internal Barrel Ledger navigation."
        />
      </div>

      <details
        open
        className="rounded-xl border border-stone-300 bg-white"
      >
        <summary className="cursor-pointer px-6 py-5 text-xl font-bold text-stone-950">
          Traffic Trend
        </summary>

        <div className="border-t border-stone-200 p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <MetricButton
                active={trendMetric === "total_views"}
                onClick={() =>
                  setTrendMetric("total_views")
                }
              >
                Views
              </MetricButton>

              <MetricButton
                active={trendMetric === "unique_visitors"}
                onClick={() =>
                  setTrendMetric("unique_visitors")
                }
              >
                Unique Visitors
              </MetricButton>

              <MetricButton
                active={trendMetric === "unique_sessions"}
                onClick={() =>
                  setTrendMetric("unique_sessions")
                }
              >
                Unique Sessions
              </MetricButton>
            </div>

            <div className="flex gap-2">
              {[7, 30, 90].map((range) => (
                <MetricButton
                  key={range}
                  active={trendRange === range}
                  onClick={() =>
                    setTrendRange(range as TrendRange)
                  }
                >
                  {range} Days
                </MetricButton>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  minTickGap={20}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={trendMetric}
                  name={formatTrendMetric(trendMetric)}
                  stroke="currentColor"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {trendMetric !== "total_views" && (
            <p className="mt-4 text-xs leading-5 text-stone-500">
              Unique visitor and session history begins when
              enhanced analytics tracking was deployed. Earlier
              views remain included in the total-view trend.
            </p>
          )}
        </div>
      </details>

      <div className="grid gap-6 lg:grid-cols-2">
        <details
          open
          className="rounded-xl border border-stone-300 bg-white"
        >
          <summary className="cursor-pointer px-6 py-5 text-xl font-bold text-stone-950">
            How Visitors Found Your Reviews
          </summary>

          <div className="border-t border-stone-200 p-6">
            {sourceData.length === 0 ? (
              <EmptyState message="No traffic-source data is available yet." />
            ) : (
              <>
                <div
                  style={{
                    height: Math.max(
                      240,
                      sourceData.length * 54
                    ),
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={sourceData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        bottom: 5,
                        left: 30,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="source"
                        width={130}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="views"
                        name="Views"
                        fill="currentColor"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-4 text-xs leading-5 text-stone-500">
                  Historical / Untracked represents views recorded
                  before source attribution was enabled.
                </p>
              </>
            )}
          </div>
        </details>

        <details
          open
          className="rounded-xl border border-stone-300 bg-white"
        >
          <summary className="cursor-pointer px-6 py-5 text-xl font-bold text-stone-950">
            Visitor Devices — 30 Days
          </summary>

          <div className="border-t border-stone-200 p-6">
            {trackedViews === 0 ? (
              <EmptyState message="No device information has been recorded yet." />
            ) : (
              <>
                <div className="h-72">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={deviceData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 20,
                        bottom: 5,
                        left: 20,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="device"
                        width={80}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="views"
                        name="Views"
                        fill="currentColor"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="mt-4 text-xs text-stone-500">
                  Based on {formatCount(trackedViews)} tracked
                  views.
                </p>
              </>
            )}
          </div>
        </details>
      </div>

      <details
        open
        className="rounded-xl border border-stone-300 bg-white"
      >
        <summary className="cursor-pointer px-6 py-5 text-xl font-bold text-stone-950">
          Bottle Performance
        </summary>

        <div className="border-t border-stone-200 p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <SortButton
              active={bottleSortKey === "last_24"}
              onClick={() =>
                setBottleSortKey("last_24")
              }
            >
              24 Hours
            </SortButton>

            <SortButton
              active={bottleSortKey === "last_7"}
              onClick={() =>
                setBottleSortKey("last_7")
              }
            >
              7 Days
            </SortButton>

            <SortButton
              active={bottleSortKey === "total"}
              onClick={() =>
                setBottleSortKey("total")
              }
            >
              Total
            </SortButton>

            <SortButton
              active={bottleSortKey === "visitors"}
              onClick={() =>
                setBottleSortKey("visitors")
              }
            >
              Visitors
            </SortButton>

            <SortButton
              active={bottleSortKey === "sessions"}
              onClick={() =>
                setBottleSortKey("sessions")
              }
            >
              Sessions
            </SortButton>

            <SortButton
              active={bottleSortKey === "bottle_name"}
              onClick={() =>
                setBottleSortKey("bottle_name")
              }
            >
              Bottle Name
            </SortButton>
          </div>

          {sortedBottleAnalytics.length === 0 ? (
            <EmptyState message="No bottle views have been logged yet." />
          ) : (
            <div className="space-y-2">
              {sortedBottleAnalytics.map((row) => (
                <BottleAnalyticsDisclosure
                  key={row.single_barrel_id}
                  row={row}
                />
              ))}
            </div>
          )}
        </div>
      </details>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        Visitor, session, source, and device analytics are
        available for views recorded after enhanced tracking was
        deployed. Total views include earlier activity. Current
        30-day analytics coverage is{" "}
        <strong>
          {formatPercentage(
            summary?.analytics_coverage_percentage_last_30_days
          )}
        </strong>
        .
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  detail,
}: {
  label: string;
  value: string;
  subtext?: string;
  detail: string;
}) {
  return (
    <details className="rounded-xl border border-stone-300 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer list-none">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          {label}
        </div>

        <div className="mt-2 text-3xl font-black text-stone-950">
          {value}
        </div>

        {subtext && (
          <div className="mt-2 text-xs text-stone-500">
            {subtext}
          </div>
        )}
      </summary>

      <p className="mt-4 border-t border-stone-200 pt-4 text-sm leading-6 text-stone-600">
        {detail}
      </p>
    </details>
  );
}

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-2 text-sm font-semibold ${
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function BottleAnalyticsDisclosure({
  row,
}: {
  row: BottleAnalyticsRow;
}) {
  const bottleName =
    row.bottle_name ??
    row.bottle_slug ??
    "Unknown Bottle";

  return (
    <details className="rounded-lg border border-stone-200 bg-stone-50">
      <summary className="cursor-pointer px-4 py-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_repeat(3,90px)] md:items-center">
          <div className="min-w-0 font-semibold text-stone-900">
            {bottleName}
          </div>

          <BottleSummaryMetric
            label="24h"
            value={row.bottle_views_last_24_hours}
          />

          <BottleSummaryMetric
            label="7d"
            value={row.bottle_views_last_7_days}
          />

          <BottleSummaryMetric
            label="Total"
            value={row.total_bottle_views}
          />
        </div>
      </summary>

      <div className="border-t border-stone-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailMetric
            label="Views — 30 Days"
            value={formatCount(
              row.bottle_views_last_30_days
            )}
          />

          <DetailMetric
            label="Unique Visitors — 7 Days"
            value={formatCount(
              row.unique_visitors_last_7_days
            )}
          />

          <DetailMetric
            label="Unique Sessions — 7 Days"
            value={formatCount(
              row.unique_sessions_last_7_days
            )}
          />

          <DetailMetric
            label="Top Source"
            value={formatTrafficSource(
              row.top_traffic_source_last_30_days
            )}
          />

          <DetailMetric
            label="Mobile Share"
            value={formatPercentage(
              row.mobile_percentage_last_30_days
            )}
          />

          <DetailMetric
            label="Analytics Coverage"
            value={formatPercentage(
              row.analytics_coverage_percentage_last_30_days
            )}
          />

          <DetailMetric
            label="Most Recent View"
            value={formatDateTime(
              row.most_recent_view_ts
            )}
          />

          {row.bottle_slug ? (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Bottle Page
              </div>

              <Link
                href={`/${row.bottle_slug}`}
                target="_blank"
                className="mt-1 inline-block font-semibold text-amber-800 underline"
              >
                Open Page ↗
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function BottleSummaryMetric({
  label,
  value,
}: {
  label: string;
  value: number | string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 md:block md:text-right">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </span>

      <div className="font-bold tabular-nums text-stone-950">
        {formatCount(value)}
      </div>
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </div>

      <div className="mt-1 font-semibold text-stone-900">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-6 text-sm text-stone-500">
      {message}
    </p>
  );
}

function buildTrendData(
  rows: DailyAnalyticsRow[],
  range: TrendRange
) {
  const rowMap = new Map(
    rows.map((row) => [row.view_date, row])
  );

  const today = new Date();
  const data = [];

  for (
    let offset = range - 1;
    offset >= 0;
    offset -= 1
  ) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    const dateKey = date.toISOString().slice(0, 10);
    const row = rowMap.get(dateKey);

    data.push({
      view_date: dateKey,
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date),
      total_views: toNumber(row?.total_views),
      unique_visitors: toNumber(
        row?.unique_visitors
      ),
      unique_sessions: toNumber(
        row?.unique_sessions
      ),
    });
  }

  return data;
}

function sortBottleAnalytics(
  rows: BottleAnalyticsRow[],
  sortKey: BottleSortKey
) {
  return [...rows].sort((a, b) => {
    if (sortKey === "bottle_name") {
      return getBottleName(a).localeCompare(
        getBottleName(b),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
    }

    const values: Record<
      Exclude<BottleSortKey, "bottle_name">,
      [number, number]
    > = {
      last_24: [
        toNumber(b.bottle_views_last_24_hours),
        toNumber(a.bottle_views_last_24_hours),
      ],
      last_7: [
        toNumber(b.bottle_views_last_7_days),
        toNumber(a.bottle_views_last_7_days),
      ],
      total: [
        toNumber(b.total_bottle_views),
        toNumber(a.total_bottle_views),
      ],
      visitors: [
        toNumber(b.unique_visitors_last_7_days),
        toNumber(a.unique_visitors_last_7_days),
      ],
      sessions: [
        toNumber(b.unique_sessions_last_7_days),
        toNumber(a.unique_sessions_last_7_days),
      ],
    };

    const [bValue, aValue] = values[sortKey];
    const comparison = bValue - aValue;

    if (comparison !== 0) {
      return comparison;
    }

    return getBottleName(a).localeCompare(
      getBottleName(b)
    );
  });
}

function getBottleName(row: BottleAnalyticsRow) {
  return (
    row.bottle_name ??
    row.bottle_slug ??
    "Unknown Bottle"
  );
}

function formatTrendMetric(metric: TrendMetric) {
  switch (metric) {
    case "unique_visitors":
      return "Unique Visitors";
    case "unique_sessions":
      return "Unique Sessions";
    case "total_views":
    default:
      return "Views";
  }
}

function formatTrafficSource(
  value: string | null | undefined
) {
  if (!value) {
    return "Not Yet Tracked";
  }

  switch (value.toLowerCase()) {
    case "untracked":
      return "Historical / Untracked";
    case "internal":
      return "Internal Barrel Ledger";
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "google":
      return "Google";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    case "email":
      return "Email";
    case "referral":
      return "Other Referral";
    case "direct":
      return "Direct";
    default:
      return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) =>
          character.toUpperCase()
        );
  }
}

function formatCount(
  value: number | string | null | undefined
) {
  return toNumber(value).toLocaleString();
}

function formatPercentage(
  value: number | string | null | undefined
) {
  if (value === null || value === undefined) {
    return "Not Yet Available";
  }

  return `${toNumber(value).toFixed(1)}%`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toNumber(
  value: number | string | null | undefined
) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}