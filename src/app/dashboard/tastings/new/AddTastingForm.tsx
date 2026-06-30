"use client";

import { useMemo, useState } from "react";

type ProducerOption = {
  distillery_id: string;
  distillery_name: string | null;
};

type BottleOption = {
  bottle_id: string;
  bottle_display_name: string | null;
  distillery_id: string | null;
};

type PickerOption = {
  barrel_picker_id: string;
  barrel_picker_name: string | null;
};

type SingleBarrelOption = {
  single_barrel_id: string;
  bottle_id?: string | null;
  distillery_id?: string | null;
  bottle_display_name?: string | null;
  producer_name?: string | null;
  distillery_name?: string | null;
  barrel_picker_id?: string | null;
  barrel_picker_name?: string | null;
  picker_name?: string | null;
  pick_name?: string | null;
  batch_code?: string | null;
  bottling_year?: number | null;
  proof?: number | null;
  age_years?: number | null;
};

type AddTastingFormProps = {
  producers: ProducerOption[];
  bottles: BottleOption[];
  singleBarrels: SingleBarrelOption[];
  pickers: PickerOption[];
  action: (formData: FormData) => void | Promise<void>;
};

export default function AddTastingForm({
  producers,
  bottles,
  singleBarrels,
  pickers,
  action,
}: AddTastingFormProps) {
  const [selectedProducerId, setSelectedProducerId] = useState("");
  const [selectedBottleId, setSelectedBottleId] = useState("");
  const [selectedSingleBarrelFilter, setSelectedSingleBarrelFilter] =
    useState("");
  const [selectedPickerId, setSelectedPickerId] = useState("");
  const [selectedReviewTargetId, setSelectedReviewTargetId] = useState("");

  const filteredBottles = useMemo(() => {
    if (!selectedProducerId) return [];

    return bottles.filter(
      (bottle) => String(bottle.distillery_id ?? "") === selectedProducerId
    );
  }, [bottles, selectedProducerId]);

  const bottleFilteredTargets = useMemo(() => {
    if (!selectedBottleId) return [];

    return singleBarrels.filter((row) => {
      if (row.bottle_id) {
        return String(row.bottle_id) === selectedBottleId;
      }

      return false;
    });
  }, [singleBarrels, selectedBottleId]);

  const availableSingleBarrelFilters = useMemo(() => {
    const seen = new Map<string, string>();

    bottleFilteredTargets.forEach((row) => {
      const label = formatSingleBarrelLabel(row);

      if (!seen.has(row.single_barrel_id)) {
        seen.set(row.single_barrel_id, label);
      }
    });

    return Array.from(seen.entries()).map(([id, label]) => ({
      id,
      label,
    }));
  }, [bottleFilteredTargets]);

  const filteredReviewTargets = useMemo(() => {
    return bottleFilteredTargets.filter((row) => {
      const matchesSingleBarrel =
        !selectedSingleBarrelFilter ||
        row.single_barrel_id === selectedSingleBarrelFilter;

      const matchesPicker =
        !selectedPickerId ||
        String(row.barrel_picker_id ?? "") === selectedPickerId;

      return matchesSingleBarrel && matchesPicker;
    });
  }, [bottleFilteredTargets, selectedSingleBarrelFilter, selectedPickerId]);

  function handleProducerChange(value: string) {
    setSelectedProducerId(value);
    setSelectedBottleId("");
    setSelectedSingleBarrelFilter("");
    setSelectedPickerId("");
    setSelectedReviewTargetId("");
  }

  function handleBottleChange(value: string) {
    setSelectedBottleId(value);
    setSelectedSingleBarrelFilter("");
    setSelectedPickerId("");
    setSelectedReviewTargetId("");
  }

  function handleSingleBarrelFilterChange(value: string) {
    setSelectedSingleBarrelFilter(value);
    setSelectedReviewTargetId("");
  }

  function handlePickerChange(value: string) {
    setSelectedPickerId(value);
    setSelectedReviewTargetId("");
  }

  return (
    <form
      action={action}
      className="space-y-6 rounded-xl border border-stone-300 bg-white p-6 shadow-sm"
    >
      <input
        type="hidden"
        name="single_barrel_id"
        value={selectedReviewTargetId}
      />

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-stone-950">
            Master Whiskey Library
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Select a producer and bottle first. Optional filters can narrow the
            list by single barrel, batch, or barrel picker. Then choose the exact
            bottle record to review.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Producer *">
            <select
              value={selectedProducerId}
              required
              onChange={(event) => handleProducerChange(event.target.value)}
              className="w-full rounded border border-stone-300 bg-white p-2"
            >
              <option value="">Select Producer</option>
              {producers.map((producer) => (
                <option
                  key={producer.distillery_id}
                  value={producer.distillery_id}
                >
                  {producer.distillery_name ?? "Unnamed Producer"}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Bottle *">
            <select
              value={selectedBottleId}
              required
              disabled={!selectedProducerId}
              onChange={(event) => handleBottleChange(event.target.value)}
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedProducerId
                  ? "Select Producer First"
                  : filteredBottles.length === 0
                    ? "No Bottles Found for Producer"
                    : "Select Bottle"}
              </option>

              {filteredBottles.map((bottle) => (
                <option key={bottle.bottle_id} value={bottle.bottle_id}>
                  {bottle.bottle_display_name ?? "Unnamed Bottle"}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Single Barrel / Batch">
            <select
              value={selectedSingleBarrelFilter}
              disabled={!selectedBottleId}
              onChange={(event) =>
                handleSingleBarrelFilterChange(event.target.value)
              }
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedBottleId
                  ? "Select Bottle First"
                  : "All Single Barrels / Batches"}
              </option>

              {availableSingleBarrelFilters.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Barrel Picker">
            <select
              value={selectedPickerId}
              disabled={!selectedBottleId}
              onChange={(event) => handlePickerChange(event.target.value)}
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedBottleId ? "Select Bottle First" : "All Pickers"}
              </option>

              {pickers.map((picker) => (
                <option
                  key={picker.barrel_picker_id}
                  value={picker.barrel_picker_id}
                >
                  {picker.barrel_picker_name ?? "Unnamed Picker"}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-stone-950">
            Select Bottle Record to Review
          </h3>

          {!selectedProducerId || !selectedBottleId ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              Select a producer and bottle to see available Master Whiskey
              Library records.
            </div>
          ) : filteredReviewTargets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              No approved bottle records match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviewTargets.map((target) => (
                <label
                  key={target.single_barrel_id}
                  className={`block cursor-pointer rounded-lg border p-4 transition ${
                    selectedReviewTargetId === target.single_barrel_id
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-300 bg-white hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="selected_single_barrel_radio"
                      checked={selectedReviewTargetId === target.single_barrel_id}
                      onChange={() =>
                        setSelectedReviewTargetId(target.single_barrel_id)
                      }
                      className="mt-1 h-4 w-4 accent-stone-900"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-stone-950">
                        {target.bottle_display_name ?? "Unnamed Bottle"}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
                        <span>
                          <span className="font-semibold">Producer:</span>{" "}
                          {target.producer_name ??
                            target.distillery_name ??
                            "—"}
                        </span>

                        <span>
                          <span className="font-semibold">Pick / Batch:</span>{" "}
                          {formatSingleBarrelLabel(target)}
                        </span>

                        <span>
                          <span className="font-semibold">Picker:</span>{" "}
                          {target.barrel_picker_name ??
                            target.picker_name ??
                            "N/A"}
                        </span>

                        {target.proof !== null &&
                          target.proof !== undefined && (
                            <span>
                              <span className="font-semibold">Proof:</span>{" "}
                              {Number(target.proof).toFixed(1)}
                            </span>
                          )}

                        {target.bottling_year && (
                          <span>
                            <span className="font-semibold">
                              Bottling Year:
                            </span>{" "}
                            {target.bottling_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-2xl font-bold text-stone-950">
          Tasting Scores
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Nose Score">
            <input
              name="nose_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <FormField label="Palate Score">
            <input
              name="palate_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <FormField label="Finish Score">
            <input
              name="finish_score"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-2xl font-bold text-stone-950">
          Tasting Notes
        </h2>

        <FormField label="Nose Notes">
          <textarea
            name="nose_notes"
            className="mb-4 min-h-24 w-full rounded border border-stone-300 p-2"
          />
        </FormField>

        <FormField label="Palate Notes">
          <textarea
            name="palate_notes"
            className="mb-4 min-h-24 w-full rounded border border-stone-300 p-2"
          />
        </FormField>

        <FormField label="Finish Notes">
          <textarea
            name="finish_notes"
            className="mb-4 min-h-24 w-full rounded border border-stone-300 p-2"
          />
        </FormField>

        <FormField label="Overall Notes">
          <textarea
            name="overall_notes"
            className="mb-6 min-h-24 w-full rounded border border-stone-300 p-2"
          />
        </FormField>

        <button
          type="submit"
          disabled={!selectedReviewTargetId}
          className="rounded bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          Save Tasting
        </button>
      </section>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold text-stone-900">{label}</span>
      {children}
    </label>
  );
}

function formatSingleBarrelLabel(row: SingleBarrelOption) {
  const parts = [
    row.pick_name,
    row.batch_code,
    row.bottling_year ? String(row.bottling_year) : null,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "Standard Bottle";
  }

  return parts.join(" / ");
}