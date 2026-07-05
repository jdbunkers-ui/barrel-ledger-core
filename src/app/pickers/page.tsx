import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import PickersClient from "./PickersClient";

export default async function PickersPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
  }

  const organizationId = site.organization.organization_id;
  const organizationSlug = site.organization.organization_slug;

  return (
    <>
      <AnalyticsPageView
        organizationId={organizationId}
        organizationSlug={organizationSlug}
        pageType="picker_list"
        pageTitle="Pickers"
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
        <PickersClient organizationSlug={organizationSlug} />
      </main>
    </>
  );
}