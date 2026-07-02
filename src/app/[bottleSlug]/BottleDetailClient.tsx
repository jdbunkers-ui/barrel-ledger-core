"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NewUpdateStar from "@/components/NewUpdateStar";
import MasterWhiskeyLibrarySpecs from "@/components/MasterWhiskeyLibrarySpecs";
import { supabase } from "@/lib/supabaseClient";

type BottleDetail = {
  organization_id: string;
  organization_slug: string;
  organization_name: string | null;

  single_barrel_id: string;
  bottle_id?: string | null;
  bottle_slug: string;

  bottle_display_name: string | null;
  producer_name: string | null;
  picker_name?: string | null;

  brand_name?: string | null;
  expression_name?: string | null;
  pick_name?: string | null;
  barrel_id?: string | null;
  batch_code?: string | null;
  bottling_year?: number | null;

  spirit_category?: string | null;
  spirit_subtype?: string | null;
  bottling_strength_type?: string | null;

  proof: number | null;
  age_years: number | null;
  age_months?: number | null;
  age_display?: string | null;
  msrp: number | null;
  size_ml?: number | null;
  mash_bill?: string | null;

  single_barrel_ind?: boolean | null;
  chill_filtered_ind?: boolean | null;
  finished_ind?: boolean | null;
  finished_type?: string | null;

  tasting_count: number | null;
  avg_composite_score: number | null;
  most_recent_tasting_date: string | null;
  new_update: boolean | null;
};

type TastingRow = {
  tasting_id: string;
  tasting_date: string | null;

  nose_score: number | null;
  palate_score: number | null;
  finish_score: number | null;
  composite_score: number | null;

  nose_notes: string | null;
  palate_notes: string | null;
  finish_notes: string | null;
  overall_notes: string | null;

  tasted_blind: boolean | null;
  would_rebuy: boolean | null;

  created_at: string | null;
  new_update: boolean | null;
};

type BottleDetailClientProps = {
  organizationSlug: string;
  bottleSlug: string;
  canEditReviews: boolean;
};

