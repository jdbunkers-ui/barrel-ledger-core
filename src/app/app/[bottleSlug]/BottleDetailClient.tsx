"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NewUpdateStar from "@/components/NewUpdateStar";
import { supabase } from "@/lib/supabaseClient";

type BottleDetail = {
  organization_id: string;
  organization_slug: string;
  organization_name: string | null;

  single_barrel_id: string;
  bottle_id: string | null;
  bottle_slug: string;

  bottle_display_name: string | null;
  producer_name: string | null;
  picker_name: string | null;

  proof: number | null;
  age_years: number | null;
  msrp: number | null;

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
};

export default function BottleDetailClient({
  organizationSlug,
  bottleSlug,
}: BottleDetailClientProps) {
  const [bottle, setBottle] = useState<BottleDetail | null>(null);
  const [tastings, setTastings] = useState<TastingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBottleDetail() {
      setLoading(true);
      setErrorMessage(null);

      const { data: bottleRows, error: bottleError } = await supabase
        .schema("barrel_ledger_public")
        .from("v_bottle_detail")
        .select(
          `
          organization_id,
          organization_slug,
          organization_name,
          single_barrel_id,
          bottle_id,
          bottle_slug,
          bottle_display_name,
          producer_name,
          picker_name,
          proof,
          age_years,
          msrp,
          tasting_count,
          avg_composite_score,
          most_recent_tasting_date,
          new_update
        `
        )
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

  const pageTitle = useMemo(() => {
    return bottle?.bottle_display_name ?? "Bottle Detail";
  }, [bottle]);

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
        <div className="flex items-start gap-3">
          <div className="mt-2 w-6 shrink-0">
            <NewUpdateStar show={Boolean(bottle.new_update)} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-stone-950 md:text-4xl">
              {pageTitle}
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700 md:text-base">
              {bottle.producer_name && (
                <span>
                  <span className="font-semibold">Producer:</span>{" "}
                  {bottle.producer_name}
                </span>
              )}

              {bottle.picker_name && (
                <span>
                  <span className="font-semibold">Picker:</span>{" "}
                  {bottle.picker_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            label="Score"
            value={formatScore(bottle.avg_composite_score)}
          />
          <MetricCard label="Proof" value={formatNumber(bottle.proof)} />
          <MetricCard label="Age" value={formatAge(bottle.age_years)} />
          <MetricCard label="MSRP" value={formatMoney(bottle.msrp)} />
          <MetricCard
            label="Tastings"
            value={String(bottle.tasting_count ?? 0)}
          />
        </div>

        <div className="mt-4 text-sm text-stone-600">
          Most recent tasting: {formatDate(bottle.most_recent_tasting_date)}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-300 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-stone-950">Tasting History</h2>

        {tastings.length === 0 ? (
          <p className="mt-4 text-stone-600">
            No tasting rows were found for this bottle.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {tastings.map((tasting) => (
              <article
                key={tasting.tasting_id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-5 shrink-0">
                      <NewUpdateStar show={Boolean(tasting.new_update)} />
                    </div>

                    <div>
                      <h3 className="font-bold text-stone-950">
                        {formatDate(tasting.tasting_date)}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                        {typeof tasting.tasted_blind === "boolean" && (
                          <span>
                            Blind: {tasting.tasted_blind ? "Yes" : "No"}
                          </span>
                        )}

                        {typeof tasting.would_rebuy === "boolean" && (
                          <span>
                            Would rebuy: {tasting.would_rebuy ? "Yes" : "No"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <MiniScore label="Nose" value={tasting.nose_score} />
                    <MiniScore label="Palate" value={tasting.palate_score} />
                    <MiniScore label="Finish" value={tasting.finish_score} />
                    <MiniScore label="Score" value={tasting.composite_score} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <NoteBlock label="Nose" value={tasting.nose_notes} />
                  <NoteBlock label="Palate" value={tasting.palate_notes} />
                  <NoteBlock label="Finish" value={tasting.finish_notes} />
                  <NoteBlock label="Overall" value={tasting.overall_notes} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-100 p-4 text-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-stone-950">{value}</div>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-stone-200">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </div>
      <div className="text-base font-bold text-stone-950">
        {value?.toFixed(1) ?? "—"}
      </div>
    </div>
  );
}

function NoteBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div>
      <div className="text-sm font-bold text-stone-950">{label}</div>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-700">
        {value}
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

function formatNumber(value: number | null) {
  return value?.toFixed(1) ?? "—";
}

function formatAge(value: number | null) {
  if (value === null || value === undefined) return "NAS";
  if (value <= 0) return "NAS";
  return `${value.toFixed(1)} yr`;
}

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `$${value.toFixed(0)}`;
}