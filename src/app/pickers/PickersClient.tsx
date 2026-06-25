"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type PickerSummary = {
  organization_id: string;
  picker_id: string;
  picker_name: string | null;
  picker_type: string | null;
  state: string | null;
  city: string | null;
  single_barrel_count: number | null;
  tasting_count: number | null;
  avg_composite_score: number | null;
  most_recent_tasting_date: string | null;
  new_update: boolean | null;
  search_text: string | null;
};

type SortKey =
  | "picker_name"
  | "picker_type"
  | "state"
  | "city"
  | "single_barrel_count"
  | "tasting_count"
  | "avg_composite_score"
  | "most_recent_tasting_date";

type SortDirection = "asc" | "desc";

type PickersClientProps = {
  organizationId: string;
};

export default function PickersClient({ organizationId }: PickersClientProps) {
  const [pickers, setPickers] = useState<PickerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");

  const [sortKey, setSortKey] =
    useState<SortKey>("most_recent_tasting_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function loadPickers() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .schema("barrel_ledger_public")
        .from("v_picker_summary")
        .select(
          `
          organization_id,
          picker_id,
          picker_name,
          picker_type,
          state,
          city,
          single_barrel_count,
          tasting_count,
          avg_composite_score,
          most_recent_tasting_date,
          new_update,
          search_text
        `
        )
        .eq("organization_id", organizationId)
        .order("most_recent_tasting_date", { ascending: false })
        .limit(100);

      if (error) {
        setErrorMessage(error.message);
        setPickers([]);
      } else {
        setPickers((data ?? []) as PickerSummary[]);
      }

      setLoading(false);
    }

    loadPickers();
  }, [organizationId]);

  const filteredAndSortedPickers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = pickers.filter((picker) => {
      if (
        normalizedSearch &&
        !`${picker.search_text ?? ""} ${picker.picker_name ?? ""} ${
          picker.picker_type ?? ""
        } ${picker.state ?? ""} ${picker.city ?? ""}`
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

      if (
        sortKey === "picker_name" ||
        sortKey === "picker_type" ||
        sortKey === "state" ||
        sortKey === "city"
      ) {
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
  }, [pickers, searchText, sortKey, sortDirection]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextSortKey);
      setSortDirection(
        nextSortKey === "picker_name" ||
          nextSortKey === "picker_type" ||
          nextSortKey === "state" ||
          nextSortKey === "city"
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
            placeholder="Search picker, type, city, state..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
          />
        </div>

        <div className="mt-4 text-sm text-stone-600">
          Showing {filteredAndSortedPickers.length} of {pickers.length}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700">
          Loading pickers...
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
            {filteredAndSortedPickers.map((picker) => (
              <Link
                key={picker.picker_id}
                href={`/pickers/${picker.picker_id}`}
                className="block rounded-xl border border-stone-300 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start gap-2">
                  <div className="mt-1 w-5 shrink-0">
                    <NewUpdateStar show={Boolean(picker.new_update)} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold leading-snug text-stone-950">
                      {picker.picker_name ?? "Unnamed Picker"}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {[picker.picker_type, picker.city, picker.state]
                        .filter(Boolean)
                        .join(" • ") || "Picker details unavailable"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Date
                    </div>
                    <div className="mt-1 text-sm font-bold text-stone-900">
                      {formatDate(picker.most_recent_tasting_date)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Picks
                    </div>
                    <div className="mt-1 text-lg font-bold text-stone-900">
                      {picker.single_barrel_count ?? 0}
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Tastings
                    </div>
                    <div className="mt-1 text-lg font-bold text-stone-900">
                      {picker.tasting_count ?? 0}
                    </div>
                  </div>

                  <div className="rounded-lg bg-stone-100 p-3 text-center">
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Score
                    </div>
                    <div className="mt-1 text-lg font-bold text-stone-900">
                      {formatScore(picker.avg_composite_score)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {filteredAndSortedPickers.length === 0 && (
              <div className="rounded-xl border border-stone-300 bg-white p-6 text-center text-stone-600">
                No pickers match the current filters.
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
                      onClick={() => handleSort("picker_name")}
                      className="font-bold hover:underline"
                    >
                      Picker{sortIndicator("picker_name")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("picker_type")}
                      className="font-bold hover:underline"
                    >
                      Type{sortIndicator("picker_type")}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("city")}
                      className="font-bold hover:underline"
                    >
                      City{sortIndicator("city")}
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
                      onClick={() => handleSort("single_barrel_count")}
                      className="font-bold hover:underline"
                    >
                      Picks{sortIndicator("single_barrel_count")}
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
                {filteredAndSortedPickers.map((picker) => (
                  <tr
                    key={picker.picker_id}
                    className="border-t border-stone-200 hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 text-center">
                      <NewUpdateStar show={Boolean(picker.new_update)} />
                    </td>

                    <td className="px-4 py-3 text-left font-semibold text-stone-900">
                      <Link
                        href={`/pickers/${picker.picker_id}`}
                        className="hover:underline"
                      >
                        {picker.picker_name ?? "Unnamed Picker"}
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {picker.picker_type ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {picker.city ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {picker.state ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
                      {formatDate(picker.most_recent_tasting_date)}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {picker.single_barrel_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {picker.tasting_count ?? 0}
                    </td>

                    <td className="px-4 py-3 text-center text-stone-800">
                      {formatScore(picker.avg_composite_score)}
                    </td>
                  </tr>
                ))}

                {filteredAndSortedPickers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-stone-600"
                    >
                      No pickers match the current filters.
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