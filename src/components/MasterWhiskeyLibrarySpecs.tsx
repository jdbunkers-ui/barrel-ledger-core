"use client";

import type { ReactNode } from "react";

export type MasterWhiskeyLibraryBottle = {
  producer_name?: string | null;
  picker_name?: string | null;
  msrp?: number | null;
  bottling_year?: number | null;

  proof?: number | null;
  age_years?: number | null;
  age_display?: string | null;
  size_ml?: number | null;
  mash_bill?: string | null;

  bottling_strength_type?: string | null;
  spirit_subtype?: string | null;
  spirit_category?: string | null;
  finished_type?: string | null;
  batch_code?: string | null;
  barrel_id?: string | null;

  single_barrel_ind?: boolean | null;
  chill_filtered_ind?: boolean | null;
  finished_ind?: boolean | null;
};

type MasterWhiskeyLibrarySpecsProps = {
  bottle: MasterWhiskeyLibraryBottle;
};

type IconName =
  | "producer"
  | "picker"
  | "msrp"
  | "calendar"
  | "proof"
  | "age"
  | "size"
  | "mash"
  | "strength"
  | "subtype"
  | "finishType"
  | "batch";

export default function MasterWhiskeyLibrarySpecs({
  bottle,
}: MasterWhiskeyLibrarySpecsProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-stone-300 bg-[#12100d] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
      <LibraryHeader />

      <div className="space-y-3 px-4 pb-4 pt-4 md:px-5">
        <div className="grid gap-3 md:grid-cols-4">
          <IdentityCard
            icon="producer"
            label="Producer"
            value={bottle.producer_name ?? "—"}
          />

          <IdentityCard
            icon="picker"
            label="Barrel Picker"
            value={bottle.picker_name ?? "N/A"}
          />

          <IdentityCard
            icon="msrp"
            label="MSRP"
            value={formatMoney(bottle.msrp)}
          />

          <IdentityCard
            icon="calendar"
            label="Bottling Year"
            value={bottle.bottling_year ? String(bottle.bottling_year) : "—"}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <HeroSpecCard
            icon="proof"
            label="Proof"
            value={formatNumber(bottle.proof)}
          />

          <HeroSpecCard
            icon="age"
            label="Age"
            value={bottle.age_display ?? formatAge(bottle.age_years)}
          />

          <HeroSpecCard
            icon="size"
            label="Size"
            value={formatSize(bottle.size_ml)}
          />

          <HeroSpecCard
            icon="mash"
            label="Mash Bill"
            value={bottle.mash_bill ?? "—"}
            allowWrap
          />
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <SecondarySpecCard
            icon="strength"
            label="Strength Type"
            value={bottle.bottling_strength_type ?? "—"}
          />

          <SecondarySpecCard
            icon="subtype"
            label="Subtype"
            value={bottle.spirit_subtype ?? bottle.spirit_category ?? "—"}
          />

          <SecondarySpecCard
            icon="finishType"
            label="Finish Type"
            value={bottle.finished_type ?? "—"}
          />

          <SecondarySpecCard
            icon="batch"
            label="Batch / Barrel"
            value={formatBarrelBatch(bottle.batch_code, bottle.barrel_id)}
          />
        </div>

        <div className="grid overflow-hidden rounded-lg border border-white/15 bg-gradient-to-b from-[#221f1b] to-[#14120f] md:grid-cols-3">
          <StatusCell label="Single Barrel" value={bottle.single_barrel_ind} />
          <StatusCell label="Chill Filtered" value={bottle.chill_filtered_ind} />
          <StatusCell label="Finished" value={bottle.finished_ind} />
        </div>
      </div>
    </section>
  );
}

