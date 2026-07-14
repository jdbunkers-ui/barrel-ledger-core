import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import { addTastingAction } from "../actions";
import AddTastingForm from "./AddTastingForm";

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
  sensory_stage: "NOSE" | "PALATE" | "FINISH";
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

export default async function AddTastingPage() {
  await requireEditor();

  const supabase = await createSupabaseServerClient();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const { data: producers, error: producersError } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_distillery_options")
    .select("distillery_id, distillery_name")
    .order("distillery_name", { ascending: true });

  if (producersError) {
    throw new Error(
      `Unable to load producers: ${producersError.message}`
    );
  }

  const { data: bottles, error: bottlesError } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_bottle_options")
    .select("bottle_id, bottle_display_name, distillery_id")
    .order("bottle_display_name", { ascending: true });

  if (bottlesError) {
    throw new Error(
      `Unable to load bottles: ${bottlesError.message}`
    );
  }

  const { data: pickers, error: pickersError } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_barrel_picker_options")
    .select("barrel_picker_id, barrel_picker_name")
    .order("barrel_picker_name", { ascending: true });

  if (pickersError) {
    throw new Error(
      `Unable to load barrel pickers: ${pickersError.message}`
    );
  }

  const { data: singleBarrels, error: singleBarrelsError } =
    await supabase
      .schema("barrel_ledger_public")
      .from("v_admin_single_barrel_options")
      .select("*")
      .order("bottle_display_name", { ascending: true });

  if (singleBarrelsError) {
    throw new Error(
      `Unable to load bottle records: ${singleBarrelsError.message}`
    );
  }

  const { data: sensoryNotes, error: sensoryNotesError } =
    await supabase
      .schema("barrel_ledger_public")
      .from("v_sensory_note_selector")
      .select(
        `
          sensory_stage,
          sensory_category_id,
          category_code,
          category_name,
          category_description,
          category_display_order,
          sensory_note_id,
          sensory_note_code,
          sensory_note_name,
          sensory_note_description,
          note_display_order
        `
      )
      .order("category_display_order", { ascending: true })
      .order("note_display_order", { ascending: true });

  if (sensoryNotesError) {
    throw new Error(
      `Unable to load sensory notes: ${sensoryNotesError.message}`
    );
  }

  return (
    <main className="min-h-screen bg-stone-100">
      {site && (
        <CustomerHeader
          siteTitle={site.site_title}
          siteSubtitle={site.site_subtitle}
          logoUrl={site.logo_url}
          bannerUrl={site.banner_url}
          primaryColor={site.primary_color}
        />
      )}

      <Navigation />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-2 text-4xl font-bold text-stone-950">
          Add a Tasting
        </h1>

        <p className="mb-6 text-stone-700">
          Search and select an approved bottle from the Master Whiskey
          Library, then add scores and tasting notes. Pending bottle
          submissions cannot be reviewed until approved.
        </p>

        <AddTastingForm
          action={addTastingAction}
          producers={(producers ?? []) as ProducerOption[]}
          bottles={(bottles ?? []) as BottleOption[]}
          pickers={(pickers ?? []) as PickerOption[]}
          singleBarrels={
            (singleBarrels ?? []) as SingleBarrelOption[]
          }
          sensoryNotes={
            (sensoryNotes ?? []) as SensoryNoteOption[]
          }
        />
      </section>
    </main>
  );
}