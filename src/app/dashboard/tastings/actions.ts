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

export async function addTastingAction(formData: FormData) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();

  const singleBarrelId = textOrNull(formData.get("single_barrel_id"));

  if (!singleBarrelId) {
    throw new Error("Please select an approved bottle before submitting a tasting.");
  }

  const payload = {
    organization_id: member.organization_id,

    // Keep both for compatibility, but submitted_by_user_id is the required fact_tastings column.
    user_id: member.user_id,
    submitted_by_user_id: member.user_id,

    single_barrel_id: singleBarrelId,
    nose_score: numberOrNull(formData.get("nose_score")),
    palate_score: numberOrNull(formData.get("palate_score")),
    finish_score: numberOrNull(formData.get("finish_score")),
    nose_notes: textOrNull(formData.get("nose_notes")),
    palate_notes: textOrNull(formData.get("palate_notes")),
    finish_notes: textOrNull(formData.get("finish_notes")),
    overall_notes: textOrNull(formData.get("overall_notes")),
  };

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_admin_add_tasting", {
      p_payload: payload,
      p_actor_user_id: member.user_id,
      p_actor_email: member.email,
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}

export async function updateTastingAction(formData: FormData) {
  await requireEditor();

  const supabase = await createSupabaseServerClient();

  const tastingId = String(formData.get("tasting_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/dashboard");

  const noseScore = Number(formData.get("nose_score") ?? "");
  const palateScore = Number(formData.get("palate_score") ?? "");
  const finishScore = Number(formData.get("finish_score") ?? "");

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("update_tasting_review", {
      p_tasting_id: tastingId,
      p_nose_score: Number.isFinite(noseScore) ? noseScore : null,
      p_palate_score: Number.isFinite(palateScore) ? palateScore : null,
      p_finish_score: Number.isFinite(finishScore) ? finishScore : null,
      p_nose_notes: String(formData.get("nose_notes") ?? "").trim() || null,
      p_palate_notes: String(formData.get("palate_notes") ?? "").trim() || null,
      p_finish_notes: String(formData.get("finish_notes") ?? "").trim() || null,
      p_overall_notes: String(formData.get("overall_notes") ?? "").trim() || null,
    });

  if (error) {
    throw new Error(error.message);
  }

  redirect(returnTo);
}

export async function hideTastingAction(formData: FormData) {
  await requireEditor();

  const supabase = await createSupabaseServerClient();

  const tastingId = String(formData.get("tasting_id") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/dashboard");

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