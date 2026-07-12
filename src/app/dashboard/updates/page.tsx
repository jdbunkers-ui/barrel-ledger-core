import Image from "next/image";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireMember } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";

type BarrelLedgerUpdate = {
  update_id: string;
  update_title: string;
  update_description: string | null;
  publish_ts: string;
  new_update: boolean;
};

export default async function BarrelLedgerUpdatesPage() {
  await requireMember();

  const supabase = await createSupabaseServerClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  const { data: updatesRaw, error } = await supabase
    .schema("barrel_ledger_public")
    .from("v_barrel_ledger_updates")
    .select(
      "update_id, update_title, update_description, publish_ts, new_update"
    )
    .order("publish_ts", { ascending: false });

  if (error) {
    console.error("Unable to load BarrelLedger updates:", error);
  }

  const updates = (updatesRaw ?? []) as BarrelLedgerUpdate[];

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
        <div className="mb-6">
          <h1 className="text-4xl font-bold">BarrelLedger Updates</h1>

          <p className="mt-2 text-stone-600">
            Product updates, Master Whiskey Library additions, and new
            BarrelLedger features.
          </p>
        </div>

        <section className="rounded border border-stone-300 bg-white p-6">
          {error ? (
            <p className="text-sm text-red-700">
              BarrelLedger updates could not be loaded.
            </p>
          ) : updates.length === 0 ? (
            <p className="text-sm text-stone-500">
              No BarrelLedger updates have been published yet.
            </p>
          ) : (
            <div className="divide-y divide-stone-200">
              {updates.map((update) => (
                <article key={update.update_id} className="py-6 first:pt-0">
                  <div className="flex items-start gap-3">
                    {update.new_update && <NewUpdateStar />}

                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-stone-900">
                        {update.update_title}
                      </h2>

                      <p className="mt-1 text-sm text-stone-500">
                        {formatUpdateDate(update.publish_ts)}
                      </p>

                      {update.update_description && (
                        <p className="mt-3 whitespace-pre-line leading-7 text-stone-700">
                          {update.update_description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-sm text-stone-500">
          You may close this tab to return to your dashboard.
        </p>
      </section>
    </main>
  );
}

function NewUpdateStar() {
  return (
    <Image
      src="/images/gold_spinning_star.gif"
      alt="New update"
      width={32}
      height={32}
      unoptimized
      className="mt-0.5 shrink-0"
    />
  );
}

function formatUpdateDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}