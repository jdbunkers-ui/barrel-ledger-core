"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackOrganizationPageView } from "@/lib/analytics";

type AnalyticsPageViewProps = {
  organizationId: string;
  organizationSlug: string;
  pageType: string;
  pageTitle?: string;
};

export default function AnalyticsPageView({
  organizationId,
  organizationSlug,
  pageType,
  pageTitle,
}: AnalyticsPageViewProps) {
  const pathname = usePathname();

  useEffect(() => {
    trackOrganizationPageView({
      organizationId,
      organizationSlug,
      pagePath: pathname,
      pageTitle,
      pageType,
    });
  }, [organizationId, organizationSlug, pathname, pageTitle, pageType]);

  return null;
}