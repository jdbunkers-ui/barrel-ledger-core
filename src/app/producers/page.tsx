import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import ProducersClient from "./ProducersClient";

const BRAD_ORGANIZATION_ID = "58573efe-77df-4ca2-9dbb-b6fddaa8671a";

export default async function ProducersPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  const site = await getSiteContextByHost(host);

  if (!site) {
    return <main className="p-10">Site settings not found.</main>;
  }

  const siteWithOrg = site as typeof site & {
    organization_id?: string | null;
  };

  const organizationId = siteWithOrg.organization_id ?? BRAD_ORGANIZATION_ID;

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
        <ProducersClient organizationId={organizationId} />
      </main>
    </>
  );
}