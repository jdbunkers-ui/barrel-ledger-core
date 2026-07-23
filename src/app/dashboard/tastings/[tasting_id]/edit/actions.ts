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

async function getBottleSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  tastingId: string
) {
  const { data } = await supabase
    .schema("barrel_ledger_public")
    .from("v_reviews_v2")
    .select("bottle_slug")
    .eq("tasting_id", tastingId)
    .maybeSingle();

  return data?.bottle_slug ? String(data.bottle_slug) : null;
}

export async function updateTastingAction(formData: FormData) {
  await requireEditor();
  const supabase = await createSupabaseServerClient();

  const tastingId = textValue(formData, "tasting_id");
  const scoreMethod = textValue(formData, "score_method");

  if (!tastingId) {
    throw new Error("Tasting ID is required.");
  }

  if (scoreMethod !== "OVERALL" && scoreMethod !== "SENSORY") {
    throw new Error("Invalid score method.");
  }

  const bottleSlug = await getBottleSlug(supabase, tastingId);

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_update_tasting_review", {
      p_tasting_id: tastingId,
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
      p_youtube_url: textValue(formData, "youtube_url"),
      p_instagram_url: textValue(formData, "instagram_url"),
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tastings/${tastingId}/edit`);

  if (bottleSlug) {
    revalidatePath(`/${bottleSlug}`);
  }

  redirect(`/dashboard/tastings/${tastingId}/edit?saved=1`);
}

export async function hideTastingAction(formData: FormData) {
  await requireEditor();
  const supabase = await createSupabaseServerClient();

  const tastingId = textValue(formData, "tasting_id");

  if (!tastingId) {
    throw new Error("Tasting ID is required.");
  }

  const bottleSlug = await getBottleSlug(supabase, tastingId);

  const { error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_hide_own_tasting", {
      p_tasting_id: tastingId,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");

  if (bottleSlug) {
    revalidatePath(`/${bottleSlug}`);
  }

  redirect("/dashboard?hidden=tasting");
}