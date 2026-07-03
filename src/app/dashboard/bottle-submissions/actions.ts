"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function val(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "").trim();
  return raw.length ? raw : null;
}

function num(formData: FormData, name: string) {
  const raw = val(formData, name);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function intVal(formData: FormData, name: string) {
  const n = num(formData, name);
  return n === null ? null : Math.trunc(n);
}

function boolVal(formData: FormData, name: string, defaultValue = false) {
  const raw = val(formData, name);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return defaultValue;
}

export async function submitBottleAction(formData: FormData) {
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = val(formData, "email_address") ?? user?.email ?? null;

  if (!email) {
    throw new Error("Could not determine the logged-in user's email address.");
  }

  const ig = val(formData, "ig_account");

  const existingDistilleryId = val(formData, "existing_distillery_id");
  const existingBottleId = val(formData, "existing_bottle_id");
  const existingPickerId = val(formData, "existing_barrel_picker_id");
  const barrelType = val(formData, "submitted_bottle_type");

  const newProducerName = val(formData, "distillery_name");
  const brandName = val(formData, "brand_name");
  const spiritCategory = val(formData, "spirit_category");
  const expressionName = val(formData, "expression_name");

  const pickOrBatchName = val(formData, "pick_name");
  const newPickerName = val(formData, "barrel_picker_name");

  if (!existingDistilleryId && !newProducerName) {
    throw new Error(
      "Select an existing producer or provide a new producer name."
    );
  }

  if (
    !existingBottleId &&
    (!brandName || !spiritCategory || !expressionName)
  ) {
    throw new Error(
      "Select an existing bottle or provide brand, category, and expression for a new bottle."
    );
  }

  if (
    (barrelType === "SINGLE_BARREL" || barrelType === "VINTAGE_BATCH") &&
    !pickOrBatchName
  ) {
    throw new Error(
      "A pick name, batch name, or release name is required for single barrel picks and batch details."
    );
  }

  if (barrelType === "SINGLE_BARREL" && !existingPickerId && !newPickerName) {
    throw new Error(
      "A barrel picker is required for single barrel / store pick submissions. Select an existing picker or create a new picker."
    );
  }

  const { data: parent, error: parentError } = await supabase
    .schema("barrel_ledger_public")
    .from("stg_bottle_load_submission")
    .insert({
      organization_id: member.organization_id,
      submitted_by_user_id: member.user_id,
      email_address: email,
      ig_account: ig,
      existing_distillery_id: existingDistilleryId,
      existing_bottle_id: existingBottleId,
      existing_barrel_picker_id: existingPickerId,
      submitted_bottle_type: barrelType,
      submission_status: "PENDING",
    })
    .select("submission_id")
    .single();

  if (parentError) throw new Error(parentError.message);

  const submission_id = parent.submission_id;

  const { error: distilleryError } = await supabase
    .schema("barrel_ledger_public")
    .from("stg_distillery_submission")
    .insert({
      submission_id,
      existing_distillery_id: existingDistilleryId,
      distillery_name: newProducerName,
      country: val(formData, "country"),
      state: val(formData, "state"),
      address_line_1: val(formData, "address_line_1"),
      address_line_2: val(formData, "address_line_2"),
      city: val(formData, "city"),
      postal_code: val(formData, "postal_code"),
      distillery_description: val(formData, "distillery_description"),
      distillery_photo_filename: val(formData, "distillery_photo_filename"),
      latitude: num(formData, "latitude"),
      longitude: num(formData, "longitude"),
      canonical_distillery_name: val(formData, "canonical_distillery_name"),
      submitter_notes: val(formData, "distillery_submitter_notes"),
      email_address: email,
      ig_account: ig,
    });

  if (distilleryError) throw new Error(distilleryError.message);

  const { error: bottleError } = await supabase
    .schema("barrel_ledger_public")
    .from("stg_bottle_submission")
    .insert({
      submission_id,
      existing_bottle_id: existingBottleId,
      existing_distillery_id: existingDistilleryId,
      upc_ean: val(formData, "upc_ean"),
      brand_name: brandName,
      spirit_category: spiritCategory,
      spirit_subtype: val(formData, "spirit_subtype"),
      expression_name: expressionName,
      bottling_strength_type: val(formData, "bottling_strength_type"),
      age_in_month_qty: intVal(formData, "age_in_month_qty"),
      abv: num(formData, "abv"),
      size_ml: intVal(formData, "size_ml"),
      finished_ind: boolVal(formData, "finished_ind", false),
      chill_filtered_ind: boolVal(formData, "chill_filtered_ind", false),
      single_barrel_ind: barrelType === "SINGLE_BARREL",
      mash_bill: val(formData, "mash_bill"),
      finished_type: val(formData, "finished_type"),
      peat_level: val(formData, "peat_level"),
      age_method: val(formData, "age_method"),
      cask_type_primary: val(formData, "cask_type_primary"),
      warehouse: val(formData, "bottle_warehouse"),
      msrp: num(formData, "msrp"),
      submitter_notes: val(formData, "bottle_submitter_notes"),
      email_address: email,
      ig_account: ig,
    });

  if (bottleError) throw new Error(bottleError.message);

  if (barrelType) {
    const { error: sbError } = await supabase
      .schema("barrel_ledger_public")
      .from("stg_single_barrel_submission")
      .insert({
        submission_id,
        existing_bottle_id: existingBottleId,
        existing_barrel_picker_id: existingPickerId,
        bottle_detail_type: barrelType,
        pick_name: pickOrBatchName,
        bottling_year: intVal(formData, "bottling_year"),
        batch_code: val(formData, "batch_code"),
        warehouse: val(formData, "sb_warehouse"),
        cask_strength: boolVal(formData, "cask_strength", false),
        abv_override: num(formData, "abv_override"),
        age_statement_total_months: intVal(
          formData,
          "age_statement_total_months"
        ),
        distilled_state: val(formData, "distilled_state"),
        bottled_state: val(formData, "bottled_state"),
        single_barrel_description: val(
          formData,
          "single_barrel_description"
        ),
        bottle_img_ref: val(formData, "bottle_img_ref"),
        submitter_notes: val(formData, "single_barrel_submitter_notes"),
        email_address: email,
        ig_account: ig,
      });

    if (sbError) throw new Error(sbError.message);
  }

  if (existingPickerId || newPickerName) {
    const { error: pickerError } = await supabase
      .schema("barrel_ledger_public")
      .from("stg_barrel_picker_submission")
      .insert({
        submission_id,
        existing_barrel_picker_id: existingPickerId,
        barrel_picker_name: newPickerName,
        barrel_picker_type: val(formData, "barrel_picker_type"),
        country: val(formData, "picker_country"),
        state: val(formData, "picker_state"),
        city: val(formData, "picker_city"),
        postal_code: val(formData, "picker_postal_code"),
        address_line_1: val(formData, "picker_address_line_1"),
        address_line_2: val(formData, "picker_address_line_2"),
        full_address: val(formData, "full_address"),
        phone_number: val(formData, "phone_number"),
        instagram_url: val(formData, "instagram_url"),
        facebook_url: val(formData, "facebook_url"),
        website_url: val(formData, "website_url"),
        google_maps_url: val(formData, "google_maps_url"),
        notes: val(formData, "picker_notes"),
        barrel_picker_description: val(formData, "barrel_picker_description"),
        submitter_notes: val(formData, "barrel_picker_submitter_notes"),
        email_address: email,
        ig_account: ig,
      });

    if (pickerError) throw new Error(pickerError.message);
  }

  redirect("/dashboard?submitted=bottle");
}