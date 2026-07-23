import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import AddTastingForm from "./AddTastingForm";
import { addTastingAction } from "./actions";

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
  bottle_id: string | null;
  distillery_id: string | null;
  bottle_display_name: string | null;
  producer_name: string | null;
  distillery_name: string | null;
  barrel_picker_id: string | null;
  barrel_picker_name: string | null;
  picker_name: string | null;
  pick_name: string | null;
  batch_code: string | null;
  bottling_year: number | null;
  proof: number | null;
  age_years: number | null;
  is_provisional: boolean | null;
  curation_status: string | null;
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
  const member = await requireEditor();
  const supabase = await createSupabaseServerClient();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const [
    { data: producers, error: producerError },
    { data: bottles, error: bottleError },
    { data: pickers, error: pickerError },
    { data: sensoryNotes, error: sensoryError },
    { data: singleBarrels, error: singleBarrelError },
  ] = await Promise.all([
    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_distillery_options")
      .select("distillery_id, distillery_name")
      .order("distillery_name", { ascending: true }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_bottle_options")
      .select("bottle_id, bottle_display_name, distillery_id")
      .order("bottle_display_name", { ascending: true }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_admin_barrel_picker_options")
      .select("barrel_picker_id, barrel_picker_name")
      .order("barrel_picker_name", { ascending: true }),

    supabase
      .schema("barrel_ledger_public")
      .from("v_sensory_note_selector")
      .select("*")
      .order("sensory_stage", { ascending: true })
      .order("category_display_order", { ascending: true })
      .order("note_display_order", { ascending: true }),

    supabase
      .schema("barrel_ledger_public")
      .rpc("f_get_tasting_bottle_options", {
        p_organization_id: member.organization_id,
      }),
  ]);

  const firstError =
    producerError ??
    bottleError ??
    pickerError ??
    sensoryError ??
    singleBarrelError;

  if (firstError) {
    throw new Error(firstError.message);
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
        <h1 className="text-4xl font-bold text-stone-950">
          Add a Tasting
        </h1>

        <p className="mt-2 mb-6 max-w-3xl leading-7 text-stone-700">
          Choose a bottle, capture your tasting notes using either the
          Organic Narrative or Guided Sensory workflow, and publish the
          review to your BarrelLedger.
        </p>

        <AddTastingForm
          action={addTastingAction}
          producers={(producers ?? []) as ProducerOption[]}
          bottles={(bottles ?? []) as BottleOption[]}
          pickers={(pickers ?? []) as PickerOption[]}
          singleBarrels={(singleBarrels ?? []) as SingleBarrelOption[]}
          sensoryNotes={(sensoryNotes ?? []) as SensoryNoteOption[]}
        />
      </section>
    </main>
  );
}
