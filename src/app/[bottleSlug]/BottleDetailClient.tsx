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

type MainSpec = {
  label: string;
  value: string;
  icon: string;
};

type FeatureSpec = {
  label: string;
  value: string;
  icon: string;
  booleanValue?: boolean | null;
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

  const mainSpecs = useMemo<MainSpec[]>(() => {
    if (!bottle) return [];

    return [
      {
        label: "Proof",
        value: formatNumber(bottle.proof),
        icon: "💧",
      },
      {
        label: "Strength",
        value: bottle.bottling_strength_type ?? "—",
        icon: "🥃",
      },
      {
        label: "Subtype",
        value: bottle.spirit_subtype ?? bottle.spirit_category ?? "—",
        icon: "🗺️",
      },
      {
        label: "Age",
        value: bottle.age_display ?? formatAge(bottle.age_years),
        icon: "⌛",
      },
      {
        label: "Size",
        value: formatSize(bottle.size_ml),
        icon: "🍾",
      },
      {
        label: "Mash Bill",
        value: bottle.mash_bill ?? "—",
        icon: "🌽",
      },
    ];
  }, [bottle]);

  const featureSpecs = useMemo<FeatureSpec[]>(() => {
    if (!bottle) return [];

    return [
      {
        label: "Single Barrel",
        value: formatBoolean(bottle.single_barrel_ind),
        icon: "🛢️",
        booleanValue: bottle.single_barrel_ind,
      },
      {
        label: "Chill Filtered",
        value: formatBoolean(bottle.chill_filtered_ind),
        icon: "▽",
        booleanValue: bottle.chill_filtered_ind,
      },
      {
        label: "Finished",
        value: formatBoolean(bottle.finished_ind),
        icon: "💧",
        booleanValue: bottle.finished_ind,
      },
      {
        label: "Finish Type",
        value: bottle.finished_type ?? "—",
        icon: "🏭",
      },
      {
        label: "Barrel / Batch",
        value: formatBarrelBatch(bottle.batch_code, bottle.barrel_id),
        icon: "🛢️",
      },
      {
        label: "Bottling Year",
        value: bottle.bottling_year ? String(bottle.bottling_year) : "—",
        icon: "📅",
      },
    ];
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

                <div className="mt-3 space-y-1 text-sm text-stone-700 md:text-base">
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

          <div className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
              Composite Score
            </div>
            <div className="mt-1 text-5xl font-black leading-none text-stone-950">
              {formatScore(bottle.avg_composite_score)}
            </div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Based on {bottle.tasting_count ?? 0} tastings
            </div>
          </div>
        </div>

        <BottleSpecsSection mainSpecs={mainSpecs} featureSpecs={featureSpecs} />
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
    </section>
  );
}

function BottleSpecsSection({
  mainSpecs,
  featureSpecs,
}: {
  mainSpecs: MainSpec[];
  featureSpecs: FeatureSpec[];
}) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-stone-300 bg-gradient-to-b from-stone-50 to-white shadow-sm">
      <div className="relative flex items-center justify-center border-b border-stone-300 bg-stone-900 px-4 py-3 text-white shadow-sm">
        <div className="absolute left-4 hidden h-px w-24 bg-amber-500/70 md:block" />
        <div className="absolute right-4 hidden h-px w-24 bg-amber-500/70 md:block" />

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-amber-500/60 bg-stone-800 px-3 py-1 text-lg">
            🛢️
          </span>

          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.35em] text-white">
              Bottle Specs
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300">
              Specs sourced from The Master Whiskey Library
            </div>
          </div>
        </div>
      </div>

      <div className="animate-[specRollIn_0.45s_ease-out_both] px-4 py-5 md:px-6">
        <div className="grid gap-0 rounded-xl border border-stone-200 bg-white/80 md:grid-cols-6">
          {mainSpecs.map((spec, index) => (
            <MainSpecCell
              key={`${spec.label}-${spec.value}`}
              spec={spec}
              isLast={index === mainSpecs.length - 1}
            />
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {featureSpecs.map((spec) => (
            <FeatureSpecCard
              key={`${spec.label}-${spec.value}`}
              spec={spec}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes specRollIn {
          0% {
            opacity: 0;
            transform: translateY(-10px) scaleY(0.96);
            transform-origin: top;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            transform-origin: top;
          }
        }
      `}</style>
    </div>
  );
}

function MainSpecCell({
  spec,
  isLast,
}: {
  spec: MainSpec;
  isLast: boolean;
}) {
  return (
    <div
      className={`group flex min-h-[126px] flex-col items-center justify-center px-4 py-5 text-center transition duration-200 hover:bg-stone-50 ${
        isLast ? "" : "border-b border-stone-200 md:border-b-0 md:border-r"
      }`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-amber-700/30 bg-amber-900/10 text-2xl shadow-sm transition duration-200 group-hover:scale-110">
        {spec.icon}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        {spec.label}
      </div>

      <div className="mt-2 text-base font-black leading-snug text-stone-950">
        {spec.value}
      </div>
    </div>
  );
}

function FeatureSpecCard({ spec }: { spec: FeatureSpec }) {
  const hasBoolean = spec.booleanValue !== undefined;
  const isPositive = spec.booleanValue === true;
  const isNegative = spec.booleanValue === false;

  return (
    <div className="group rounded-xl border border-stone-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-xl transition duration-200 group-hover:scale-105">
          {spec.icon}
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {spec.label}
          </div>

          <div className="mt-2 flex items-center gap-2">
            {hasBoolean && (
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-black ${
                  isPositive
                    ? "bg-emerald-100 text-emerald-700"
                    : isNegative
                      ? "bg-red-100 text-red-700"
                      : "bg-stone-100 text-stone-500"
                }`}
              >
                {isPositive ? "✓" : isNegative ? "×" : "—"}
              </span>
            )}

            <div className="truncate text-base font-black text-stone-950">
              {spec.value}
            </div>
          </div>
        </div>
      </div>
    </div>
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

function formatSize(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value} ml`;
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}

function formatYesNo(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}

function formatBarrelBatch(
  batchCode: string | null | undefined,
  barrelId: string | null | undefined
) {
  if (batchCode && batchCode.trim() !== "") {
    return batchCode;
  }

  if (!barrelId || barrelId.trim() === "") {
    return "—";
  }

  const cleanValue = barrelId.trim();

  const looksLikeInternalId =
    cleanValue.length > 18 ||
    /^[a-f0-9-]{16,}$/i.test(cleanValue) ||
    cleanValue.toLowerCase().startsWith("sb:");

  if (looksLikeInternalId) {
    return "—";
  }

  return cleanValue;
}