function LibraryHeader() {
  return (
    <div className="relative border-b border-white/10 bg-gradient-to-b from-[#181612] to-[#0d0c0a] px-4 py-4 text-center">
      <div className="absolute left-6 top-1/2 hidden h-px w-24 bg-gradient-to-r from-transparent via-[#b8893a] to-[#b8893a] md:block" />
      <div className="absolute right-6 top-1/2 hidden h-px w-24 bg-gradient-to-l from-transparent via-[#b8893a] to-[#b8893a] md:block" />

      <div className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#b8893a] bg-[#11100d] text-[#d3a552] shadow-md">
        <LibraryIcon name="batch" className="h-4 w-4" />
      </div>

      <h2 className="font-serif text-xs font-bold uppercase tracking-[0.36em] text-[#d6b26b] md:text-sm">
        Master Whiskey Library
      </h2>

      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-stone-300">
        Specs sourced from the Master Whiskey Library
      </p>
    </div>
  );
}

function IdentityCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/15 bg-gradient-to-b from-[#25221d] to-[#171511] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#c79745]">
          <LibraryIcon name={icon} className="h-7 w-7" />
        </div>

        <div className="min-w-0">
          <div className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">
            {label}
          </div>

          <div className="mt-1 truncate font-serif text-base text-white">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSpecCard({
  icon,
  label,
  value,
  allowWrap = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  allowWrap?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#c99a4a]/45 bg-gradient-to-b from-[#fffdf8] to-[#f7f0e4] px-4 py-5 text-center shadow-[0_5px_12px_rgba(0,0,0,0.13)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#b8893a] bg-white/60 text-[#a8782e] shadow-sm">
        <LibraryIcon name={icon} className="h-6 w-6" />
      </div>

      <div className="mx-auto mt-3 w-fit">
        <div className="font-serif text-[10px] font-bold uppercase tracking-[0.24em] text-stone-800">
          {label}
        </div>
        <div className="mx-auto mt-2 h-px w-12 bg-[#b8893a]" />
        <div className="mx-auto mt-1 h-1 w-1 rotate-45 bg-[#b8893a]" />
      </div>

      <div
        className={`mt-3 font-serif text-2xl font-bold leading-tight text-stone-950 ${
          allowWrap
            ? "whitespace-normal text-xl md:text-2xl"
            : "whitespace-nowrap"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SecondarySpecCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#c99a4a]/35 bg-gradient-to-b from-[#fffdf8] to-[#f5eee2] px-4 py-3 shadow-[0_4px_9px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[#a8782e]">
          <LibraryIcon name={icon} className="h-7 w-7" />
        </div>

        <div className="min-w-0">
          <div className="font-serif text-[10px] font-bold uppercase tracking-[0.18em] text-stone-700">
            {label}
          </div>

          <div className="mt-1 truncate font-serif text-base text-stone-950">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCell({
  label,
  value,
}: {
  label: string;
  value: boolean | null | undefined;
}) {
  const normalized = value === true;
  const known = value !== null && value !== undefined;

  return (
    <div className="border-b border-white/10 px-5 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center justify-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border bg-[#11100d] shadow-inner ${
            !known
              ? "border-stone-500"
              : normalized
                ? "border-emerald-500"
                : "border-red-400"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full ${
              !known
                ? "bg-stone-400"
                : normalized
                  ? "bg-emerald-500"
                  : "bg-red-500"
            }`}
          />
        </div>

        <div>
          <div className="font-serif text-[10px] font-bold uppercase tracking-[0.22em] text-stone-200">
            {label}
          </div>

          <div className="mt-1 font-serif text-base text-white">
            {!known ? "—" : normalized ? "Yes" : "No"}
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const icons: Record<IconName, ReactNode> = {
    producer: (
      <svg {...common}>
        <path d="M8 39h32" />
        <path d="M12 39V19l12-8 12 8v20" />
        <path d="M18 39V26h12v13" />
        <path d="M20 18h8" />
        <path d="M34 16V9h4v10" />
        <path d="M15 23h4M29 23h4" />
      </svg>
    ),
    picker: (
      <svg {...common}>
        <path d="M18 38c-4-3-7-7-7-12a8 8 0 0 1 13-6" />
        <path d="M22 20c1-6 7-9 12-5 4 4 3 11-1 15" />
        <path d="M14 31c6-1 13-2 24 5" />
        <path d="M19 27c3-1 6-1 9 0" />
        <path d="M30 18c-1 4-4 7-8 9" />
      </svg>
    ),
    msrp: (
      <svg {...common}>
        <path d="M8 24 24 8h13v13L21 37 8 24Z" />
        <path d="M31 15h.01" />
        <path d="M24 18c-4 0-6 2-6 5s3 4 6 4 6 1 6 4-2 5-6 5" />
        <path d="M24 16v22" />
      </svg>
    ),
    calendar: (
      <svg {...common}>
        <path d="M13 10v6M35 10v6" />
        <path d="M10 15h28v25H10z" />
        <path d="M10 23h28" />
        <path d="M17 29h.01M24 29h.01M31 29h.01M17 35h.01M24 35h.01" />
      </svg>
    ),
    proof: (
      <svg {...common}>
        <path d="M24 7s-11 13-11 23a11 11 0 0 0 22 0C35 20 24 7 24 7Z" />
        <path d="M19 31a5 5 0 0 0 7 4" />
      </svg>
    ),
    age: (
      <svg {...common}>
        <path d="M16 8h16" />
        <path d="M16 40h16" />
        <path d="M18 8c0 7 12 9 12 16S18 33 18 40" />
        <path d="M30 8c0 7-12 9-12 16s12 9 12 16" />
      </svg>
    ),
    size: (
      <svg {...common}>
        <path d="M20 8h8" />
        <path d="M22 8v9l-5 6v17h14V23l-5-6V8" />
        <path d="M18 28h12" />
        <path d="M20 34h8" />
      </svg>
    ),
    mash: (
      <svg {...common}>
        <path d="M24 40V9" />
        <path d="M24 16c-7 1-10-3-11-8 6 0 10 3 11 8Z" />
        <path d="M24 23c-7 1-10-3-11-8 6 0 10 3 11 8Z" />
        <path d="M24 30c-7 1-10-3-11-8 6 0 10 3 11 8Z" />
        <path d="M24 16c7 1 10-3 11-8-6 0-10 3-11 8Z" />
        <path d="M24 23c7 1 10-3 11-8-6 0-10 3-11 8Z" />
        <path d="M24 30c7 1 10-3 11-8-6 0-10 3-11 8Z" />
      </svg>
    ),
    strength: (
      <svg {...common}>
        <path d="M24 7 39 13v10c0 10-6 17-15 20C15 40 9 33 9 23V13l15-6Z" />
        <path d="M16 22h16" />
        <path d="M24 16v13" />
      </svg>
    ),
    subtype: (
      <svg {...common}>
        <path d="M14 13c6-3 14-3 20 0v22c-6 3-14 3-20 0V13Z" />
        <path d="M14 19c6 3 14 3 20 0" />
        <path d="M14 31c6 3 14 3 20 0" />
        <path d="M24 12v26" />
      </svg>
    ),
    finishType: (
      <svg {...common}>
        <path d="M24 7s-10 11-10 21a10 10 0 0 0 20 0C34 18 24 7 24 7Z" />
        <circle cx="24" cy="29" r="4" />
      </svg>
    ),
    batch: (
      <svg {...common}>
        <path d="M12 22h10v18H12z" />
        <path d="M26 22h10v18H26z" />
        <path d="M19 10h10v12H19z" />
        <path d="M14 18h20" />
        <path d="M12 29h10M26 29h10" />
      </svg>
    ),
  };

  return icons[name];
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

function formatAge(value: number | null | undefined) {
  if (value === null || value === undefined) return "NAS";
  if (value <= 0) return "NAS";
  return `${Number(value).toFixed(1)} yr`;
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `$${Number(value).toFixed(0)}`;
}

function formatSize(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value} ml`;
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