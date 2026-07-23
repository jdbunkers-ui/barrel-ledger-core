import { notFound } from "next/navigation";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import EditTastingForm from "./EditTastingForm";
import { hideTastingAction, updateTastingAction } from "./actions";

type EditTastingPageProps = {
  params: Promise<{
    tasting_id: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
  }>;
};

type EditableTasting = {
  tasting_id: string;
  organization_id: string;
  single_barrel_id: string;
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
  guided_sensory_ind: boolean;
  youtube_url: string | null;
  instagram_url: string | null;
};

export default async function EditTastingPage({
  params,
  searchParams,
}: EditTastingPageProps) {
  await requireEditor();
  const supabase = await createSupabaseServerClient();

  const { tasting_id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const { data: tastingRows, error: tastingError } = await supabase
    .schema("barrel_ledger_public")
    .rpc("f_get_editable_tasting_review", {
    p_tasting_id: tasting_id,
    });

  if (tastingError) {
    notFound();
  }

  const tasting = ((tastingRows ?? []) as EditableTasting[])[0] ?? null;

  if (!tasting) {
    notFound();
  }

  const { data: review } = await supabase
    .schema("barrel_ledger_public")
    .from("v_reviews_v2")
    .select("bottle_display_name")
    .eq("tasting_id", tasting_id)
    .maybeSingle();

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
        <h1 className="text-4xl font-bold text-stone-950">
          Edit Review
        </h1>

        <p className="mt-2 text-stone-700">
          {review?.bottle_display_name ?? "Tasting review"}
        </p>

        {resolvedSearchParams.saved === "1" && (
          <div className="mt-5 rounded-lg border border-green-300 bg-green-50 p-4 font-semibold text-green-800">
            Review changes saved.
          </div>
        )}

        <div className="mt-6">
          <EditTastingForm
            tasting={tasting}
            updateAction={updateTastingAction}
            hideAction={hideTastingAction}
          />
        </div>
      </section>
    </main>
  );
}