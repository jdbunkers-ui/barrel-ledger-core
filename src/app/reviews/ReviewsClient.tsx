"use client";

import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type ReviewSummary = {
  single_barrel_id: string;
  bottle_display_name: string | null;
  avg_composite_score: number | null;
  tasting_count: number | null;
  most_recent_created_at: string | null;
  proof: number | null;
  new_update: boolean | null;
  search_text: string | null;
};

type SortKey =
  | "bottle_display_name"
  | "proof"
  | "most_recent_created_at"
  | "tasting_count"
  | "avg_composite_score";

type SortDirection = "asc" | "desc";

const proofOptions = Array.from({ length: 61 }, (_, index) => 80 + index);

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [maximumProof, setMaximumProof] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("most_recent_created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .schema("barrel_ledger_public")
        .from("v_review_summary")
        .select(
          `
          single_barrel_id,
          bottle_display_name,
          avg_composite_score,
          tasting_count,
          most_recent_created_at,
          proof,
          new_update,
          search_text
        `
        )
        .order("most_recent_created_at", { ascending: false })
        .limit(100);

      if (error) {
        setErrorMessage(error.message);
        setReviews([]);
      } else {
        setReviews((data ?? []) as ReviewSummary[]);
      }

      setLoading(false);
    }

    loadReviews();
  }, []);

  const filteredAndSortedReviews = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const maximumProofNumber =
      maximumProof === "" ? null : Number(maximumProof);

    const filtered = reviews.filter((review) => {
      if (
        normalizedSearch &&
        !`${review.search_text ?? ""} ${review.bottle_display_name ?? ""}`
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      if (
        maximumProofNumber !== null &&
        Number.isFinite(maximumProofNumber) &&
        (review.proof ?? 0) > maximumProofNumber
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

      if (sortKey === "bottle_display_name") {
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }

      if (sortKey === "most_recent_created_at") {
        const aDate = new Date(String(aValue)).getTime();
        const bDate = new Date(String(bValue)).getTime();

        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    return filtered;
  }, [reviews, searchText, maximumProof, sortKey, sortDirection]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(nextSortKey);
      setSortDirection(nextSortKey === "bottle_display_name" ? "asc" : "desc");
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

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              Text Search
            </label>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search bottle, producer, picker, style..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              Proof At or Below
            </label>
            <select
              value={maximumProof}
              onChange={(event) => setMaximumProof(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            >
              <option value="">All Proofs</option>
              {proofOptions.map((proof) => (
                <option key={proof} value={proof}>
                  {proof} or lower
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-stone-600">
          Showing {filteredAndSortedReviews.length} of {reviews.length}
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700">
          Loading reviews...
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && (
        <div className="overflow-x-auto rounded-xl border border-stone-300 bg-white shadow-sm">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="bg-stone-200 text-sm uppercase tracking-wide text-stone-700">
              <tr>
                <th className="w-12 px-4 py-3"></th>

                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => handleSort("bottle_display_name")}
                    className="font-bold hover:underline"
                  >
                    Bottle{sortIndicator("bottle_display_name")}
                  </button>
                </th>

                <th className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => handleSort("proof")}
                    className="font-bold hover:underline"
                  >
                    Proof{sortIndicator("proof")}
                  </button>
                </th>

                <th className="px-4 py-3 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("most_recent_created_at")}
                    className="font-bold hover:underline"
                  >
                    Date{sortIndicator("most_recent_created_at")}
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
              {filteredAndSortedReviews.map((review) => (
                <tr
                  key={review.single_barrel_id}
                  className="border-t border-stone-200 hover:bg-stone-50"
                >
                  <td className="px-4 py-3 text-center">
                    <NewUpdateStar show={Boolean(review.new_update)} />
                  </td>

                  <td className="px-4 py-3 text-left font-semibold text-stone-900">
                    {review.bottle_display_name ?? "Unnamed Bottle"}
                  </td>

                  <td className="px-4 py-3 text-center text-stone-800">
                    {review.proof?.toFixed(1) ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
                    {formatDate(review.most_recent_created_at)}
                  </td>

                  <td className="px-4 py-3 text-center text-stone-800">
                    {review.tasting_count ?? 0}
                  </td>

                  <td className="px-4 py-3 text-center text-stone-800">
                    {review.avg_composite_score?.toFixed(1) ?? "—"}
                  </td>
                </tr>
              ))}

              {filteredAndSortedReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-stone-600"
                  >
                    No reviews match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}