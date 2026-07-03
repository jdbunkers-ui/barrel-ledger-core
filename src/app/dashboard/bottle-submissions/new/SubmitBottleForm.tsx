"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type ProducerOption = {
  distillery_id: string;
  distillery_name: string | null;
};

type BottleDetailSubmissionRequirement =
  | "NONE"
  | "BATCH_REQUIRED"
  | "SINGLE_BARREL_REQUIRED";

type BottleOption = {
  bottle_id: string;
  bottle_display_name: string | null;
  distillery_id: string | null;
  detail_submission_requirement: BottleDetailSubmissionRequirement | null;
};

type PickerOption = {
  barrel_picker_id: string;
  barrel_picker_name: string | null;
};

type SubmitBottleFormProps = {
  producers: ProducerOption[];
  bottles: BottleOption[];
  pickers: PickerOption[];
  action: (formData: FormData) => void | Promise<void>;
};

type ProducerMode = "existing" | "new";
type BottleMode = "existing" | "new";
type PickerMode = "none" | "existing" | "new";

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "Scotland",
  "Ireland",
  "Japan",
  "Mexico",
  "England",
  "Wales",
  "Australia",
  "Other",
];

const STATE_OPTIONS = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Missouri",
  "New Jersey",
  "New York",
  "North Carolina",
  "Ohio",
  "Pennsylvania",
  "Tennessee",
  "Texas",
  "Virginia",
  "Washington",
  "Wisconsin",
  "Other",
];

const SPIRIT_CATEGORY_OPTIONS = [
  "Bourbon",
  "Rye",
  "American Whiskey",
  "Tennessee Whiskey",
  "Wheat Whiskey",
  "Malt Whiskey",
  "Scotch Whisky",
  "Irish Whiskey",
  "Canadian Whisky",
  "Japanese Whisky",
  "Other Whiskey",
];

const SPIRIT_SUBTYPE_OPTIONS = [
  "Straight Bourbon",
  "Kentucky Straight Bourbon",
  "Bottled-in-Bond Bourbon",
  "Wheated Bourbon",
  "High Rye Bourbon",
  "Finished Bourbon",
  "Single Barrel Bourbon",
  "Small Batch Bourbon",
  "Straight Rye",
  "Bottled-in-Bond Rye",
  "Single Barrel Rye",
  "Barrel Proof",
  "Cask Strength",
  "Finished Whiskey",
  "Tennessee Whiskey",
  "American Single Malt",
  "Other",
];

const BOTTLING_STRENGTH_OPTIONS = [
  "Standard Proof",
  "Barrel Proof",
  "Cask Strength",
  "Full Proof",
  "Bottled-in-Bond",
  "Single Barrel",
  "Small Batch",
  "Other",
];

const PICKER_TYPE_OPTIONS = [
  "Liquor Store",
  "Bourbon Club",
  "Restaurant / Bar",
  "Retail Group",
  "Private Group",
  "Distillery",
  "Other",
];

