"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type PickerSummary = {
  organization_id: string;
  organization_slug: string;
  organization_name: string | null;

  picker_id: string;
  picker_slug: string | null;
  picker_name: string | null;
  picker_type: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

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
  | "location"
  | "single_barrel_count"
  | "tasting_count"
  | "avg_composite_score"
  | "most_recent_tasting_date";

type SortDirection = "asc" | "desc";

type PickersClientProps = {
  organizationSlug: string;
};

export default function PickersClient({ organizationSlug }: PickersClientProps) {
  const [pickers, setPickers] = useState<PickerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("most_recent_tasting_date");
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
          organization_slug,
          organization_name,
          picker_id,
          picker_slug,
          picker_name,
          picker_type,
          city,
          state,
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
        setPickers([]);
      } else {
        setPickers((data ?? []) as PickerSummary[]);
      }

      setLoading(false);
    }

    loadPickers();
  }, [organizationSlug]);

  const filteredAndSortedPickers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = pickers.filter((picker) => {
      if (!normalizedSearch) return true;

      return `${picker.search_text ?? ""} ${picker.picker_name ?? ""} ${
        picker.picker_type ?? ""
      } ${picker.city ?? ""} ${picker.state ?? ""} ${picker.country ?? ""}`
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

      if (sortKey === "picker_name" || sortKey === "picker_type") {
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
          nextSortKey === "location"
          ? "asc"
          : "desc"
      );
    }
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  function pickerHref(picker: PickerSummary) {
    return picker.picker_slug ? `/pickers/${picker.picker_slug}` : null;
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
            {filteredAndSortedPickers.map((picker) => {
              const href = pickerHref(picker);

              return (
                <article
                  key={picker.picker_id}
                  className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start gap-2">
                    <div className="mt-1 w-5 shrink-0">
                      <NewUpdateStar show={Boolean(picker.new_update)} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold leading-snug text-stone-950">
                        {href ? (
                          <Link href={href} className="hover:underline">
                            {picker.picker_name ?? "Unnamed Picker"}
                          </Link>
                        ) : (
                          picker.picker_name ?? "Unnamed Picker"
                        )}
                      </h2>

                      <div className="mt-1 text-sm text-stone-600">
                        {picker.picker_type ?? "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 text-sm text-stone-600">
                    {formatLocation(picker.city, picker.state, picker.country)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MobileStatCard
                      label="Pick Count"
                      value={String(picker.single_barrel_count ?? 0)}
                    />

                    <MobileStatCard
                      label="Tastings"
                      value={String(picker.tasting_count ?? 0)}
                    />

                    <MobileStatCard
                      label="Score"
                      value={formatScore(picker.avg_composite_score)}
                    />

                    <MobileStatCard
                      label="Most Recent"
                      value={formatDate(picker.most_recent_tasting_date)}
                    />
                  </div>
                </article>
              );
            })}

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

                  <th className="px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => handleSort("picker_type")}
                      className="font-bold hover:underline"
                    >
                      Type{sortIndicator("picker_type")}
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
                {filteredAndSortedPickers.map((picker) => {
                  const href = pickerHref(picker);

                  return (
                    <tr
                      key={picker.picker_id}
                      className="border-t border-stone-200 hover:bg-stone-50"
                    >
                      <td className="px-4 py-3 text-center">
                        <NewUpdateStar show={Boolean(picker.new_update)} />
                      </td>

                      <td className="px-4 py-3 text-left font-semibold text-stone-900">
                        {href ? (
                          <Link href={href} className="hover:underline">
                            {picker.picker_name ?? "Unnamed Picker"}
                          </Link>
                        ) : (
                          picker.picker_name ?? "Unnamed Picker"
                        )}
                      </td>

                      <td className="px-4 py-3 text-left text-stone-800">
                        {picker.picker_type ?? "—"}
                      </td>

                      <td className="px-4 py-3 text-left text-stone-800">
                        {formatLocation(
                          picker.city,
                          picker.state,
                          picker.country
                        )}
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

                      <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
                        {formatDate(picker.most_recent_tasting_date)}
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSortedPickers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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