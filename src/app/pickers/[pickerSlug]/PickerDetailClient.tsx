"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type PickerProfile = {
  picker_id: string;
  picker_slug: string | null;
  picker_name: string | null;
  canonical_picker_name: string | null;
  picker_type: string | null;

  country: string | null;
  state: string | null;
  city: string | null;
  postal_code: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  full_address: string | null;

  phone_number: string | null;

  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  google_maps_url: string | null;

  picker_photo_filename: string | null;
  picker_description: string | null;

  new_update: boolean | null;
};

type ReviewSummary = {
  organization_id: string;
  organization_slug: string;
  organization_name: string | null;

  single_barrel_id: string;
  bottle_id: string | null;
  bottle_slug: string | null;

  producer_id: string | null;
  producer_slug: string | null;
  producer_name: string | null;

  picker_id: string | null;
  picker_name: string | null;

  bottle_display_name: string | null;
  proof: number | null;
  age_years: number | null;
  msrp: number | null;

  tasting_count: number | null;
  avg_composite_score: number | null;
  most_recent_tasting_date: string | null;
  most_recent_created_at: string | null;

  new_update: boolean | null;
  search_text: string | null;
};

type PickerDetailClientProps = {
  organizationSlug: string;
  pickerSlug: string;
};

type ReviewSortKey =
  | "bottle_display_name"
  | "producer_name"
  | "proof"
  | "most_recent_tasting_date"
  | "tasting_count"
  | "avg_composite_score";

type SortDirection = "asc" | "desc";

