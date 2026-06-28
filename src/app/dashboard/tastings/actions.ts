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
  if (!singleBarrelId) throw new Error("Please select an approved bottle before submitting a tasting.");
 
  const payload = {
    organization_id: member.organization_id,
    user_id: member.user_id,
    single_barrel_id: singleBarrelId,
    nose_score: numberOrNull(formData.get("nose_score")),
    palate_score: numberOrNull(formData.get("palate_score")),
    finish_score: numberOrNull(formData.get("finish_score")),
    nose_notes: textOrNull(formData.get("nose_notes")),
    palate_notes: textOrNull(formData.get("palate_notes")),
    finish_notes: textOrNull(formData.get("finish_notes")),
    overall_notes: textOrNull(formData.get("overall_notes")),
  };
 
  const { error } = await supabase.rpc("f_admin_add_tasting", {
    p_payload: payload,
    p_actor_user_id: member.user_id,
    p_actor_email: member.email,
  });
 
  if (error) throw new Error(error.message);
  redirect("/");
}
 
export async function updateTastingAction(formData: FormData) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const tastingId = textOrNull(formData.get("tasting_id"));
  if (!tastingId) throw new Error("Missing tasting_id.");
 
  const patch = {
    nose_score: numberOrNull(formData.get("nose_score")),
    palate_score: numberOrNull(formData.get("palate_score")),
    finish_score: numberOrNull(formData.get("finish_score")),
    nose_notes: textOrNull(formData.get("nose_notes")),
    palate_notes: textOrNull(formData.get("palate_notes")),
    finish_notes: textOrNull(formData.get("finish_notes")),
    overall_notes: textOrNull(formData.get("overall_notes")),
  };
 
  const { error } = await supabase.rpc("f_admin_update_tasting", {
    p_tasting_id: tastingId,
    p_patch: patch,
    p_actor_user_id: member.user_id,
    p_actor_email: member.email,
  });
 
  if (error) throw new Error(error.message);
  redirect("/");
}
 
export async function hideTastingAction(formData: FormData) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();
  const tastingId = textOrNull(formData.get("tasting_id"));
  if (!tastingId) throw new Error("Missing tasting_id.");
 
  const { error } = await supabase.rpc("f_admin_hide_tasting", {
    p_tasting_id: tastingId,
    p_actor_user_id: member.user_id,
    p_actor_email: member.email,
  });
 
  if (error) throw new Error(error.message);
  redirect("/");
}