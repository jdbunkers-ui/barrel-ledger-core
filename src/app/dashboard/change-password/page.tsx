import Link from "next/link";
import CustomerHeader from "@/components/CustomerHeader";
import Navigation from "@/components/Navigation";
import { requireMember } from "@/lib/admin";
import { getSiteContextByHost } from "@/lib/getSiteContext";
import { headers } from "next/headers";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  await requireMember();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  return (
    <main className="min-h-screen bg-stone-100">
      {site && (
        <CustomerHeader
          siteTitle={site.site_title}
          siteSubtitle={site.site_subtitle}
          logoUrl={site.logo_url}
          bannerUrl={site.banner_url}
          primaryColor={site.primary_color}
        />
      )}

      <Navigation />

      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-stone-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <section className="rounded border border-stone-300 bg-white p-6">
          <h1 className="mb-2 text-3xl font-bold">Change Password</h1>

          <p className="mb-6 text-sm text-stone-600">
            Enter a new password for your admin account. This will update the
            password for the currently logged-in Supabase user.
          </p>

          <ChangePasswordForm />
        </section>
      </section>
    </main>
  );
}