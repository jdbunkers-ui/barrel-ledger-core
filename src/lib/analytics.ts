type GtagEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config",
      eventName: string,
      params?: GtagEventParams
    ) => void;
  }
}

export function trackEvent(eventName: string, params: GtagEventParams = {}) {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;

  window.gtag("event", eventName, {
    ...params,
  });
}

export function trackOrganizationPageView(params: {
  organizationId: string;
  organizationSlug: string;
  pagePath: string;
  pageTitle?: string;
  pageType: string;
}) {
  trackEvent("page_view", {
    organization_id: params.organizationId,
    organization_slug: params.organizationSlug,
    page_path: params.pagePath,
    page_title: params.pageTitle,
    page_type: params.pageType,
  });
}

export function trackBottleSelect(params: {
  organizationId: string;
  organizationSlug: string;
  bottleId?: string | null;
  singleBarrelId?: string | null;
  bottleExpression: string;
  producerName?: string | null;
  pickerName?: string | null;
  pageType?: string;
}) {
  trackEvent("select_item", {
    organization_id: params.organizationId,
    organization_slug: params.organizationSlug,
    bottle_id: params.bottleId,
    single_barrel_id: params.singleBarrelId,
    bottle_expression: params.bottleExpression,
    producer_name: params.producerName,
    picker_name: params.pickerName,
    page_type: params.pageType,

    item_id: params.singleBarrelId ?? params.bottleId ?? params.bottleExpression,
    item_name: params.bottleExpression,
    item_category: "Bottle",
  });
}

export function trackBottleView(params: {
  organizationId: string;
  organizationSlug: string;
  bottleId?: string | null;
  singleBarrelId?: string | null;
  bottleExpression: string;
  producerName?: string | null;
  pickerName?: string | null;
}) {
  trackEvent("view_item", {
    organization_id: params.organizationId,
    organization_slug: params.organizationSlug,
    bottle_id: params.bottleId,
    single_barrel_id: params.singleBarrelId,
    bottle_expression: params.bottleExpression,
    producer_name: params.producerName,
    picker_name: params.pickerName,

    item_id: params.singleBarrelId ?? params.bottleId ?? params.bottleExpression,
    item_name: params.bottleExpression,
    item_category: "Bottle",
  });
}