export default function BottleDetailClient({
  organizationSlug,
  bottleSlug,
  canEditReviews,
}: BottleDetailClientProps) {
  const [bottle, setBottle] = useState<BottleDetail | null>(null);
  const [tastings, setTastings] = useState<TastingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loggedBottleViewRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadBottleDetail() {
      setLoading(true);
      setErrorMessage(null);

      const { data: bottleRows, error: bottleError } = await supabase
        .schema("barrel_ledger_public")
        .from("v_bottle_detail")
        .select("*")
        .eq("organization_slug", organizationSlug)
        .eq("bottle_slug", bottleSlug)
        .limit(1);

      if (bottleError) {
        setErrorMessage(bottleError.message);
        setBottle(null);
        setTastings([]);
        setLoading(false);
        return;
      }

      const matchedBottle = ((bottleRows ?? []) as BottleDetail[])[0] ?? null;

      if (!matchedBottle) {
        setBottle(null);
        setTastings([]);
        setLoading(false);
        return;
      }

      setBottle(matchedBottle);

      const { data: tastingRows, error: tastingError } = await supabase
        .schema("barrel_ledger_public")
        .from("v_reviews")
        .select(
          `
          tasting_id,
          tasting_date,
          nose_score,
          palate_score,
          finish_score,
          composite_score,
          nose_notes,
          palate_notes,
          finish_notes,
          overall_notes,
          tasted_blind,
          would_rebuy,
          created_at,
          new_update
        `
        )
        .eq("organization_id", matchedBottle.organization_id)
        .eq("single_barrel_id", matchedBottle.single_barrel_id)
        .order("tasting_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (tastingError) {
        setErrorMessage(tastingError.message);
        setTastings([]);
      } else {
        setTastings((tastingRows ?? []) as TastingRow[]);
      }

      setLoading(false);
    }

    loadBottleDetail();
  }, [organizationSlug, bottleSlug]);

  useEffect(() => {
    if (!bottle) return;

    const currentBottle = bottle;

    const logKey = `${currentBottle.organization_id}:${currentBottle.single_barrel_id}:${currentBottle.bottle_slug}`;

    if (loggedBottleViewRef.current === logKey) return;

    loggedBottleViewRef.current = logKey;

    async function logBottleView() {
      try {
        const response = await fetch("/api/bottle-view-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId: currentBottle.organization_id,
            singleBarrelId: currentBottle.single_barrel_id,
            bottleId: currentBottle.bottle_id ?? null,
            bottleSlug: currentBottle.bottle_slug,
            bottleName: currentBottle.bottle_display_name ?? null,
            routePath: window.location.pathname,
            siteHost: window.location.host,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          console.error("Bottle view log failed", response.status, result);
        }
      } catch (error) {
        console.error("Failed to log bottle view", error);
      }
    }

    logBottleView();
  }, [bottle]);

  const tastingCountLabel = useMemo(() => {
    const count = bottle?.tasting_count ?? tastings.length;

    if (count === 1) {
      return "Based on 1 tasting";
    }

    return `Based on ${count} tastings`;
  }, [bottle?.tasting_count, tastings.length]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-6 text-stone-700 shadow-sm">
          Loading bottle detail...
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

  if (!bottle) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
        <div className="rounded-xl border border-stone-300 bg-white p-8 text-center text-stone-700 shadow-sm">
          Bottle detail was not found.
          <div className="mt-4">
            <Link href="/" className="font-semibold text-amber-800 underline">
              Back to Reviews
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-12">
      <div className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-start gap-3">
              <div className="mt-2 w-6 shrink-0">
                <NewUpdateStar show={Boolean(bottle.new_update)} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-stone-950 md:text-4xl">
                  {bottle.bottle_display_name ?? "Unnamed Bottle"}
                </h1>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700 md:text-base">
                  {bottle.producer_name && (
                    <div>
                      <span className="font-semibold">Producer:</span>{" "}
                      {bottle.producer_name}
                    </div>
                  )}

                  <div>
                    <span className="font-semibold">Barrel Picker:</span>{" "}
                    {bottle.picker_name ?? "N/A"}
                  </div>

                  <div>
                    <span className="font-semibold">MSRP:</span>{" "}
                    {formatMoney(bottle.msrp)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-4 text-center shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-600">
              Composite Score
            </div>

            <div className="mt-1 font-serif text-5xl font-black leading-none text-stone-950">
              {formatScore(bottle.avg_composite_score)}
            </div>

            <div className="mx-auto mt-3 h-px w-28 bg-amber-600" />
            <div className="mx-auto mt-1 h-1 w-1 rotate-45 bg-amber-600" />

            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {tastingCountLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-bold text-stone-950">Tasting History</h2>

          <div className="text-sm text-stone-500">
            {tastings.length} tastings • sorted by tasting date desc
          </div>
        </div>

        {tastings.length === 0 ? (
          <p className="text-stone-600">
            No tasting rows were found for this bottle.
          </p>
        ) : (
          <div className="space-y-5">
            {tastings.map((tasting) => (
              <article
                key={tasting.tasting_id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-5"
              >
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 shrink-0">
                      <NewUpdateStar show={Boolean(tasting.new_update)} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-stone-950">
                        {formatDate(tasting.tasting_date)}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                        <span>
                          <span className="font-semibold">Blind:</span>{" "}
                          {formatYesNo(tasting.tasted_blind)}
                        </span>

                        <span>
                          <span className="font-semibold">Would Rebuy:</span>{" "}
                          {formatYesNo(tasting.would_rebuy)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <div className="grid grid-cols-4 gap-2">
                      <ScorePill label="Nose" value={tasting.nose_score} />
                      <ScorePill label="Palate" value={tasting.palate_score} />
                      <ScorePill label="Finish" value={tasting.finish_score} />
                      <ScorePill
                        label="Final"
                        value={tasting.composite_score}
                        emphasized
                      />
                    </div>

                    {canEditReviews && (
                      <Link
                        href={`/dashboard/tastings/${tasting.tasting_id}/edit`}
                        className="rounded border border-stone-300 bg-white px-3 py-1 text-sm font-semibold text-stone-800 hover:bg-stone-100"
                      >
                        Edit Review
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <TastingNoteBlock label="Nose" notes={tasting.nose_notes} />
                  <TastingNoteBlock
                    label="Palate"
                    notes={tasting.palate_notes}
                  />
                  <TastingNoteBlock
                    label="Finish"
                    notes={tasting.finish_notes}
                  />
                </div>

                {tasting.overall_notes && (
                  <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
                    <div className="text-sm font-semibold uppercase tracking-wide text-stone-600">
                      Overall Notes
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-700">
                      {tasting.overall_notes}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <MasterWhiskeyLibrarySpecs bottle={bottle} />
      </div>
    </section>
  );
}

function ScorePill({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number | null;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-center ${
        emphasized
          ? "border-stone-300 bg-white"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div
        className={`mt-1 ${
          emphasized ? "text-lg font-black" : "text-base font-bold"
        } text-stone-950`}
      >
        {formatScore(value)}
      </div>
    </div>
  );
}

function TastingNoteBlock({
  label,
  notes,
}: {
  label: string;
  notes: string | null;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-sm font-semibold uppercase tracking-wide text-stone-600">
        {label}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-700">
        {notes ?? "—"}
      </p>
    </div>
  );
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

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `$${value.toFixed(0)}`;
}

function formatYesNo(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}