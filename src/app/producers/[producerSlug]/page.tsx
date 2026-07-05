import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import ProducerDetailClient from "./ProducerDetailClient";

type ProducerDetailPageProps = {
  params: Promise<{
    producerSlug: string;
  }>;
};

export default async function ProducerDetailPage({
  params,
}: ProducerDetailPageProps) {
  const { producerSlug } = await params;

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
        pageType="producer_detail"
        pageTitle={`Producer Detail - ${producerSlug}`}
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
        <ProducerDetailClient
          organizationSlug={organizationSlug}
          producerSlug={producerSlug}
        />
      </main>
    </>
  );
}