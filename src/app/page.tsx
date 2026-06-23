import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
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
        <section className="max-w-6xl mx-auto rounded-lg bg-white p-8 shadow">
          <h1 className="text-4xl font-bold">{site.site_title}</h1>

          <p className="mt-4">{site.site_subtitle}</p>

          <p className="mt-4">
            Web site summary.
          </p>

        </section>
      </main>
    </>
  );
}