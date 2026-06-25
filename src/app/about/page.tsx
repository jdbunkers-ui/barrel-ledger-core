import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import AboutClient from "./AboutClient";

const BRAD_ORGANIZATION_SLUG = "brad-hughes-bourbon-reviews";

export default async function AboutPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
  }

  const siteWithSlug = site as typeof site & {
    organization_slug?: string | null;
  };

  const organizationSlug =
    siteWithSlug.organization_slug ?? BRAD_ORGANIZATION_SLUG;

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

      <main className="min-h-screen bg-stone-100">
        <AboutClient organizationSlug={organizationSlug} />
      </main>
    </>
  );
}