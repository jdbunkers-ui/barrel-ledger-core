import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireEditor } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import { submitBottleAction } from "../actions";
 
export default async function SubmitBottlePage() {
  await requireEditor();
  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);
 
  const { data: distilleries } = await supabase.schema("barrel_ledger_public").from("v_admin_distillery_options").select("*");
  const { data: bottles } = await supabase.schema("barrel_ledger_public").from("v_admin_bottle_options").select("*");
  const { data: pickers } = await supabase.schema("barrel_ledger_public").from("v_admin_barrel_picker_options").select("*");
 
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
        <h1 className="mb-2 text-4xl font-bold">Submit a Bottle</h1>
        <p className="mb-6 text-stone-700">
          This lands in staging for Master Whiskey Library review. It does not become available for tastings until approved.
        </p>
 
        <form action={submitBottleAction} className="space-y-6 rounded border border-stone-300 bg-white p-6">
          <section>
            <h2 className="mb-3 text-2xl font-bold">Contact</h2>
            <label className="block font-semibold">Email *</label>
            <input name="email_address" type="email" required className="mb-3 w-full rounded border p-2" />
            <label className="block font-semibold">Instagram</label>
            <input name="ig_account" placeholder="@example" className="w-full rounded border p-2" />
          </section>
 
          <section>
            <h2 className="mb-3 text-2xl font-bold">1. Distillery</h2>
            <label className="block font-semibold">Existing Distillery</label>
            <select name="existing_distillery_id" className="mb-3 w-full rounded border p-2">
              <option value="">Select Distillery</option>
              {(distilleries ?? []).map((d) => (
                <option key={d.distillery_id} value={d.distillery_id}>{d.distillery_name}</option>
              ))}
            </select>
            <p className="mb-2 text-sm text-stone-600">If not listed, enter the new distillery fields below.</p>
            <input name="distillery_name" placeholder="Distillery Name" className="mb-2 w-full rounded border p-2" />
            <input name="country" placeholder="Country" className="mb-2 w-full rounded border p-2" />
            <input name="state" placeholder="State" className="mb-2 w-full rounded border p-2" />
            <input name="city" placeholder="City" className="mb-2 w-full rounded border p-2" />
            <input name="address_line_1" placeholder="Address Line 1" className="mb-2 w-full rounded border p-2" />
            <input name="postal_code" placeholder="Postal Code" className="w-full rounded border p-2" />
          </section>
 
          <section>
            <h2 className="mb-3 text-2xl font-bold">2. Bottle</h2>
            <label className="block font-semibold">Existing Bottle</label>
            <select name="existing_bottle_id" className="mb-3 w-full rounded border p-2">
              <option value="">Select Bottle</option>
              {(bottles ?? []).map((b) => (
                <option key={b.bottle_id} value={b.bottle_id}>{b.bottle_display_name}</option>
              ))}
            </select>
            <p className="mb-2 text-sm text-stone-600">If not listed, enter the new bottle fields below.</p>
            <input name="brand_name" placeholder="Brand Name" className="mb-2 w-full rounded border p-2" />
            <input name="expression_name" placeholder="Expression Name" className="mb-2 w-full rounded border p-2" />
            <input name="spirit_category" placeholder="Spirit Category" className="mb-2 w-full rounded border p-2" />
            <input name="spirit_subtype" placeholder="Spirit Subtype" className="mb-2 w-full rounded border p-2" />
            <input name="abv" placeholder="ABV, not proof" className="mb-2 w-full rounded border p-2" />
            <input name="size_ml" placeholder="Size ML" className="mb-2 w-full rounded border p-2" />
            <input name="msrp" placeholder="MSRP" className="w-full rounded border p-2" />
          </section>
 
          <section>
            <h2 className="mb-3 text-2xl font-bold">3. Single Barrel / Batch</h2>
            <select name="submitted_bottle_type" className="mb-3 w-full rounded border p-2">
              <option value="">None - standard batched bottle</option>
              <option value="SINGLE_BARREL">Single Barrel / Store Pick</option>
              <option value="VINTAGE_BATCH">Vintage / Batch Detail</option>
            </select>
            <input name="pick_name" placeholder="Pick Name / Batch" className="mb-2 w-full rounded border p-2" />
            <input name="bottling_year" placeholder="Bottling Year" className="mb-2 w-full rounded border p-2" />
            <input name="batch_code" placeholder="Batch Code / Barrel Details" className="w-full rounded border p-2" />
          </section>
 
          <section>
            <h2 className="mb-3 text-2xl font-bold">4. Barrel Picker</h2>
            <label className="block font-semibold">Existing Picker</label>
            <select name="existing_barrel_picker_id" className="mb-3 w-full rounded border p-2">
              <option value="">Select Picker</option>
              {(pickers ?? []).map((p) => (
                <option key={p.barrel_picker_id} value={p.barrel_picker_id}>{p.barrel_picker_name}</option>
              ))}
            </select>
            <input name="barrel_picker_name" placeholder="New Barrel Picker Name" className="mb-2 w-full rounded border p-2" />
            <textarea name="barrel_picker_submitter_notes" placeholder="Picker notes" className="w-full rounded border p-2" />
          </section>
 
          <section>
            <label className="block font-semibold">Submitter Notes</label>
            <textarea name="bottle_submitter_notes" className="mb-4 min-h-24 w-full rounded border p-2" />
            <button type="submit" className="rounded bg-stone-900 px-5 py-2 font-semibold text-white">
              Submit Bottle for Review
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}