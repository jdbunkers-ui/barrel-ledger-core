import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { getCurrentMember } from "@/lib/admin";
import { headers } from "next/headers";
import BottleDetailClient from "./BottleDetailClient";

const BRAD_ORGANIZATION_SLUG = "brad-hughes-bourbon-reviews";

type BottleDetailPageProps = {
  params: Promise<{
    bottleSlug: string;
  }>;
};

export default async function BottleDetailPage({
  params,
}: BottleDetailPageProps) {
  const { bottleSlug } = await params;

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

  const member = await getCurrentMember();

  const canEditReviews =
    member?.member_role === "owner" || member?.member_role === "editor";

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
        <BottleDetailClient
          organizationSlug={organizationSlug}
          bottleSlug={bottleSlug}
          canEditReviews={canEditReviews}
        />
      </main>
    </>
  );
}