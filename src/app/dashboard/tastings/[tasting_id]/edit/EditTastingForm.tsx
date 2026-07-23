"use client";

type EditableTasting = {
  tasting_id: string;
  score_method: "OVERALL" | "SENSORY";
  entered_overall_score: number | null;
  nose_score: number | null;
  palate_score: number | null;
  finish_score: number | null;
  composite_score: number | null;
  nose_notes: string | null;
  palate_notes: string | null;
  finish_notes: string | null;
  overall_notes: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
};

type EditTastingFormProps = {
  tasting: EditableTasting;
  updateAction: (formData: FormData) => void | Promise<void>;
  hideAction: (formData: FormData) => void | Promise<void>;
};

export default function EditTastingForm({
  tasting,
  updateAction,
  hideAction,
}: EditTastingFormProps) {
  return (
    <div className="space-y-6">
      <form
        action={updateAction}
        className="space-y-6 rounded-xl border border-stone-300 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="tasting_id" value={tasting.tasting_id} />
        <input type="hidden" name="score_method" value={tasting.score_method} />

        <section>
          <h2 className="text-2xl font-bold text-stone-950">
            Tasting Scores
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            The scoring method remains unchanged. Saving will recalculate the
            composite score automatically.
          </p>

          {tasting.score_method === "OVERALL" ? (
            <div className="mt-4 max-w-sm">
              <FormField label="Overall Bottle Score *">
                <input
                  name="entered_overall_score"
                  type="number"
                  required
                  step="0.1"
                  min="0"
                  max="10"
                  defaultValue={tasting.entered_overall_score ?? ""}
                  className="w-full rounded border border-stone-300 p-2"
                />
              </FormField>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <ScoreInput
                name="nose_score"
                label="Nose Score *"
                defaultValue={tasting.nose_score}
              />
              <ScoreInput
                name="palate_score"
                label="Palate Score *"
                defaultValue={tasting.palate_score}
              />
              <ScoreInput
                name="finish_score"
                label="Finish Score *"
                defaultValue={tasting.finish_score}
              />
            </div>
          )}

          <div className="mt-4 rounded-lg bg-stone-100 p-4 text-sm text-stone-700">
            Current calculated final score:{" "}
            <span className="font-bold">
              {formatScore(tasting.composite_score)}
            </span>
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6">
          <h2 className="text-2xl font-bold text-stone-950">
            Written Review
          </h2>

          <div className="mt-4 space-y-4">
            <NoteField
              name="nose_notes"
              label="Nose Notes"
              defaultValue={tasting.nose_notes}
            />
            <NoteField
              name="palate_notes"
              label="Palate Notes"
              defaultValue={tasting.palate_notes}
            />
            <NoteField
              name="finish_notes"
              label="Finish Notes"
              defaultValue={tasting.finish_notes}
            />
            <NoteField
              name="overall_notes"
              label="Overall Notes"
              defaultValue={tasting.overall_notes}
            />
          </div>
        </section>

        <section className="border-t border-stone-200 pt-6">
          <h2 className="text-2xl font-bold text-stone-950">
            External Review Links
          </h2>

          <p className="mt-1 text-sm leading-6 text-stone-600">
            Add the original YouTube video or Instagram post. Clear a field
            and save to remove that link from the public bottle page.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="YouTube Video URL">
              <input
                name="youtube_url"
                type="url"
                inputMode="url"
                defaultValue={tasting.youtube_url ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>

            <FormField label="Instagram Post URL">
              <input
                name="instagram_url"
                type="url"
                inputMode="url"
                defaultValue={tasting.instagram_url ?? ""}
                placeholder="https://www.instagram.com/p/..."
                className="w-full rounded border border-stone-300 p-2"
              />
            </FormField>
          </div>
        </section>

        <button
          type="submit"
          className="rounded bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-stone-800"
        >
          Save Changes
        </button>
      </form>

      <form
        action={hideAction}
        className="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <input type="hidden" name="tasting_id" value={tasting.tasting_id} />

        <h2 className="text-xl font-bold text-red-900">
          Hide This Review
        </h2>

        <p className="mt-1 text-sm leading-6 text-red-800">
          This removes the review from the public BarrelLedger without
          permanently deleting the database record.
        </p>

        <button
          type="submit"
          onClick={(event) => {
            if (!window.confirm("Hide this review from the public site?")) {
              event.preventDefault();
            }
          }}
          className="mt-4 rounded border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 hover:bg-red-100"
        >
          Hide This Review
        </button>
      </form>
    </div>
  );
}

function ScoreInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
}) {
  return (
    <FormField label={label}>
      <input
        name={name}
        type="number"
        required
        step="0.1"
        min="0"
        max="10"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded border border-stone-300 p-2"
      />
    </FormField>
  );
}

function NoteField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <FormField label={label}>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        className="min-h-28 w-full rounded border border-stone-300 p-2"
      />
    </FormField>
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

function formatScore(value: number | null) {
  return value === null || value === undefined ? "—" : value.toFixed(2);
}
