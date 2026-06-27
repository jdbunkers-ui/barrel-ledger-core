"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type ProducerSummary = {
  organization_id: string;
  organization_slug: string;
  organization_name: string | null;

  producer_id: string;
  producer_slug: string | null;
  producer_name: string | null;

  state: string | null;
  city: string | null;
  country: string | null;

  single_barrel_count: number | null;
  tasting_count: number | null;
  avg_composite_score: number | null;
  most_recent_tasting_date: string | null;

  new_update: boolean | null;
  search_text: string | null;
};

type SortKey =
  | "producer_name"
  | "location"
  | "single_barrel_count"
  | "tasting_count"
  | "avg_composite_score"
  | "most_recent_tasting_date";

type SortDirection = "asc" | "desc";

type ProducersClientProps = {
  organizationSlug?: string;
};

const DEFAULT_ORGANIZATION_SLUG = "brad-hughes-bourbon-reviews";

export default function ProducersClient({
  organizationSlug = DEFAULT_ORGANIZATION_SLUG,
}: ProducersClientProps) {
  const [producers, setProducers] = useState<ProducerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] =
    useState<SortKey>("most_recent_tasting_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function loadProducers() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .schema("barrel_ledger_public")
        .from("v_producer_summary")
        .select(
          `
          organization_id,
          organization_slug,
          organization_name,
          producer_id,
          producer_slug,
          producer_name,
          state,
          city,
          country,
          single_barrel_count,
          tasting_count,
          avg_composite_score,
          most_recent_tasting_date,
          new_update,
          search_text
        `
        )
        .eq("organization_slug", organizationSlug)
        .order("most_recent_tasting_date", { ascending: false })
        .limit(500);

      if (error) {
        setErrorMessage(error.message);
        setProducers([]);
      } else {
        setProducers((data ?? []) as ProducerSummary[]);
      }

      setLoading(false);
    }

    loadProducers();
  }, [organizationSlug]);

  const filteredAndSortedProducers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = producers.filter((producer) => {
      if (!normalizedSearch) return true;

      return `${producer.search_text ?? ""} ${producer.producer_name ?? ""} ${producer.city ?? ""} ${producer.state ?? ""} ${producer.country ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch);
    });

    filtered.sort((a, b) => {
      if (sortKey === "location") {
        const aLocation = formatLocation(a.city, a.state, a.country);
        const bLocation = formatLocation(b.city, b.state, b.country);

        return sortDirection === "asc"
          ? aLocation.localeCompare(bLocation)
          : bLocation.localeCompare(aLocation);
      }

      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortKey === "producer_name") {
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }

      if (sortKey === "most_recent_tasting_date") {
        const aDate = new Date(String(aValue)).getTime();
        const bDate = new Date(String(bValue)).getTime();

        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    return filtered;
  }, [producers, searchText, sortKey, sortDirection]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextSortKey);
      setSortDirection(
        nextSortKey === "producer_name" || nextSortKey === "location"
          ? "asc"
          : "desc"
      );
    }
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  function producerHref(producer: ProducerSummary) {
    return producer.producer_slug
      ? `/producers/${producer.producer_slug}`
      : null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
      <div className="mb-6 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-semibold text-stone-700">
            Text Search
          </label>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search producer, city, state, country..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
          />
        </div>

        <div className="mt-4 text-sm text-stone-600">
          Showing {filteredAndSortedProducers.length} of {producers.length}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700">
          Loading producers...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && (
        <>
          <div className="space-y-3 md:hidden">
            {filteredAndSortedProducers.map((producer) => {
              const href = producerHref(producer);

              return (
                <article
                  key={producer.producer_id}
                  className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start gap-2">
                    <div className="mt-1 w-5 shrink-0">
                      <NewUpdateStar show={Boolean(producer.new_update)} />
                    </div>

                    <h2 className="text-base font-bold leading-snug text-stone-950">
                      {href ? (
                        <Link href={href} className="hover:underline">
                          {producer.producer_name ?? "Unnamed Producer"}
                        </Link>
                      ) : (
                        producer.producer_name ?? "Unnamed Producer"
                      )}
                    </h2>
                  </div>

                  <div className="mb-3 text-sm text-stone-600">
                    {formatLocation(
                      producer.city,
                      producer.state,
                      producer.country
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MobileStatCard
                      label="Pick Count"
                      value={String(producer.single_barrel_count ?? 0)}
                    />

                    <MobileStatCard
                      label="Tastings"
                      value={String(producer.tasting_count ?? 0)}
                    />

                    <MobileStatCard
                      label="Score"
                      value={formatScore(producer.avg_composite_score)}
                    />

                    <MobileStatCard
                      label="Most Recent"
                      value={formatDate(producer.most_recent_tasting_date)}
                    />
                  </div>
                </article>
              );
            })}

            {filteredAndSortedProducers.length === 0 && (
              <div className="rounded-xl border border-stone-300 bg-white p-6 text-center text-stone-600">
                No producers match the current filters.
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-stone-200 text-sm uppercase tracking-wide text-stone-700">
                <tr>
                  <th className="w-12 px-4 py-3"></th>

                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort("producer_name")}
                      className="font-bold hover:underline"
                    >
                      Producer{sortIndicator("producer_name")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort("location")}
                      className="font-bold hover:underline"
                    >
                      Location{sortIndicator("location")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("single_barrel_count")}
                      className="font-bold hover:underline"
                    >
                      Pick Count{sortIndicator("single_barrel_count")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("tasting_count")}
                      className="font-bold hover:underline"
                    >
                      Tastings{sortIndicator("tasting_count")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("avg_composite_score")}
                      className="font-bold hover:underline"
                    >
                      Score{sortIndicator("avg_composite_score")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort("most_recent_tasting_date")}
                      className="font-bold hover:underline"
                    >
                      Most Recent{sortIndicator("most_recent_tasting_date")}
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedProducers.map((producer) => {
                  const href = producerHref(producer);

                  return (
                    <tr
                      key={producer.producer_id}
                      className="border-t border-stone-200 hover:bg-stone-50"
                    >
                      <td className="px-4 py-3 text-center">
                        <NewUpdateStar show={Boolean(producer.new_update)} />
                      </td>

                      <td className="px-4 py-3 text-left font-semibold text-stone-900">
                        {href ? (
                          <Link href={href} className="hover:underline">
                            {producer.producer_name ?? "Unnamed Producer"}
                          </Link>
                        ) : (
                          producer.producer_name ?? "Unnamed Producer"
                        )}
                      </td>

                      <td className="px-4 py-3 text-left text-stone-800">
                        {formatLocation(
                          producer.city,
                          producer.state,
                          producer.country
                        )}
                      </td>

                      <td className="px-4 py-3 text-center text-stone-800">
                        {producer.single_barrel_count ?? 0}
                      </td>

                      <td className="px-4 py-3 text-center text-stone-800">
                        {producer.tasting_count ?? 0}
                      </td>

                      <td className="px-4 py-3 text-center text-stone-800">
                        {formatScore(producer.avg_composite_score)}
                      </td>

                      <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
                        {formatDate(producer.most_recent_tasting_date)}
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSortedProducers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-stone-600"
                    >
                      No producers match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function MobileStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-100 p-3 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-stone-900">{value}</div>
    </div>
  );
}

function formatLocation(
  city: string | null,
  state: string | null,
  country: string | null
) {
  const parts = [city, state, country].filter(
    (part) => part && part.trim() !== ""
  );

  return parts.length > 0 ? parts.join(", ") : "—";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toISOString().slice(0, 10);
}

function formatScore(value: number | null) {
  return value?.toFixed(1) ?? "—";
}