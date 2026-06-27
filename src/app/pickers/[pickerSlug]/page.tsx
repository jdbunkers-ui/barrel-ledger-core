import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import PickerDetailClient from "./PickerDetailClient";

type PickerDetailPageProps = {
  params: Promise<{
    pickerSlug: string;
  }>;
};

export default async function PickerDetailPage({
  params,
}: PickerDetailPageProps) {
  const { pickerSlug } = await params;

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

      <main className="min-h-screen bg-stone-100">
        <PickerDetailClient
          organizationSlug="brad-hughes-bourbon-reviews"
          pickerSlug={pickerSlug}
        />
      </main>
    </>
  );
}