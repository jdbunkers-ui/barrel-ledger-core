"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type ProducerSummary = {
  organization_id: string;
  producer_id: string;
  producer_name: string | null;
  state: string | null;
  tasting_count: number | null;
  avg_composite_score: number | null;
  most_recent_tasting_date: string | null;
  new_update: boolean | null;
};

type SortKey =
  | "producer_name"
  | "state"
  | "most_recent_tasting_date"
  | "tasting_count"
  | "avg_composite_score";

type SortDirection = "asc" | "desc";

type ProducersClientProps = {
  organizationId: string;
};

export default function ProducersClient({
  organizationId,
}: ProducersClientProps) {
  const [producers, setProducers] = useState<ProducerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("most_recent_tasting_date");
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
          producer_id,
          producer_name,
          state,
          tasting_count,
          avg_composite_score,
          most_recent_tasting_date,
          new_update
        `
        )
        .eq("organization_id", organizationId)
        .order("most_recent_tasting_date", { ascending: false })
        .limit(100);

      if (error) {
        setErrorMessage(error.message);
        setProducers([]);
      } else {
        setProducers((data ?? []) as ProducerSummary[]);
      }

      setLoading(false);
    }

    loadProducers();
  }, [organizationId]);

  const filteredAndSortedProducers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = producers.filter((producer) => {
      if (
        normalizedSearch &&
        !`${producer.producer_name ?? ""} ${producer.state ?? ""}`
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (sortKey === "producer_name" || sortKey === "state") {
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
        nextSortKey === "producer_name" || nextSortKey === "state"
          ? "asc"
          : "desc"
      );
    }
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
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
            placeholder="Search producer or state..."
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
            {filteredAndSortedProducers.map((producer) => (
              <Link
                key={producer.producer_id}
                href={`/producers/${producer.producer_id}`}
                className="block rounded-xl border border-stone-300 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-2">
                  <div className="mt-1 w-5 shrink-0">
                    <NewUpdateStar show={Boolean(producer.new_update)} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold leading-snug text-stone-950">
                      {producer.producer_name ?? "Unnamed Producer"}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {producer.state ?? "Location unavailable"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Date
                    </div>
                    <div className="mt-1 text-sm font-bold text-stone-900">
                      {formatDate(producer.most_recent_tasting_date)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Tastings
                    </div>
                    <div className="mt-1 text-lg font-bold text-stone-900">
                      {producer.tasting_count ?? 0}
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Score
                    </div>
                    <div className="mt-1 text-lg font-bold text-stone-900">
                      {formatScore(producer.avg_composite_score)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

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

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("state")}
                      className="font-bold hover:underline"
                    >
                      State{sortIndicator("state")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort("most_recent_tasting_date")}
                      className="font-bold hover:underline"
                    >
                      Date{sortIndicator("most_recent_tasting_date")}
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
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedProducers.map((producer) => (
                  <tr
                    key={producer.producer_id}
                    className="border-t border-stone-200 hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 text-center">
                      <NewUpdateStar show={Boolean(producer.new_update)} />
                    </td>

                    <td className="px-4 py-3 text-left font-semibold text-stone-900">
                      <Link
                        href={`/producers/${producer.producer_id}`}
                        className="hover:underline"
                      >
                        {producer.producer_name ?? "Unnamed Producer"}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {producer.state ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
                      {formatDate(producer.most_recent_tasting_date)}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {producer.tasting_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {formatScore(producer.avg_composite_score)}
                    </td>
                  </tr>
                ))}

                {filteredAndSortedProducers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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