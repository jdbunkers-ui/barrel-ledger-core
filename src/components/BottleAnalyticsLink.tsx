"use client";

import Link from "next/link";
import { trackBottleSelect } from "@/lib/analytics";

type BottleAnalyticsLinkProps = {
  href: string;
  organizationId: string;
  organizationSlug: string;
  bottleId?: string | null;
  singleBarrelId?: string | null;
  bottleExpression: string;
  producerName?: string | null;
  pickerName?: string | null;
  pageType?: string;
  className?: string;
  children: React.ReactNode;
};

export default function BottleAnalyticsLink({
  href,
  organizationId,
  organizationSlug,
  bottleId,
  singleBarrelId,
  bottleExpression,
  producerName,
  pickerName,
  pageType,
  className,
  children,
}: BottleAnalyticsLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackBottleSelect({
          organizationId,
          organizationSlug,
          bottleId,
          singleBarrelId,
          bottleExpression,
          producerName,
          pickerName,
          pageType,
        });
      }}
    >
      {children}
    </Link>
  );
}