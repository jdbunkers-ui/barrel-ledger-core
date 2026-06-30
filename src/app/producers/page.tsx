import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import ProducersClient from "./ProducersClient";

const BRAD_ORGANIZATION_SLUG = "brad-hughes-bourbon-reviews";

export default async function ProducersPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
  }

  const siteWithAnalyticsFields = site as typeof site & {
    organization_id?: string | null;
    organization_slug?: string | null;
  };

  const organizationId = siteWithAnalyticsFields.organization_id ?? "";
  const organizationSlug =
    siteWithAnalyticsFields.organization_slug ?? BRAD_ORGANIZATION_SLUG;

  return (
    <>
      <AnalyticsPageView
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        pageType="producer_list"
        pageTitle="Producers"
      />

      <CustomerHeader
        siteTitle={site.site_title}
        siteSubtitle={site.site_subtitle}
        logoUrl={site.logo_url}
        bannerUrl={site.banner_url}
        primaryColor={site.primary_color}
      />

      <Navigation />

      <main className="min-h-screen bg-stone-100">
        <ProducersClient organizationSlug={organizationSlug} />
      </main>
    </>
  );
}