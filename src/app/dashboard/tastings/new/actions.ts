"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function textValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length ? value : null;
}

function numberValue(formData: FormData, name: string) {
  const raw = textValue(formData, name);
  if (!raw) return null;

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function uuidArray(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function addTastingAction(formData: FormData) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();

  const bottleEntryMode =
    textValue(formData, "bottle_entry_mode") ?? "LIBRARY";

  const useGuidedSensoryNotes =
    textValue(formData, "use_guided_sensory_notes") === "true";

  const scoreMethod =
    textValue(formData, "score_method") === "OVERALL"
      ? "OVERALL"
      : "SENSORY";

  const singleBarrelId =
    bottleEntryMode === "NEW"
      ? null
      : textValue(formData, "single_barrel_id");

  if (bottleEntryMode !== "NEW" && !singleBarrelId) {
    throw new Error("Select a bottle record to review.");
  }

  const newBottleDisplayName =
    bottleEntryMode === "NEW"
      ? textValue(formData, "new_bottle_display_name")
      : null;

  const newBottleDetails =
    bottleEntryMode === "NEW"
      ? textValue(formData, "new_bottle_details")
      : null;

  if (bottleEntryMode === "NEW") {
    if (!newBottleDisplayName) {
      throw new Error("Enter a temporary bottle display name.");
    }

    if (!newBottleDetails) {
      throw new Error("Enter the bottle details.");
    }
  }

  const { data, error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_submit_tasting_v2", {
      p_organization_id: member.organization_id,
      p_single_barrel_id: singleBarrelId,
      p_new_bottle_display_name: newBottleDisplayName,
      p_new_bottle_details: newBottleDetails,
      p_guided_sensory_ind: useGuidedSensoryNotes,
      p_tasting_date: new Date().toISOString().slice(0, 10),
      p_tasting_title: null,
      p_tasting_context: null,
      p_score_method: scoreMethod,
      p_entered_overall_score:
        scoreMethod === "OVERALL"
          ? numberValue(formData, "entered_overall_score")
          : null,
      p_nose_score:
        scoreMethod === "SENSORY"
          ? numberValue(formData, "nose_score")
          : null,
      p_palate_score:
        scoreMethod === "SENSORY"
          ? numberValue(formData, "palate_score")
          : null,
      p_finish_score:
        scoreMethod === "SENSORY"
          ? numberValue(formData, "finish_score")
          : null,
      p_nose_notes: textValue(formData, "nose_notes"),
      p_palate_notes: textValue(formData, "palate_notes"),
      p_finish_notes: textValue(formData, "finish_notes"),
      p_overall_notes: textValue(formData, "overall_notes"),
      p_nose_sensory_note_ids: useGuidedSensoryNotes
        ? uuidArray(formData, "nose_sensory_note_ids")
        : [],
      p_palate_sensory_note_ids: useGuidedSensoryNotes
        ? uuidArray(formData, "palate_sensory_note_ids")
        : [],
      p_finish_sensory_note_ids: useGuidedSensoryNotes
        ? uuidArray(formData, "finish_sensory_note_ids")
        : [],
      p_proof_observed: null,
      p_price_paid: null,
      p_tasted_blind: false,
      p_would_rebuy: null,
      p_is_published: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;
  const bottleSlug = result?.bottle_slug
    ? String(result.bottle_slug)
    : null;

  revalidatePath("/");
  revalidatePath("/dashboard");

  if (bottleSlug) {
    redirect(`/${bottleSlug}`);
  }

  redirect("/dashboard?submitted=tasting");
}