"use client";

import { useEffect, useMemo, useState } from "react";

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

type SubmitBottleFormProps = {
  producers: ProducerOption[];
  bottles: BottleOption[];
  pickers: PickerOption[];
  action: (formData: FormData) => void | Promise<void>;
};

type ProducerMode = "existing" | "new";
type BottleMode = "existing" | "new";
type PickerMode = "none" | "existing" | "new";

export default function SubmitBottleForm({
  producers,
  bottles,
  pickers,
  action,
}: SubmitBottleFormProps) {
  const [producerMode, setProducerMode] = useState<ProducerMode>("existing");
  const [bottleMode, setBottleMode] = useState<BottleMode>("existing");
  const [pickerMode, setPickerMode] = useState<PickerMode>("none");

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

  return (
    <form
      action={action}
      className="space-y-6 rounded-xl border border-stone-300 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="producer_mode" value={producerMode} />
      <input type="hidden" name="bottle_mode" value={isNewBottle ? "new" : "existing"} />
      <input type="hidden" name="picker_mode" value={pickerMode} />

      <FormSection title="Contact">
        <FormField label="Email *">
          <input
            name="email_address"
            type="email"
            required
            className="w-full rounded border border-stone-300 p-2"
          />
        </FormField>
      </FormSection>

      <FormSection
        eyebrow="1"
        title="Producer"
        description="Choose an existing producer or submit a new producer for review."
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
            description="Open producer fields"
          />
        </div>

        {isNewProducer && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <h3 className="mb-3 text-lg font-bold text-stone-950">
              New Producer Details
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Producer Name *">
                <input
                  name="distillery_name"
                  required={isNewProducer}
                  placeholder="Producer Name"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Country">
                <input
                  name="country"
                  placeholder="Country"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="State">
                <input
                  name="state"
                  placeholder="State"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="City">
                <input
                  name="city"
                  placeholder="City"
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

              <FormField label="Postal Code">
                <input
                  name="postal_code"
                  placeholder="Postal Code"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>
            </div>
          </div>
        )}

        {producerMode === "existing" && (
          <button
            type="button"
            onClick={() => setProducerMode("existing")}
            className="hidden"
          >
            Existing Producer
          </button>
        )}
      </FormSection>

      <FormSection
        eyebrow="2"
        title="Bottle"
        description={
          isNewProducer
            ? "Because this is a new producer, this submission will also create a new bottle candidate."
            : "Choose an existing bottle from the selected producer or submit a new bottle."
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
              description="Open bottle fields"
            />
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
            <h3 className="mb-3 text-lg font-bold text-stone-950">
              New Bottle Details
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Brand Name *">
                <input
                  name="brand_name"
                  required={isNewBottle}
                  placeholder="Brand Name"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Expression Name *">
                <input
                  name="expression_name"
                  required={isNewBottle}
                  placeholder="Expression Name"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Spirit Category">
                <input
                  name="spirit_category"
                  placeholder="Bourbon, Rye, American Whiskey..."
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Spirit Subtype">
                <input
                  name="spirit_subtype"
                  placeholder="Tennessee Whiskey, Wheated Bourbon..."
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="ABV">
                <input
                  name="abv"
                  inputMode="decimal"
                  placeholder="ABV, not proof"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="Size ML">
                <input
                  name="size_ml"
                  inputMode="numeric"
                  placeholder="750"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>

              <FormField label="MSRP">
                <input
                  name="msrp"
                  inputMode="decimal"
                  placeholder="90"
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>
            </div>
          </div>
        )}
      </FormSection>

      <FormSection
        eyebrow="3"
        title="Single Barrel / Batch"
        description="This is the lowest-grain bottle detail. Every submission creates a new single barrel, pick, or batch candidate."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Submission Type">
            <select
              name="submitted_bottle_type"
              className="w-full rounded border border-stone-300 bg-white p-2"
            >
              <option value="">Standard Batched Bottle</option>
              <option value="SINGLE_BARREL">Single Barrel / Store Pick</option>
              <option value="VINTAGE_BATCH">Vintage / Batch Detail</option>
            </select>
          </FormField>

          <FormField label="Bottling Year">
            <input
              name="bottling_year"
              inputMode="numeric"
              placeholder="2025"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <FormField label="Pick Name / Batch">
            <input
              name="pick_name"
              placeholder="Pick Name / Batch"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>

          <FormField label="Batch Code / Barrel Details">
            <input
              name="batch_code"
              placeholder="Batch Code / Barrel Details"
              className="w-full rounded border border-stone-300 p-2"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        eyebrow="4"
        title="Barrel Picker"
        description="Default is not a barrel picker. Choose an existing picker or submit a new picker only when needed."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <PickerChoice
            checked={pickerMode === "none"}
            onChange={() => setPickerMode("none")}
            title="Not a Barrel Picker"
            description="No picker attached"
          />

          <PickerChoice
            checked={pickerMode === "existing"}
            onChange={() => setPickerMode("existing")}
            title="Existing Picker"
            description="Use known picker"
          />

          <PickerChoice
            checked={pickerMode === "new"}
            onChange={() => setPickerMode("new")}
            title="New Picker"
            description="Submit picker details"
          />
        </div>

        {isExistingPicker && (
          <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-4">
            <FormField label="Existing Picker">
              <select
                name="existing_barrel_picker_id"
                value={selectedPickerId}
                required={isExistingPicker}
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
            <h3 className="mb-3 text-lg font-bold text-stone-950">
              New Picker Details
            </h3>

            <FormField label="New Barrel Picker Name *">
              <input
                name="barrel_picker_name"
                required={isNewPicker}
                placeholder="New Barrel Picker Name"
                className="mb-3 w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Picker Notes">
              <textarea
                name="barrel_picker_submitter_notes"
                placeholder="Picker notes"
                className="min-h-24 w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>
        )}
      </FormSection>

      <FormSection title="Submitter Notes">
        <textarea
          name="bottle_submitter_notes"
          className="mb-4 min-h-28 w-full rounded border border-stone-300 p-2"
          placeholder="Anything the reviewer should know about this bottle submission."
        />

        <button
          type="submit"
          className="rounded bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-stone-800"
        >
          Submit Bottle for Review
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
  children: React.ReactNode;
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
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`cursor-pointer rounded-lg border p-4 ${
        checked
          ? "border-amber-500 bg-amber-50"
          : "border-stone-300 bg-white hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="picker_mode_radio"
          checked={checked}
          onChange={onChange}
          className="mt-1 h-4 w-4 accent-stone-900"
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