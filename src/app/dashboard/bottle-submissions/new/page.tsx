import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import { submitBottleAction } from "../actions";
import SubmitBottleForm from "./SubmitBottleForm";

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

export default async function SubmitBottlePage() {
  await requireEditor();

  const supabase = await createSupabaseServerClient();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const { data: distilleries } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_distillery_options")
    .select("distillery_id, distillery_name")
    .order("distillery_name", { ascending: true });

  const { data: bottles } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_bottle_options")
    .select("bottle_id, bottle_display_name, distillery_id")
    .order("bottle_display_name", { ascending: true });

  const { data: pickers } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_barrel_picker_options")
    .select("barrel_picker_id, barrel_picker_name")
    .order("barrel_picker_name", { ascending: true });

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

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 text-4xl font-bold text-stone-950">
          Submit a Bottle
        </h1>

        <p className="mb-6 text-stone-700">
          This lands in staging for Master Whiskey Library review. It does not
          become available for tastings until approved.
        </p>

        <SubmitBottleForm
          action={submitBottleAction}
          producers={(distilleries ?? []) as ProducerOption[]}
          bottles={(bottles ?? []) as BottleOption[]}
          pickers={(pickers ?? []) as PickerOption[]}
        />
      </section>
    </main>
  );
}