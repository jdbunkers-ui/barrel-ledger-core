"use client";

import {
  useMemo,
  useState,
} from "react";

type SensoryStage =
  | "NOSE"
  | "PALATE"
  | "FINISH";

type ScoreMethod =
  | "OVERALL"
  | "SENSORY";

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

type SensoryNoteOption = {
  sensory_stage: SensoryStage;
  sensory_category_id: string;
  category_code: string;
  category_name: string;
  category_description: string | null;
  category_display_order: number;
  sensory_note_id: string;
  sensory_note_code: string;
  sensory_note_name: string;
  sensory_note_description: string | null;
  note_display_order: number;
};

type AddTastingFormProps = {
  producers: ProducerOption[];
  bottles: BottleOption[];
  singleBarrels: SingleBarrelOption[];
  pickers: PickerOption[];
  sensoryNotes: SensoryNoteOption[];
  action: (
    formData: FormData
  ) => void | Promise<void>;
};

type SelectedSensoryNotes = Record<
  SensoryStage,
  string[]
>;

const EMPTY_SELECTIONS: SelectedSensoryNotes = {
  NOSE: [],
  PALATE: [],
  FINISH: [],
};

export default function AddTastingForm({
  producers,
  bottles,
  singleBarrels,
  pickers,
  sensoryNotes,
  action,
}: AddTastingFormProps) {
  const [
    selectedProducerId,
    setSelectedProducerId,
  ] = useState("");

  const [
    selectedBottleId,
    setSelectedBottleId,
  ] = useState("");

  const [
    selectedSingleBarrelFilter,
    setSelectedSingleBarrelFilter,
  ] = useState("");

  const [
    selectedPickerId,
    setSelectedPickerId,
  ] = useState("");

  const [
    selectedReviewTargetId,
    setSelectedReviewTargetId,
  ] = useState("");

  const [
    scoreMethod,
    setScoreMethod,
  ] = useState<ScoreMethod>("SENSORY");

  const [
    selectedSensoryNotes,
    setSelectedSensoryNotes,
  ] = useState<SelectedSensoryNotes>(
    EMPTY_SELECTIONS
  );

  const [
    sensorySearch,
    setSensorySearch,
  ] = useState<
    Record<SensoryStage, string>
  >({
    NOSE: "",
    PALATE: "",
    FINISH: "",
  });

  const filteredBottles = useMemo(() => {
    if (!selectedProducerId) return [];

    return bottles.filter(
      (bottle) =>
        String(
          bottle.distillery_id ?? ""
        ) === selectedProducerId
    );
  }, [
    bottles,
    selectedProducerId,
  ]);

  const bottleFilteredTargets =
    useMemo(() => {
      if (!selectedBottleId) return [];

      return singleBarrels.filter(
        (row) =>
          Boolean(row.bottle_id) &&
          String(row.bottle_id) ===
            selectedBottleId
      );
    }, [
      singleBarrels,
      selectedBottleId,
    ]);

  const availableSingleBarrelFilters =
    useMemo(() => {
      const seen = new Map<
        string,
        string
      >();

      bottleFilteredTargets.forEach(
        (row) => {
          const label =
            formatSingleBarrelLabel(row);

          if (
            !seen.has(
              row.single_barrel_id
            )
          ) {
            seen.set(
              row.single_barrel_id,
              label
            );
          }
        }
      );

      return Array.from(
        seen.entries()
      ).map(([id, label]) => ({
        id,
        label,
      }));
    }, [bottleFilteredTargets]);

  const filteredReviewTargets =
    useMemo(() => {
      return bottleFilteredTargets.filter(
        (row) => {
          const matchesSingleBarrel =
            !selectedSingleBarrelFilter ||
            row.single_barrel_id ===
              selectedSingleBarrelFilter;

          const matchesPicker =
            !selectedPickerId ||
            String(
              row.barrel_picker_id ?? ""
            ) === selectedPickerId;

          return (
            matchesSingleBarrel &&
            matchesPicker
          );
        }
      );
    }, [
      bottleFilteredTargets,
      selectedSingleBarrelFilter,
      selectedPickerId,
    ]);

  function handleProducerChange(
    value: string
  ) {
    setSelectedProducerId(value);
    setSelectedBottleId("");
    setSelectedSingleBarrelFilter("");
    setSelectedPickerId("");
    setSelectedReviewTargetId("");
  }

  function handleBottleChange(
    value: string
  ) {
    setSelectedBottleId(value);
    setSelectedSingleBarrelFilter("");
    setSelectedPickerId("");
    setSelectedReviewTargetId("");
  }

  function handleSingleBarrelFilterChange(
    value: string
  ) {
    setSelectedSingleBarrelFilter(value);
    setSelectedReviewTargetId("");
  }

  function handlePickerChange(
    value: string
  ) {
    setSelectedPickerId(value);
    setSelectedReviewTargetId("");
  }

  function toggleSensoryNote(
    stage: SensoryStage,
    sensoryNoteId: string
  ) {
    setSelectedSensoryNotes(
      (current) => {
        const currentStage =
          current[stage];

        const isSelected =
          currentStage.includes(
            sensoryNoteId
          );

        return {
          ...current,
          [stage]: isSelected
            ? currentStage.filter(
                (id) =>
                  id !==
                  sensoryNoteId
              )
            : [
                ...currentStage,
                sensoryNoteId,
              ],
        };
      }
    );
  }

  function clearSensoryStage(
    stage: SensoryStage
  ) {
    setSelectedSensoryNotes(
      (current) => ({
        ...current,
        [stage]: [],
      })
    );
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

      {selectedSensoryNotes.NOSE.map(
        (noteId) => (
          <input
            key={`nose-${noteId}`}
            type="hidden"
            name="nose_sensory_note_ids"
            value={noteId}
          />
        )
      )}

      {selectedSensoryNotes.PALATE.map(
        (noteId) => (
          <input
            key={`palate-${noteId}`}
            type="hidden"
            name="palate_sensory_note_ids"
            value={noteId}
          />
        )
      )}

      {selectedSensoryNotes.FINISH.map(
        (noteId) => (
          <input
            key={`finish-${noteId}`}
            type="hidden"
            name="finish_sensory_note_ids"
            value={noteId}
          />
        )
      )}

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-stone-950">
            Master Whiskey Library
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Select a producer and bottle
            first. Optional filters can
            narrow the list by single
            barrel, batch, or barrel
            picker. Then choose the exact
            bottle record to review.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Producer *">
            <select
              value={selectedProducerId}
              required
              onChange={(event) =>
                handleProducerChange(
                  event.target.value
                )
              }
              className="w-full rounded border border-stone-300 bg-white p-2"
            >
              <option value="">
                Select Producer
              </option>

              {producers.map(
                (producer) => (
                  <option
                    key={
                      producer.distillery_id
                    }
                    value={
                      producer.distillery_id
                    }
                  >
                    {producer.distillery_name ??
                      "Unnamed Producer"}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField label="Bottle *">
            <select
              value={selectedBottleId}
              required
              disabled={
                !selectedProducerId
              }
              onChange={(event) =>
                handleBottleChange(
                  event.target.value
                )
              }
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedProducerId
                  ? "Select Producer First"
                  : filteredBottles.length ===
                      0
                    ? "No Bottles Found for Producer"
                    : "Select Bottle"}
              </option>

              {filteredBottles.map(
                (bottle) => (
                  <option
                    key={bottle.bottle_id}
                    value={bottle.bottle_id}
                  >
                    {bottle.bottle_display_name ??
                      "Unnamed Bottle"}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField label="Single Barrel / Batch">
            <select
              value={
                selectedSingleBarrelFilter
              }
              disabled={
                !selectedBottleId
              }
              onChange={(event) =>
                handleSingleBarrelFilterChange(
                  event.target.value
                )
              }
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedBottleId
                  ? "Select Bottle First"
                  : "All Single Barrels / Batches"}
              </option>

              {availableSingleBarrelFilters.map(
                (option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </FormField>

          <FormField label="Barrel Picker">
            <select
              value={selectedPickerId}
              disabled={
                !selectedBottleId
              }
              onChange={(event) =>
                handlePickerChange(
                  event.target.value
                )
              }
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <option value="">
                {!selectedBottleId
                  ? "Select Bottle First"
                  : "All Pickers"}
              </option>

              {pickers.map(
                (picker) => (
                  <option
                    key={
                      picker.barrel_picker_id
                    }
                    value={
                      picker.barrel_picker_id
                    }
                  >
                    {picker.barrel_picker_name ??
                      "Unnamed Picker"}
                  </option>
                )
              )}
            </select>
          </FormField>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-stone-950">
            Select Bottle Record to Review
          </h3>

          {!selectedProducerId ||
          !selectedBottleId ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              Select a producer and bottle
              to see available Master
              Whiskey Library records.
            </div>
          ) : filteredReviewTargets.length ===
            0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
              No approved bottle records
              match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviewTargets.map(
                (target) => (
                  <label
                    key={
                      target.single_barrel_id
                    }
                    className={`block cursor-pointer rounded-lg border p-4 transition ${
                      selectedReviewTargetId ===
                      target.single_barrel_id
                        ? "border-amber-500 bg-amber-50"
                        : "border-stone-300 bg-white hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="selected_single_barrel_radio"
                        checked={
                          selectedReviewTargetId ===
                          target.single_barrel_id
                        }
                        onChange={() =>
                          setSelectedReviewTargetId(
                            target.single_barrel_id
                          )
                        }
                        className="mt-1 h-4 w-4 accent-stone-900"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-stone-950">
                          {target.bottle_display_name ??
                            "Unnamed Bottle"}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
                          <span>
                            <span className="font-semibold">
                              Producer:
                            </span>{" "}
                            {target.producer_name ??
                              target.distillery_name ??
                              "—"}
                          </span>

                          <span>
                            <span className="font-semibold">
                              Pick / Batch:
                            </span>{" "}
                            {formatSingleBarrelLabel(
                              target
                            )}
                          </span>

                          <span>
                            <span className="font-semibold">
                              Picker:
                            </span>{" "}
                            {target.barrel_picker_name ??
                              target.picker_name ??
                              "N/A"}
                          </span>

                          {target.proof !==
                            null &&
                            target.proof !==
                              undefined && (
                              <span>
                                <span className="font-semibold">
                                  Proof:
                                </span>{" "}
                                {Number(
                                  target.proof
                                ).toFixed(1)}
                              </span>
                            )}

                          {target.bottling_year && (
                            <span>
                              <span className="font-semibold">
                                Bottling Year:
                              </span>{" "}
                              {
                                target.bottling_year
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-stone-950">
            Tasting Scores
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Enter one overall bottle score,
            or score the Nose, Palate, and
            Finish individually.
          </p>
        </div>

        <input
          type="hidden"
          name="score_method"
          value={scoreMethod}
        />

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setScoreMethod("OVERALL")
            }
            aria-pressed={
              scoreMethod === "OVERALL"
            }
            className={`rounded-lg border p-4 text-left transition ${
              scoreMethod === "OVERALL"
                ? "border-amber-500 bg-amber-50"
                : "border-stone-300 bg-white hover:bg-stone-50"
            }`}
          >
            <span className="block font-bold text-stone-950">
              Overall Bottle Score
            </span>

            <span className="mt-1 block text-sm text-stone-600">
              Enter one score for the
              entire tasting.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setScoreMethod("SENSORY")
            }
            aria-pressed={
              scoreMethod === "SENSORY"
            }
            className={`rounded-lg border p-4 text-left transition ${
              scoreMethod === "SENSORY"
                ? "border-amber-500 bg-amber-50"
                : "border-stone-300 bg-white hover:bg-stone-50"
            }`}
          >
            <span className="block font-bold text-stone-950">
              Sensory Scores
            </span>

            <span className="mt-1 block text-sm text-stone-600">
              Score Nose, Palate, and
              Finish separately.
            </span>
          </button>
        </div>

        {scoreMethod === "OVERALL" ? (
          <div className="max-w-sm">
            <FormField label="Overall Bottle Score *">
              <input
                name="entered_overall_score"
                type="number"
                required
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Nose Score *">
              <input
                name="nose_score"
                type="number"
                required
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Palate Score *">
              <input
                name="palate_score"
                type="number"
                required
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Finish Score *">
              <input
                name="finish_score"
                type="number"
                required
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-stone-950">
            Tasting Notes
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Select any notes you identify.
            Barrel Ledger will build a
            simple review sentence when
            the corresponding text field is
            left blank. You may also type
            your own notes directly.
          </p>
        </div>

        <div className="space-y-8">
          <SensoryStageSelector
            stage="NOSE"
            stageLabel="Nose"
            sensoryNotes={sensoryNotes}
            selectedIds={
              selectedSensoryNotes.NOSE
            }
            searchValue={
              sensorySearch.NOSE
            }
            onSearchChange={(value) =>
              setSensorySearch(
                (current) => ({
                  ...current,
                  NOSE: value,
                })
              )
            }
            onToggle={(noteId) =>
              toggleSensoryNote(
                "NOSE",
                noteId
              )
            }
            onClear={() =>
              clearSensoryStage("NOSE")
            }
          />

          <FormField label="Nose Notes">
            <textarea
              name="nose_notes"
              placeholder="Leave blank to build a simple sentence from the selected Nose notes, or write your own review."
              className="min-h-28 w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <SensoryStageSelector
            stage="PALATE"
            stageLabel="Palate"
            sensoryNotes={sensoryNotes}
            selectedIds={
              selectedSensoryNotes.PALATE
            }
            searchValue={
              sensorySearch.PALATE
            }
            onSearchChange={(value) =>
              setSensorySearch(
                (current) => ({
                  ...current,
                  PALATE: value,
                })
              )
            }
            onToggle={(noteId) =>
              toggleSensoryNote(
                "PALATE",
                noteId
              )
            }
            onClear={() =>
              clearSensoryStage("PALATE")
            }
          />

          <FormField label="Palate Notes">
            <textarea
              name="palate_notes"
              placeholder="Leave blank to build a simple sentence from the selected Palate notes, or write your own review."
              className="min-h-28 w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <SensoryStageSelector
            stage="FINISH"
            stageLabel="Finish"
            sensoryNotes={sensoryNotes}
            selectedIds={
              selectedSensoryNotes.FINISH
            }
            searchValue={
              sensorySearch.FINISH
            }
            onSearchChange={(value) =>
              setSensorySearch(
                (current) => ({
                  ...current,
                  FINISH: value,
                })
              )
            }
            onToggle={(noteId) =>
              toggleSensoryNote(
                "FINISH",
                noteId
              )
            }
            onClear={() =>
              clearSensoryStage("FINISH")
            }
          />

          <FormField label="Finish Notes">
            <textarea
              name="finish_notes"
              placeholder="Leave blank to build a simple sentence from the selected Finish notes, or write your own review."
              className="min-h-28 w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <FormField label="Overall Notes">
            <textarea
              name="overall_notes"
              placeholder="Add your overall assessment of the bottle."
              className="min-h-28 w-full rounded border border-stone-300 p-2"
            />
          </FormField>
        </div>

        <button
          type="submit"
          disabled={
            !selectedReviewTargetId
          }
          className="mt-8 rounded bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          Save Tasting
        </button>
      </section>
    </form>
  );
}

function SensoryStageSelector({
  stage,
  stageLabel,
  sensoryNotes,
  selectedIds,
  searchValue,
  onSearchChange,
  onToggle,
  onClear,
}: {
  stage: SensoryStage;
  stageLabel: string;
  sensoryNotes: SensoryNoteOption[];
  selectedIds: string[];
  searchValue: string;
  onSearchChange: (
    value: string
  ) => void;
  onToggle: (
    sensoryNoteId: string
  ) => void;
  onClear: () => void;
}) {
  const stageNotes = useMemo(
    () =>
      sensoryNotes.filter(
        (note) =>
          note.sensory_stage === stage
      ),
    [sensoryNotes, stage]
  );

  const groupedNotes = useMemo(() => {
    const normalizedSearch =
      searchValue
        .trim()
        .toLowerCase();

    const filteredNotes =
      normalizedSearch.length === 0
        ? stageNotes
        : stageNotes.filter(
            (note) =>
              note.sensory_note_name
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              note.category_name
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              String(
                note.sensory_note_description ??
                  ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );

    const categoryMap = new Map<
      string,
      {
        categoryCode: string;
        categoryName: string;
        categoryDescription:
          | string
          | null;
        categoryDisplayOrder: number;
        notes: SensoryNoteOption[];
      }
    >();

    filteredNotes.forEach((note) => {
      const existing =
        categoryMap.get(
          note.category_code
        );

      if (existing) {
        existing.notes.push(note);
        return;
      }

      categoryMap.set(
        note.category_code,
        {
          categoryCode:
            note.category_code,
          categoryName:
            note.category_name,
          categoryDescription:
            note.category_description,
          categoryDisplayOrder:
            note.category_display_order,
          notes: [note],
        }
      );
    });

    return Array.from(
      categoryMap.values()
    )
      .sort(
        (a, b) =>
          a.categoryDisplayOrder -
          b.categoryDisplayOrder
      )
      .map((category) => ({
        ...category,
        notes: category.notes.sort(
          (a, b) =>
            a.note_display_order -
              b.note_display_order ||
            a.sensory_note_name.localeCompare(
              b.sensory_note_name
            ),
        ),
      }));
  }, [
    stageNotes,
    searchValue,
  ]);

  const selectedNotes = useMemo(
    () =>
      stageNotes
        .filter((note) =>
          selectedIds.includes(
            note.sensory_note_id
          )
        )
        .sort(
          (a, b) =>
            a.category_display_order -
              b.category_display_order ||
            a.note_display_order -
              b.note_display_order
        ),
    [stageNotes, selectedIds]
  );

  return (
    <div className="rounded-lg border border-stone-300 bg-stone-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-stone-950">
            {stageLabel} Sensory Notes
          </h3>

          <p className="mt-1 text-sm text-stone-600">
            Select as many notes as
            apply.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold text-stone-700">
            {selectedIds.length} selected
          </span>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-semibold text-stone-700 underline hover:text-stone-950"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {selectedNotes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedNotes.map(
            (note) => (
              <button
                key={
                  note.sensory_note_id
                }
                type="button"
                onClick={() =>
                  onToggle(
                    note.sensory_note_id
                  )
                }
                className="rounded-full border border-amber-500 bg-amber-100 px-3 py-1 text-sm font-semibold text-stone-900"
                title={`Remove ${note.sensory_note_name}`}
              >
                {note.sensory_note_name} ×
              </button>
            )
          )}
        </div>
      )}

      <div className="mt-4">
        <input
          type="search"
          value={searchValue}
          onChange={(event) =>
            onSearchChange(
              event.target.value
            )
          }
          placeholder={`Search ${stageLabel.toLowerCase()} notes`}
          className="w-full rounded border border-stone-300 bg-white p-2"
        />
      </div>

      <div className="mt-4 space-y-3">
        {groupedNotes.length === 0 ? (
          <div className="rounded border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-600">
            No sensory notes match your
            search.
          </div>
        ) : (
          groupedNotes.map(
            (category) => {
              const selectedCount =
                category.notes.filter(
                  (note) =>
                    selectedIds.includes(
                      note.sensory_note_id
                    )
                ).length;

              return (
                <details
                  key={
                    category.categoryCode
                  }
                  open={
                    category.categoryDisplayOrder ===
                      10 ||
                    selectedCount > 0 ||
                    Boolean(
                      searchValue.trim()
                    )
                  }
                  className="rounded-lg border border-stone-200 bg-white"
                >
                  <summary className="cursor-pointer list-none px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-stone-950">
                          {
                            category.categoryName
                          }
                        </span>

                        {category.categoryDescription && (
                          <p className="mt-1 text-xs leading-5 text-stone-500">
                            {
                              category.categoryDescription
                            }
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                        {selectedCount} /{" "}
                        {
                          category.notes
                            .length
                        }
                      </span>
                    </div>
                  </summary>

                  <div className="border-t border-stone-200 p-4">
                    <div className="flex flex-wrap gap-2">
                      {category.notes.map(
                        (note) => {
                          const isSelected =
                            selectedIds.includes(
                              note.sensory_note_id
                            );

                          return (
                            <button
                              key={
                                note.sensory_note_id
                              }
                              type="button"
                              aria-pressed={
                                isSelected
                              }
                              onClick={() =>
                                onToggle(
                                  note.sensory_note_id
                                )
                              }
                              title={
                                note.sensory_note_description ??
                                note.sensory_note_name
                              }
                              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                isSelected
                                  ? "border-amber-500 bg-amber-100 text-stone-950"
                                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              <span
                                className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border text-xs ${
                                  isSelected
                                    ? "border-amber-600 bg-amber-600 text-white"
                                    : "border-stone-400 bg-white"
                                }`}
                              >
                                {isSelected
                                  ? "✓"
                                  : ""}
                              </span>

                              {
                                note.sensory_note_name
                              }
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </details>
              );
            }
          )
        )}
      </div>
    </div>
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
      <span className="mb-1 block font-semibold text-stone-900">
        {label}
      </span>

      {children}
    </label>
  );
}

function formatSingleBarrelLabel(
  row: SingleBarrelOption
) {
  const parts = [
    row.pick_name,
    row.batch_code,
    row.bottling_year
      ? String(row.bottling_year)
      : null,
  ]
    .map((part) =>
      String(part ?? "").trim()
    )
    .filter(Boolean);

  if (parts.length === 0) {
    return "Standard Bottle";
  }

  return parts.join(" / ");
}