export default function SubmitBottleForm({
  producers,
  bottles,
  pickers,
  action,
}: SubmitBottleFormProps) {
  const [producerMode, setProducerMode] = useState<ProducerMode>("existing");
  const [bottleMode, setBottleMode] = useState<BottleMode>("existing");
  const [pickerMode, setPickerMode] = useState<PickerMode>("none");
  const [submissionType, setSubmissionType] = useState("");

  const [selectedProducerId, setSelectedProducerId] = useState("");
  const [selectedBottleId, setSelectedBottleId] = useState("");
  const [selectedPickerId, setSelectedPickerId] = useState("");

  const isNewProducer = producerMode === "new";
  const isNewBottle = isNewProducer || bottleMode === "new";
  const isExistingBottle = !isNewProducer && bottleMode === "existing";
  const isExistingPicker = pickerMode === "existing";
  const isNewPicker = pickerMode === "new";

  const filteredBottles = useMemo(() => {
    if (!selectedProducerId) return [];

    return bottles.filter(
      (bottle) => String(bottle.distillery_id ?? "") === selectedProducerId
    );
  }, [bottles, selectedProducerId]);

  const selectedBottle = useMemo(() => {
    if (!selectedBottleId) return null;

    return (
      bottles.find((bottle) => bottle.bottle_id === selectedBottleId) ?? null
    );
  }, [bottles, selectedBottleId]);

  const selectedBottleDetailRequirement =
    selectedBottle?.detail_submission_requirement ?? "NONE";

  const selectedBottleForcesBatchDetail =
    isExistingBottle &&
    selectedBottleDetailRequirement === "BATCH_REQUIRED";

  const selectedBottleForcesSingleBarrelDetail =
    isExistingBottle &&
    selectedBottleDetailRequirement === "SINGLE_BARREL_REQUIRED";

  const selectedBottleForcesDetail =
    selectedBottleForcesBatchDetail || selectedBottleForcesSingleBarrelDetail;

  const isSingleBarrelSubmission = submissionType === "SINGLE_BARREL";
  const isBatchSubmission = submissionType === "VINTAGE_BATCH";
  const requiresPickOrBatchName = isSingleBarrelSubmission || isBatchSubmission;

  useEffect(() => {
    if (producerMode === "new") {
      setBottleMode("new");
      setSelectedProducerId("");
      setSelectedBottleId("");
    }
  }, [producerMode]);

  useEffect(() => {
    setSelectedBottleId("");
  }, [selectedProducerId, bottleMode]);

  useEffect(() => {
    if (pickerMode !== "existing") {
      setSelectedPickerId("");
    }
  }, [pickerMode]);

  useEffect(() => {
    if (!isExistingBottle || !selectedBottle) return;

    if (selectedBottleDetailRequirement === "BATCH_REQUIRED") {
      setSubmissionType("VINTAGE_BATCH");
      return;
    }

    if (selectedBottleDetailRequirement === "SINGLE_BARREL_REQUIRED") {
      setSubmissionType("SINGLE_BARREL");

      if (pickerMode === "none") {
        setPickerMode("existing");
      }

      return;
    }

    setSubmissionType("");
  }, [
    isExistingBottle,
    selectedBottle,
    selectedBottleDetailRequirement,
    pickerMode,
  ]);

  useEffect(() => {
    if (isSingleBarrelSubmission && pickerMode === "none") {
      setPickerMode("existing");
    }
  }, [isSingleBarrelSubmission, pickerMode]);

  function useExistingProducerInstead() {
    setProducerMode("existing");
    setBottleMode("existing");
    setSubmissionType("");
    setSelectedBottleId("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    if (requiresPickOrBatchName) {
      const pickName = String(formData.get("pick_name") ?? "").trim();

      if (!pickName) {
        event.preventDefault();
        alert(
          isSingleBarrelSubmission
            ? "Please enter a pick name for this single barrel / store pick."
            : "Please enter a batch name or release name for this batch detail."
        );
        return;
      }
    }

    if (isSingleBarrelSubmission) {
      const existingPickerId = String(
        formData.get("existing_barrel_picker_id") ?? ""
      ).trim();
      const newPickerName = String(
        formData.get("barrel_picker_name") ?? ""
      ).trim();

      if (!existingPickerId && !newPickerName) {
        event.preventDefault();
        alert(
          "Please select an existing barrel picker or create a new barrel picker for this single barrel / store pick."
        );
      }
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-stone-300 bg-white p-6 shadow-sm"
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-stone-800">
        <p className="font-semibold text-stone-950">This should be quick.</p>
        <p className="mt-1">
          Only a few fields are required. Add what you know and leave the rest
          blank. We will clean up and enrich the submission before adding it to
          the Master Whiskey Library.
        </p>
      </div>

      <input type="hidden" name="producer_mode" value={producerMode} />
      <input
        type="hidden"
        name="bottle_mode"
        value={isNewBottle ? "new" : "existing"}
      />
      <input type="hidden" name="picker_mode" value={pickerMode} />

      {selectedBottleForcesDetail && (
        <input
          type="hidden"
          name="submitted_bottle_type"
          value={submissionType}
        />
      )}

      <FormSection
        eyebrow="1"
        title="Producer"
        description="Select the producer. If it is not listed, add only the producer name."
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <FormField label="Existing Producer">
            <select
              name="existing_distillery_id"
              value={selectedProducerId}
              disabled={isNewProducer}
              required={!isNewProducer}
              onChange={(event) => setSelectedProducerId(event.target.value)}
              className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
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

          <RadioCard
            name="producer_mode_radio"
            checked={producerMode === "new"}
            onChange={() => setProducerMode("new")}
            title="New Producer"
            description="Producer is not listed"
          />
        </div>

        {isNewProducer && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-950">
                  New Producer
                </h3>
                <p className="mt-1 text-sm text-stone-600">
                  Only the producer name is required.
                </p>
              </div>

              <button
                type="button"
                onClick={useExistingProducerInstead}
                className="rounded border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100"
              >
                Use existing producer instead
              </button>
            </div>

            <FormField label="Producer Name *" hint="Example: Heaven Hill">
              <input
                name="distillery_name"
                required={isNewProducer}
                placeholder="Producer Name"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <details className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold text-stone-900">
                Optional producer details
              </summary>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <FormField
                  label="Canonical Producer Name"
                  hint="Example: Jack Daniel Distillery"
                >
                  <input
                    name="canonical_distillery_name"
                    placeholder="Canonical Producer Name"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Country">
                  <SelectWithOptions
                    name="country"
                    placeholder="Select Country"
                    options={COUNTRY_OPTIONS}
                  />
                </FormField>

                <FormField label="State">
                  <SelectWithOptions
                    name="state"
                    placeholder="Select State"
                    options={STATE_OPTIONS}
                  />
                </FormField>

                <FormField label="City" hint="Example: Bardstown">
                  <input
                    name="city"
                    placeholder="City"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Postal Code">
                  <input
                    name="postal_code"
                    placeholder="Postal Code"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Address Line 1">
                  <input
                    name="address_line_1"
                    placeholder="Address Line 1"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Address Line 2">
                  <input
                    name="address_line_2"
                    placeholder="Address Line 2"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Latitude">
                  <input
                    name="latitude"
                    inputMode="decimal"
                    placeholder="37.8092"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Longitude">
                  <input
                    name="longitude"
                    inputMode="decimal"
                    placeholder="-85.4669"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Producer Photo Filename">
                  <input
                    name="distillery_photo_filename"
                    placeholder="producer-photo.jpg"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>
              </div>

              <div className="mt-3 grid gap-3">
                <FormField label="Producer Description">
                  <textarea
                    name="distillery_description"
                    placeholder="Short producer description"
                    className="min-h-24 w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Producer Submitter Notes">
                  <textarea
                    name="distillery_submitter_notes"
                    placeholder="Anything the admin should know about this producer."
                    className="min-h-20 w-full rounded border border-stone-300 p-2"
                  />
                </FormField>
              </div>
            </details>
          </div>
        )}
      </FormSection>

      <FormSection
        eyebrow="2"
        title="Bottle"
        description={
          isNewProducer
            ? "Because this is a new producer, enter the minimum bottle details."
            : "Select an existing bottle or add the minimum details for a new bottle."
        }
      >
        {!isNewProducer && (
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <FormField label="Existing Bottle">
              <select
                name="existing_bottle_id"
                value={selectedBottleId}
                disabled={!selectedProducerId || isNewBottle}
                required={isExistingBottle}
                onChange={(event) => setSelectedBottleId(event.target.value)}
                className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-400"
              >
                <option value="">
                  {!selectedProducerId
                    ? "Select Producer First"
                    : filteredBottles.length === 0
                      ? "No Existing Bottles for Producer"
                      : "Select Bottle"}
                </option>

                {filteredBottles.map((bottle) => (
                  <option key={bottle.bottle_id} value={bottle.bottle_id}>
                    {bottle.bottle_display_name ?? "Unnamed Bottle"}
                  </option>
                ))}
              </select>
            </FormField>

            <RadioCard
              name="bottle_mode_radio"
              checked={bottleMode === "new"}
              onChange={() => setBottleMode("new")}
              title="New Bottle"
              description="Bottle is not listed"
            />
          </div>
        )}

        {selectedBottleForcesBatchDetail && (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-stone-800">
            This bottle requires a specific batch or annual release. Step 3 has
            been set to <span className="font-semibold">Vintage / Batch Detail</span>.
          </div>
        )}

        {selectedBottleForcesSingleBarrelDetail && (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-stone-800">
            This bottle requires a specific single barrel or store pick. Step 3
            has been set to{" "}
            <span className="font-semibold">Single Barrel / Store Pick</span>.
          </div>
        )}

        {!isNewProducer && bottleMode === "new" && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setBottleMode("existing")}
              className="text-sm font-semibold text-stone-700 underline hover:text-stone-950"
            >
              Use existing bottle instead
            </button>
          </div>
        )}

        {isNewBottle && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <h3 className="mb-1 text-lg font-bold text-stone-950">
              New Bottle
            </h3>
            <p className="mb-4 text-sm text-stone-600">
              Only brand, expression, and category are required.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Brand Name *" hint="Example: Elijah Craig">
                <input
                  name="brand_name"
                  required={isNewBottle}
                  placeholder="Brand Name"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField
                label="Expression Name *"
                hint="Example: Barrel Proof, Lost Recipe Small Batch"
              >
                <input
                  name="expression_name"
                  required={isNewBottle}
                  placeholder="Expression Name"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Spirit Category *">
                <SelectWithOptions
                  name="spirit_category"
                  placeholder="Select Category"
                  options={SPIRIT_CATEGORY_OPTIONS}
                  required={isNewBottle}
                />
              </FormField>
            </div>

            <details className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold text-stone-900">
                Optional bottle details
              </summary>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <FormField label="Spirit Subtype">
                  <SelectWithOptions
                    name="spirit_subtype"
                    placeholder="Select Subtype"
                    options={SPIRIT_SUBTYPE_OPTIONS}
                  />
                </FormField>

                <FormField label="Bottling Strength Type">
                  <SelectWithOptions
                    name="bottling_strength_type"
                    placeholder="Select Strength Type"
                    options={BOTTLING_STRENGTH_OPTIONS}
                  />
                </FormField>

                <FormField
                  label="Age in Months"
                  hint="Example: 120 for 10 years"
                >
                  <input
                    name="age_in_month_qty"
                    inputMode="numeric"
                    placeholder="120"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField
                  label="ABV"
                  hint="Enter ABV, not proof. Example: 55.45"
                >
                  <input
                    name="abv"
                    inputMode="decimal"
                    placeholder="55.45"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Size ML">
                  <SelectWithOptions
                    name="size_ml"
                    placeholder="Select Size"
                    options={["375", "500", "700", "750", "1000", "1750"]}
                  />
                </FormField>

                <FormField label="MSRP" hint="Example: 69.99">
                  <input
                    name="msrp"
                    inputMode="decimal"
                    placeholder="69.99"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="UPC / EAN">
                  <input
                    name="upc_ean"
                    placeholder="UPC / EAN"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Finished?">
                  <BooleanSelect name="finished_ind" />
                </FormField>

                <FormField label="Chill Filtered?">
                  <BooleanSelect name="chill_filtered_ind" />
                </FormField>

                <FormField
                  label="Mash Bill"
                  hint="Example: 72% corn, 18% rye, 10% malted barley"
                >
                  <input
                    name="mash_bill"
                    placeholder="Mash Bill"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Finished Type">
                  <input
                    name="finished_type"
                    placeholder="Toasted oak, port wine barrel, cognac barrel"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Primary Cask Type">
                  <input
                    name="cask_type_primary"
                    placeholder="New charred oak"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Bottle Warehouse">
                  <input
                    name="bottle_warehouse"
                    placeholder="Warehouse / Rickhouse"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>
              </div>
            </details>
          </div>
        )}
      </FormSection>

      <FormSection
        eyebrow="3"
        title="Bottle Detail Type"
        description={
          selectedBottleForcesDetail
            ? "This bottle requires detail-level information before it can be submitted."
            : "Leave this as standard unless you are submitting a specific batch, annual release, single barrel, or store pick."
        }
      >
        <FormField label="Submission Type">
          <select
            name={
              selectedBottleForcesDetail
                ? "submitted_bottle_type_display"
                : "submitted_bottle_type"
            }
            value={submissionType}
            disabled={selectedBottleForcesDetail}
            onChange={(event) => {
              const nextSubmissionType = event.target.value;
              setSubmissionType(nextSubmissionType);

              if (
                nextSubmissionType === "SINGLE_BARREL" &&
                pickerMode === "none"
              ) {
                setPickerMode("existing");
              }
            }}
            className="w-full rounded border border-stone-300 bg-white p-2 disabled:bg-stone-100 disabled:text-stone-500"
          >
            <option value="">Standard Batched Bottle</option>
            <option value="SINGLE_BARREL">Single Barrel / Store Pick</option>
            <option value="VINTAGE_BATCH">Vintage / Batch Detail</option>
          </select>
        </FormField>

        <details
          open={requiresPickOrBatchName}
          className="mt-4 rounded-lg border border-stone-200 bg-white p-4"
        >
          <summary className="cursor-pointer font-semibold text-stone-900">
            {requiresPickOrBatchName
              ? "Required batch / single barrel details"
              : "Optional batch / single barrel details"}
          </summary>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <FormField
              label={
                isSingleBarrelSubmission
                  ? "Pick Name *"
                  : isBatchSubmission
                    ? "Batch / Release Name *"
                    : "Pick Name / Release Name"
              }
              hint={
                isSingleBarrelSubmission
                  ? "Required. Example: Bottle King Wayne NJ Pick"
                  : isBatchSubmission
                    ? "Required. Example: Batch 4, 2025 Release, B523"
                    : "Optional unless this is a single barrel pick or batch detail."
              }
            >
              <input
                name="pick_name"
                required={requiresPickOrBatchName}
                placeholder={
                  isSingleBarrelSubmission
                    ? "Bottle King Wayne NJ Pick"
                    : isBatchSubmission
                      ? "Batch 4, 2025 Release, B523"
                      : "Bottle King Wayne NJ Pick, Batch 4, 2025 Release"
                }
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Batch Code / Barrel Details">
              <input
                name="batch_code"
                placeholder="B523, A124, Barrel 25-05185"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Bottling Year">
              <input
                name="bottling_year"
                inputMode="numeric"
                placeholder="2025"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Warehouse">
              <input
                name="sb_warehouse"
                placeholder="Warehouse / Rickhouse"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Cask Strength?">
              <BooleanSelect name="cask_strength" />
            </FormField>

            <FormField label="ABV Override">
              <input
                name="abv_override"
                inputMode="decimal"
                placeholder="66.3"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Age Statement Total Months">
              <input
                name="age_statement_total_months"
                inputMode="numeric"
                placeholder="120"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Distilled State">
              <SelectWithOptions
                name="distilled_state"
                placeholder="Select State"
                options={STATE_OPTIONS}
              />
            </FormField>

            <FormField label="Bottled State">
              <SelectWithOptions
                name="bottled_state"
                placeholder="Select State"
                options={STATE_OPTIONS}
              />
            </FormField>

            <FormField label="Bottle Image Reference">
              <input
                name="bottle_img_ref"
                placeholder="Bottle image URL or filename"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>

          <div className="mt-3">
            <FormField label="Single Barrel / Batch Description">
              <textarea
                name="single_barrel_description"
                placeholder="Store pick from Bottle King Wayne NJ; Batch 4 release."
                className="min-h-24 w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>
        </details>
      </FormSection>

      <FormSection
        eyebrow="4"
        title="Barrel Picker"
        description={
          isSingleBarrelSubmission
            ? "Required for single barrel / store pick submissions. Select an existing picker or create a new picker."
            : "Only use this if the bottle is a store pick, club pick, or selected by a known picker."
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <PickerChoice
            checked={pickerMode === "none"}
            onChange={() => {
              if (!isSingleBarrelSubmission) {
                setPickerMode("none");
              }
            }}
            title="No Picker"
            description={
              isSingleBarrelSubmission
                ? "Not available for single barrel picks"
                : "Most submissions"
            }
            disabled={isSingleBarrelSubmission}
          />

          <PickerChoice
            checked={pickerMode === "existing"}
            onChange={() => setPickerMode("existing")}
            title="Existing Picker"
            description="Picker is listed"
          />

          <PickerChoice
            checked={pickerMode === "new"}
            onChange={() => setPickerMode("new")}
            title="New Picker"
            description="Picker is not listed"
          />
        </div>

        {isExistingPicker && (
          <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <FormField label="Existing Picker">
              <select
                name="existing_barrel_picker_id"
                value={selectedPickerId}
                required={isSingleBarrelSubmission && isExistingPicker}
                onChange={(event) => setSelectedPickerId(event.target.value)}
                className="w-full rounded border border-stone-300 bg-white p-2"
              >
                <option value="">Select Picker</option>
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
        )}

        {isNewPicker && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <FormField
              label={
                isSingleBarrelSubmission
                  ? "New Barrel Picker Name *"
                  : "New Barrel Picker Name"
              }
              hint="Example: Bottle King Wayne NJ"
            >
              <input
                name="barrel_picker_name"
                required={isSingleBarrelSubmission && isNewPicker}
                placeholder="New Barrel Picker Name"
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <details className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold text-stone-900">
                Optional picker details
              </summary>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <FormField label="Picker Type">
                  <SelectWithOptions
                    name="barrel_picker_type"
                    placeholder="Select Picker Type"
                    options={PICKER_TYPE_OPTIONS}
                  />
                </FormField>

                <FormField label="Country">
                  <SelectWithOptions
                    name="picker_country"
                    placeholder="Select Country"
                    options={COUNTRY_OPTIONS}
                  />
                </FormField>

                <FormField label="State">
                  <SelectWithOptions
                    name="picker_state"
                    placeholder="Select State"
                    options={STATE_OPTIONS}
                  />
                </FormField>

                <FormField label="City">
                  <input
                    name="picker_city"
                    placeholder="City"
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Website URL">
                  <input
                    name="website_url"
                    placeholder="https://..."
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Instagram URL">
                  <input
                    name="instagram_url"
                    placeholder="https://instagram.com/..."
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Facebook URL">
                  <input
                    name="facebook_url"
                    placeholder="https://facebook.com/..."
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>

                <FormField label="Google Maps URL">
                  <input
                    name="google_maps_url"
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded border border-stone-300 p-2"
                  />
                </FormField>
              </div>

              <div className="mt-3">
                <FormField label="Picker Description">
                  <textarea
                    name="barrel_picker_description"
                    placeholder="Short description of the picker."
                    className="min-h-24 w-full rounded border border-stone-300 p-2"
                  />
                </FormField>
              </div>
            </details>
          </div>
        )}
      </FormSection>

      <FormSection title="Notes">
        <FormField
          label="Submission Notes"
          hint="Optional. Add anything that will help us clean up this bottle."
        >
          <textarea
            name="bottle_submitter_notes"
            className="min-h-28 w-full rounded border border-stone-300 p-2"
            placeholder="Example: This is Batch 4, 97 proof, released in 2025."
          />
        </FormField>

        <button
          type="submit"
          className="mt-4 rounded bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-stone-800"
        >
          Submit Bottle
        </button>
      </FormSection>
    </form>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-stone-950">
          {eyebrow ? `${eyebrow}. ${title}` : title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-stone-600">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold text-stone-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

function SelectWithOptions({
  name,
  placeholder,
  options,
  required = false,
}: {
  name: string;
  placeholder: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <select
      name={name}
      required={required}
      className="w-full rounded border border-stone-300 bg-white p-2"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function BooleanSelect({ name }: { name: string }) {
  return (
    <select
      name={name}
      defaultValue=""
      className="w-full rounded border border-stone-300 bg-white p-2"
    >
      <option value="">Unknown / Not Sure</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
}

function RadioCard({
  name,
  checked,
  onChange,
  title,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex min-w-48 cursor-pointer items-center gap-3 rounded-lg border p-3 ${
        checked
          ? "border-amber-500 bg-amber-50"
          : "border-stone-300 bg-white hover:bg-stone-50"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-stone-900"
      />

      <span>
        <span className="block font-bold text-stone-950">{title}</span>
        <span className="block text-xs text-stone-600">{description}</span>
      </span>
    </label>
  );
}

function PickerChoice({
  checked,
  onChange,
  title,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border p-4 ${
        disabled
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : checked
            ? "border-amber-500 bg-amber-50"
            : "border-stone-300 bg-white hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="picker_mode_radio"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="mt-1 h-4 w-4 accent-stone-900 disabled:accent-stone-300"
        />

        <span>
          <span className="block font-bold text-stone-950">{title}</span>
          <span className="mt-1 block text-sm text-stone-600">
            {description}
          </span>
        </span>
      </div>
    </label>
  );
}