export default function PickerDetailClient({
  organizationSlug,
  pickerSlug,
}: PickerDetailClientProps) {
  const [picker, setPicker] = useState<PickerProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [reviewSortKey, setReviewSortKey] =
    useState<ReviewSortKey>("most_recent_tasting_date");
  const [reviewSortDirection, setReviewSortDirection] =
    useState<SortDirection>("desc");

  useEffect(() => {
    async function loadPickerDetail() {
      setLoading(true);
      setErrorMessage(null);

      const { data: pickerRows, error: pickerError } = await supabase
        .schema("barrel_ledger_public")
        .from("v_picker_detail")
        .select(
          `
          picker_id,
          picker_slug,
          picker_name,
          canonical_picker_name,
          picker_type,
          country,
          state,
          city,
          postal_code,
          address_line_1,
          address_line_2,
          full_address,
          phone_number,
          instagram_url,
          facebook_url,
          website_url,
          google_maps_url,
          picker_photo_filename,
          picker_description,
          new_update
        `
        )
        .eq("picker_slug", pickerSlug)
        .limit(1);

      if (pickerError) {
        setErrorMessage(pickerError.message);
        setPicker(null);
        setReviews([]);
        setLoading(false);
        return;
      }

      const matchedPicker = ((pickerRows ?? []) as PickerProfile[])[0] ?? null;

      if (!matchedPicker) {
        setPicker(null);
        setReviews([]);
        setLoading(false);
        return;
      }

      setPicker(matchedPicker);

      const { data: reviewRows, error: reviewError } = await supabase
        .schema("barrel_ledger_public")
        .from("v_review_summary")
        .select(
          `
          organization_id,
          organization_slug,
          organization_name,
          single_barrel_id,
          bottle_id,
          bottle_slug,
          producer_id,
          producer_slug,
          producer_name,
          picker_id,
          picker_name,
          bottle_display_name,
          proof,
          age_years,
          msrp,
          tasting_count,
          avg_composite_score,
          most_recent_tasting_date,
          most_recent_created_at,
          new_update,
          search_text
        `
        )
        .eq("organization_slug", organizationSlug)
        .eq("picker_id", matchedPicker.picker_id)
        .order("most_recent_tasting_date", { ascending: false })
        .order("bottle_display_name", { ascending: true });

      if (reviewError) {
        setErrorMessage(reviewError.message);
        setReviews([]);
      } else {
        setReviews((reviewRows ?? []) as ReviewSummary[]);
      }

      setLoading(false);
    }

    loadPickerDetail();
  }, [organizationSlug, pickerSlug]);

  const filteredAndSortedReviews = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = reviews.filter((review) => {
      if (!normalizedSearch) return true;

      return `${review.search_text ?? ""} ${review.bottle_display_name ?? ""} ${
        review.producer_name ?? ""
      }`
        .toLowerCase()
        .includes(normalizedSearch);
    });

    filtered.sort((a, b) => {
      const aValue = a[reviewSortKey];
      const bValue = b[reviewSortKey];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (
        reviewSortKey === "bottle_display_name" ||
        reviewSortKey === "producer_name"
      ) {
        return reviewSortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }

      if (reviewSortKey === "most_recent_tasting_date") {
        const aDate = new Date(String(aValue)).getTime();
        const bDate = new Date(String(bValue)).getTime();

        return reviewSortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      return reviewSortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    return filtered;
  }, [reviews, searchText, reviewSortKey, reviewSortDirection]);

  const stats = useMemo(() => {
    const pickCount = reviews.length;

    const tastingCount = reviews.reduce(
      (sum, review) => sum + (review.tasting_count ?? 0),
      0
    );

    const scoreValues = reviews
      .map((review) => review.avg_composite_score)
      .filter((value): value is number => value !== null && value !== undefined);

    const avgScore =
      scoreValues.length > 0
        ? scoreValues.reduce((sum, value) => sum + value, 0) /
          scoreValues.length
        : null;

    const mostRecentDate =
      reviews.length > 0
        ? reviews
            .map((review) => review.most_recent_tasting_date)
            .filter((value): value is string => Boolean(value))
            .sort()
            .at(-1) ?? null
        : null;

    return {
      pickCount,
      tastingCount,
      avgScore,
      mostRecentDate,
    };
  }, [reviews]);

  const pickerPhotoUrl = getPickerPhotoUrl(picker?.picker_photo_filename);

  function handleReviewSort(nextSortKey: ReviewSortKey) {
    if (reviewSortKey === nextSortKey) {
      setReviewSortDirection(reviewSortDirection === "asc" ? "desc" : "asc");
    } else {
      setReviewSortKey(nextSortKey);
      setReviewSortDirection(
        nextSortKey === "bottle_display_name" ||
          nextSortKey === "producer_name"
          ? "asc"
          : "desc"
      );
    }
  }

  function reviewSortIndicator(column: ReviewSortKey) {
    if (reviewSortKey !== column) return "";
    return reviewSortDirection === "asc" ? " ▲" : " ▼";
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700 shadow-sm">
          Loading picker detail...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 shadow-sm">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!picker) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-8 text-center text-stone-700 shadow-sm">
          Picker detail was not found.
          <div className="mt-4">
            <Link
              href="/pickers"
              className="font-semibold text-amber-800 underline"
            >
              Back to Pickers
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
      <div className="mb-4">
        <Link
          href="/pickers"
          className="text-sm font-semibold text-amber-900 hover:underline"
        >
          ← Back to Pickers
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_340px]">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-3">
              <div className="mt-2 w-6 shrink-0">
                <NewUpdateStar show={Boolean(picker.new_update)} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-stone-950 md:text-4xl">
                  {picker.picker_name ?? "Unnamed Picker"}
                </h1>

                {picker.canonical_picker_name &&
                  picker.canonical_picker_name !== picker.picker_name && (
                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                      {picker.canonical_picker_name}
                    </div>
                  )}

                <div className="mt-4 text-base font-semibold text-stone-700">
                  {picker.picker_type ?? "—"}
                </div>

                <div className="mt-2 text-sm text-stone-600">
                  {formatLocation(picker.city, picker.state, picker.country)}
                </div>

                {formatAddress(picker) !== "—" && (
                  <div className="mt-2 text-sm leading-6 text-stone-600">
                    {formatAddress(picker)}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <ExternalLink href={picker.website_url} label="Website" />
                  <ExternalLink href={picker.instagram_url} label="Instagram" />
                  <ExternalLink href={picker.facebook_url} label="Facebook" />
                  <ExternalLink href={picker.google_maps_url} label="Map" />
                </div>
              </div>
            </div>

            {picker.picker_description ? (
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-stone-700 md:text-base">
                {picker.picker_description}
              </p>
            ) : (
              <p className="mt-6 text-sm leading-7 text-stone-600 md:text-base">
                Picker description has not been added yet.
              </p>
            )}
          </div>

          <div className="border-t border-stone-300 bg-stone-50 p-6 md:border-l md:border-t-0">
            {pickerPhotoUrl ? (
              <div className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm">
                <img
                  src={pickerPhotoUrl}
                  alt={picker.picker_name ?? "Picker"}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white text-center text-sm font-semibold uppercase tracking-[0.18em] text-stone-400 md:h-64">
                No Picker Image
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <PickerStatCard label="Pick Count" value={String(stats.pickCount)} />
              <PickerStatCard
                label="Tastings"
                value={String(stats.tastingCount)}
              />
              <PickerStatCard label="Avg Score" value={formatScore(stats.avgScore)} />
              <PickerStatCard
                label="Most Recent"
                value={formatDate(stats.mostRecentDate)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              Search Reviewed Bottles
            </label>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search bottle, producer, style..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            />
          </div>

          <div className="text-sm text-stone-600">
            Showing {filteredAndSortedReviews.length} of {reviews.length}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-bold text-stone-950">
            Reviewed Bottles
          </h2>

          <div className="text-sm text-stone-500">
            From {picker.picker_name ?? "this picker"}
          </div>
        </div>

        {filteredAndSortedReviews.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-stone-600">
            No reviewed bottles were found for this picker.
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredAndSortedReviews.map((review) => (
                <ReviewMobileCard
                  key={review.single_barrel_id}
                  review={review}
                />
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-stone-200 text-sm uppercase tracking-wide text-stone-700">
                  <tr>
                    <th className="w-12 px-4 py-3"></th>

                    <th className="px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={() => handleReviewSort("bottle_display_name")}
                        className="font-bold hover:underline"
                      >
                        Bottle{reviewSortIndicator("bottle_display_name")}
                      </button>
                    </th>

                    <th className="px-4 py-3 text-left">
                      <button
                        type="button"
                        onClick={() => handleReviewSort("producer_name")}
                        className="font-bold hover:underline"
                      >
                        Producer{reviewSortIndicator("producer_name")}
                      </button>
                    </th>

                    <th className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleReviewSort("proof")}
                        className="font-bold hover:underline"
                      >
                        Proof{reviewSortIndicator("proof")}
                      </button>
                    </th>

                    <th className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewSort("most_recent_tasting_date")
                        }
                        className="font-bold hover:underline"
                      >
                        Date{reviewSortIndicator("most_recent_tasting_date")}
                      </button>
                    </th>

                    <th className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleReviewSort("tasting_count")}
                        className="font-bold hover:underline"
                      >
                        Tastings{reviewSortIndicator("tasting_count")}
                      </button>
                    </th>

                    <th className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleReviewSort("avg_composite_score")}
                        className="font-bold hover:underline"
                      >
                        Score{reviewSortIndicator("avg_composite_score")}
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAndSortedReviews.map((review) => (
                    <ReviewTableRow
                      key={review.single_barrel_id}
                      review={review}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ReviewTableRow({ review }: { review: ReviewSummary }) {
  const href = bottleHref(review);

  return (
    <tr className="border-t border-stone-200 hover:bg-stone-50">
      <td className="px-4 py-3 text-center">
        <NewUpdateStar show={Boolean(review.new_update)} />
      </td>

      <td className="px-4 py-3 text-left font-semibold text-stone-900">
        {href ? (
          <Link href={href} className="hover:underline">
            {review.bottle_display_name ?? "Unnamed Bottle"}
          </Link>
        ) : (
          review.bottle_display_name ?? "Unnamed Bottle"
        )}
      </td>

      <td className="px-4 py-3 text-left text-stone-800">
        {review.producer_name ?? "—"}
      </td>

      <td className="px-4 py-3 text-center text-stone-800">
        {formatProof(review.proof)}
      </td>

      <td className="px-4 py-3 text-center text-stone-800 whitespace-nowrap">
        {formatDate(review.most_recent_tasting_date)}
      </td>

      <td className="px-4 py-3 text-center text-stone-800">
        {review.tasting_count ?? 0}
      </td>

      <td className="px-4 py-3 text-center text-stone-800">
        {formatScore(review.avg_composite_score)}
      </td>
    </tr>
  );
}

function ReviewMobileCard({ review }: { review: ReviewSummary }) {
  const href = bottleHref(review);

  return (
    <article className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2">
        <div className="mt-1 w-5 shrink-0">
          <NewUpdateStar show={Boolean(review.new_update)} />
        </div>

        <div>
          <h3 className="text-base font-bold leading-snug text-stone-950">
            {href ? (
              <Link href={href} className="hover:underline">
                {review.bottle_display_name ?? "Unnamed Bottle"}
              </Link>
            ) : (
              review.bottle_display_name ?? "Unnamed Bottle"
            )}
          </h3>

          {review.producer_name && (
            <div className="mt-1 text-xs text-stone-500">
              Producer: {review.producer_name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <MobileStatCard label="Proof" value={formatProof(review.proof)} />
        <MobileStatCard
          label="Date"
          value={formatDate(review.most_recent_tasting_date)}
        />
        <MobileStatCard
          label="Tastings"
          value={String(review.tasting_count ?? 0)}
        />
        <MobileStatCard
          label="Score"
          value={formatScore(review.avg_composite_score)}
        />
      </div>
    </article>
  );
}

function PickerStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-stone-950">{value}</div>
    </div>
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

function ExternalLink({
  href,
  label,
}: {
  href: string | null | undefined;
  label: string;
}) {
  if (!href || href.trim() === "") {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-700 hover:bg-stone-100"
    >
      {label}
    </a>
  );
}

function bottleHref(review: ReviewSummary) {
  return review.bottle_slug ? `/${review.bottle_slug}` : null;
}

function getPickerPhotoUrl(filename: string | null | undefined) {
  if (!filename || filename.trim() === "") {
    return null;
  }

  const cleanFilename = filename.trim();

  if (
    cleanFilename.startsWith("http://") ||
    cleanFilename.startsWith("https://")
  ) {
    return cleanFilename;
  }

  const { data } = supabase.storage
    .from("master-whiskey-library")
    .getPublicUrl(`pickers/${cleanFilename}`);

  return data.publicUrl;
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

function formatAddress(picker: PickerProfile) {
  if (picker.full_address && picker.full_address.trim() !== "") {
    return picker.full_address;
  }

  const street = [picker.address_line_1, picker.address_line_2].filter(
    (part) => part && part.trim() !== ""
  );

  const cityStateZip = [picker.city, picker.state, picker.postal_code].filter(
    (part) => part && part.trim() !== ""
  );

  const parts = [...street, cityStateZip.join(", "), picker.country].filter(
    (part) => part && part.trim() !== ""
  );

  return parts.length > 0 ? parts.join(" • ") : "—";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toISOString().slice(0, 10);
}

function formatProof(value: number | null) {
  return value?.toFixed(1) ?? "—";
}

function formatScore(value: number | null) {
  return value?.toFixed(1) ?? "—";
}