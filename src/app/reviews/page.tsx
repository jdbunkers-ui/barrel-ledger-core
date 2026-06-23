import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { supabase } from "@/lib/supabaseClient";
import { headers } from "next/headers";

export default async function ReviewsPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
  }

  const { data: reviews, error } = await supabase
    .schema("barrel_ledger_public")
    .from("v_reviews")
    .select(`
      tasting_id,
      organization_id,
      single_barrel_id,
      nose_score,
      palate_score,
      finish_score,
      composite_score
    `)
    .eq("organization_id", site.organization.organization_id);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <>
      <CustomerHeader
        siteTitle={site.site_title}
        siteSubtitle={site.site_subtitle}
        logoUrl={site.logo_url}
        bannerUrl={site.banner_url}
        primaryColor={site.primary_color}
      />

      <Navigation />

      <main className="min-h-screen bg-stone-100 px-6 py-12">
        <section className="mx-auto max-w-6xl rounded-lg bg-white p-8 shadow">
          <h1 className="text-4xl font-bold">Reviews</h1>

          <p className="mt-4 text-stone-700">
            Browse structured tasting reviews and composite scores.
          </p>

          <div className="mt-8 overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full border-collapse text-left">
              <thead className="bg-stone-100">
                <tr>
                  <th className="p-4">Bottle / Barrel</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Nose</th>
                  <th className="p-4">Palate</th>
                  <th className="p-4">Finish</th>
                  <th className="p-4">Review Date</th>
                </tr>
              </thead>

              <tbody>
                {reviews?.map((review) => (
                  <tr
                    key={review.tasting_id}
                    className="border-t border-stone-200"
                  >
                    <td className="p-4 font-medium">
                      {review.single_barrel_id}
                    </td>

                    <td className="p-4 font-bold">
                      {review.composite_score?.toFixed(1)}
                    </td>

                    <td className="p-4">{review.nose_score}</td>
                    <td className="p-4">{review.palate_score}</td>
                    <td className="p-4">{review.finish_score}</td>

                    <td className="p-4">—</td>
                  </tr>
                ))}

                {(!reviews || reviews.length === 0) && (
                  <tr>
                    <td className="p-4 text-stone-600" colSpan={6}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}