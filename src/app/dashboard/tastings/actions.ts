"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw.length ? raw : null;
}

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) return null;

  const n = Number(raw);

  return Number.isFinite(n) ? n : null;
}

function stringArray(
  formData: FormData,
  fieldName: string
) {
  return Array.from(
    new Set(
      formData
        .getAll(fieldName)
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );
}

export async function addTastingAction(
  formData: FormData
) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();

  const singleBarrelId = textOrNull(
    formData.get("single_barrel_id")
  );

  if (!singleBarrelId) {
    throw new Error(
      "Please select an approved bottle before submitting a tasting."
    );
  }

  const scoreMethod =
    textOrNull(
      formData.get("score_method")
    )?.toUpperCase() ?? "SENSORY";

  if (
    scoreMethod !== "OVERALL" &&
    scoreMethod !== "SENSORY"
  ) {
    throw new Error(
      "Please select a valid scoring method."
    );
  }

  const enteredOverallScore =
    scoreMethod === "OVERALL"
      ? numberOrNull(
          formData.get("entered_overall_score")
        )
      : null;

  const noseScore =
    scoreMethod === "SENSORY"
      ? numberOrNull(formData.get("nose_score"))
      : null;

  const palateScore =
    scoreMethod === "SENSORY"
      ? numberOrNull(formData.get("palate_score"))
      : null;

  const finishScore =
    scoreMethod === "SENSORY"
      ? numberOrNull(formData.get("finish_score"))
      : null;

  if (
    scoreMethod === "OVERALL" &&
    enteredOverallScore === null
  ) {
    throw new Error(
      "Please enter an overall bottle score."
    );
  }

  if (
    scoreMethod === "SENSORY" &&
    (
      noseScore === null ||
      palateScore === null ||
      finishScore === null
    )
  ) {
    throw new Error(
      "Please enter Nose, Palate, and Finish scores."
    );
  }

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_submit_tasting", {
      p_organization_id: member.organization_id,
      p_single_barrel_id: singleBarrelId,

      p_tasting_date: null,
      p_tasting_title: null,
      p_tasting_context: null,

      p_score_method: scoreMethod,
      p_entered_overall_score:
        enteredOverallScore,
      p_nose_score: noseScore,
      p_palate_score: palateScore,
      p_finish_score: finishScore,

      p_nose_notes: textOrNull(
        formData.get("nose_notes")
      ),
      p_palate_notes: textOrNull(
        formData.get("palate_notes")
      ),
      p_finish_notes: textOrNull(
        formData.get("finish_notes")
      ),
      p_overall_notes: textOrNull(
        formData.get("overall_notes")
      ),

      p_nose_sensory_note_ids: stringArray(
        formData,
        "nose_sensory_note_ids"
      ),
      p_palate_sensory_note_ids: stringArray(
        formData,
        "palate_sensory_note_ids"
      ),
      p_finish_sensory_note_ids: stringArray(
        formData,
        "finish_sensory_note_ids"
      ),

      p_proof_observed: null,
      p_price_paid: null,
      p_tasted_blind: false,
      p_would_rebuy: null,
      p_is_published: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}

export async function updateTastingAction(
  formData: FormData
) {
  await requireEditor();

  const supabase =
    await createSupabaseServerClient();

  const tastingId = String(
    formData.get("tasting_id") ?? ""
  ).trim();

  const returnTo = String(
    formData.get("return_to") ?? "/dashboard"
  );

  if (!tastingId) {
    throw new Error("Tasting ID is required.");
  }

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_update_tasting_notes", {
      p_tasting_id: tastingId,
      p_nose_notes: textOrNull(
        formData.get("nose_notes")
      ),
      p_palate_notes: textOrNull(
        formData.get("palate_notes")
      ),
      p_finish_notes: textOrNull(
        formData.get("finish_notes")
      ),
      p_overall_notes: textOrNull(
        formData.get("overall_notes")
      ),
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect(returnTo);
}

export async function hideTastingAction(
  formData: FormData
) {
  await requireEditor();

  const supabase =
    await createSupabaseServerClient();

  const tastingId = String(
    formData.get("tasting_id") ?? ""
  );

  const returnTo = String(
    formData.get("return_to") ?? "/dashboard"
  );

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("hide_tasting_review", {
      p_tasting_id: tastingId,
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect(returnTo);
}