import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import { hideTastingAction, updateTastingAction } from "../../actions";

type PageProps = {
  params: Promise<{
    tasting_id: string;
  }>;
};

export default async function EditTastingPage({ params }: PageProps) {
  await requireEditor();

  const { tasting_id } = await params;

  const supabase = await createSupabaseServerClient();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const referer = headersList.get("referer") ?? "/dashboard";

  const site = await getSiteContextByHost(host);

  const { data: tasting, error } = await supabase
    .schema("barrel_ledger_public")
    .from("v_reviews")
    .select(
      `
      tasting_id,
      tasting_date,
      nose_score,
      palate_score,
      finish_score,
      composite_score,
      nose_notes,
      palate_notes,
      finish_notes,
      overall_notes
    `
    )
    .eq("tasting_id", tasting_id)
    .maybeSingle();

  if (error) {
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

        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded border border-red-300 bg-red-50 p-6 text-red-700">
            {error.message}
          </div>
        </section>
      </main>
    );
  }

  if (!tasting) {
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

        <section className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded border border-stone-300 bg-white p-6">
            Tasting not found.
          </div>
        </section>
      </main>
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

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-4xl font-bold">Edit Review</h1>

        <p className="mt-2 text-stone-700">
          Tasting Date: {tasting.tasting_date ?? "—"}
        </p>

        <form
          action={updateTastingAction}
          className="mt-6 rounded border border-stone-300 bg-white p-6"
        >
          <input type="hidden" name="tasting_id" value={tasting.tasting_id} />
          <input type="hidden" name="return_to" value={referer} />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-semibold">Nose Score</label>
              <input
                name="nose_score"
                defaultValue={tasting.nose_score ?? ""}
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Palate Score</label>
              <input
                name="palate_score"
                defaultValue={tasting.palate_score ?? ""}
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Finish Score</label>
              <input
                name="finish_score"
                defaultValue={tasting.finish_score ?? ""}
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="w-full rounded border p-2"
              />
            </div>
          </div>

          <label className="mb-2 mt-4 block font-semibold">Nose Notes</label>
          <textarea
            name="nose_notes"
            defaultValue={tasting.nose_notes ?? ""}
            className="mb-4 min-h-24 w-full rounded border p-2"
          />

          <label className="mb-2 block font-semibold">Palate Notes</label>
          <textarea
            name="palate_notes"
            defaultValue={tasting.palate_notes ?? ""}
            className="mb-4 min-h-24 w-full rounded border p-2"
          />

          <label className="mb-2 block font-semibold">Finish Notes</label>
          <textarea
            name="finish_notes"
            defaultValue={tasting.finish_notes ?? ""}
            className="mb-4 min-h-24 w-full rounded border p-2"
          />

          <label className="mb-2 block font-semibold">Overall Notes</label>
          <textarea
            name="overall_notes"
            defaultValue={tasting.overall_notes ?? ""}
            className="mb-6 min-h-24 w-full rounded border p-2"
          />

          <button
            type="submit"
            className="rounded bg-stone-900 px-5 py-2 font-semibold text-white"
          >
            Save Changes
          </button>
        </form>

        <form action={hideTastingAction} className="mt-4">
          <input type="hidden" name="tasting_id" value={tasting.tasting_id} />
          <input type="hidden" name="return_to" value={referer} />

          <button
            type="submit"
            className="rounded border border-red-700 px-5 py-2 font-semibold text-red-700"
          >
            Hide This Review
          </button>

          <p className="mt-2 text-sm text-stone-600">
            This does not delete the database row. It sets fact_tastings.is_deleted to true.
          </p>
        </form>
      </section>
    </main>
  );
}