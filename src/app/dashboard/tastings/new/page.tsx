import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import { addTastingAction } from "../actions";
 
export default async function AddTastingPage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);
 
  const { data: bottles } = await supabase
    .schema("barrel_ledger_public")
    .from("v_admin_single_barrel_options")
    .select("single_barrel_id, bottle_display_name")
    .order("bottle_display_name");
 
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
        <h1 className="mb-2 text-4xl font-bold">Add a Tasting</h1>
        <p className="mb-6 text-stone-700">
          Search/select an approved bottle from the Master Whiskey Library, then add scores and notes.
          Pending bottle submissions cannot be reviewed until approved.
        </p>
 
        <form action={addTastingAction} className="rounded border border-stone-300 bg-white p-6">
          <label className="mb-2 block font-semibold">Approved Bottle / Single Barrel</label>
          <select name="single_barrel_id" required className="mb-4 w-full rounded border p-2">
            <option value="">Select Bottle</option>
            {(bottles ?? []).map((b) => (
              <option key={b.single_barrel_id} value={b.single_barrel_id}>
                {b.bottle_display_name}
              </option>
            ))}
          </select>
 
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-semibold">Nose Score</label>
              <input name="nose_score" type="number" step="0.1" min="0" max="10" className="w-full rounded border p-2" />
            </div>
            <div>
              <label className="mb-2 block font-semibold">Palate Score</label>
              <input name="palate_score" type="number" step="0.1" min="0" max="10" className="w-full rounded border p-2" />
            </div>
            <div>
              <label className="mb-2 block font-semibold">Finish Score</label>
              <input name="finish_score" type="number" step="0.1" min="0" max="10" className="w-full rounded border p-2" />
            </div>
          </div>
 
          <label className="mb-2 mt-4 block font-semibold">Nose Notes</label>
          <textarea name="nose_notes" className="mb-4 min-h-24 w-full rounded border p-2" />
 
          <label className="mb-2 block font-semibold">Palate Notes</label>
          <textarea name="palate_notes" className="mb-4 min-h-24 w-full rounded border p-2" />
 
          <label className="mb-2 block font-semibold">Finish Notes</label>
          <textarea name="finish_notes" className="mb-4 min-h-24 w-full rounded border p-2" />
 
          <label className="mb-2 block font-semibold">Overall Notes</label>
          <textarea name="overall_notes" className="mb-6 min-h-24 w-full rounded border p-2" />
 
          <button type="submit" className="rounded bg-stone-900 px-5 py-2 font-semibold text-white">
            Save Tasting
          </button>
        </form>
      </section>
    </main>
  );
}