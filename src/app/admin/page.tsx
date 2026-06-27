import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminLogoutButton from "./AdminLogoutButton";

const CURRENT_ORGANIZATION_SLUG = "brad-hughes-bourbon-reviews";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminAccess, error } = await supabase
    .from("v_admin_user_access")
    .select(
      "organization_name, organization_slug, display_name, user_id, role, status, is_admin"
    )
    .eq("user_id", user.id)
    .eq("organization_slug", CURRENT_ORGANIZATION_SLUG)
    .eq("is_admin", true)
    .maybeSingle();

  if (error) {
    console.error("Admin access check failed:", error);
  }

  if (!adminAccess) {
    return (
      <main className="min-h-screen bg-stone-100 px-6 py-12">
        <section className="mx-auto max-w-4xl rounded-xl border border-stone-200 bg-white p-8 shadow">
          <h1 className="mb-4 text-3xl font-bold">Access Denied</h1>

          <p className="mb-6 text-gray-700">
            You are signed in, but this account does not have administrator
            access for this Barrel Ledger site.
          </p>

          <AdminLogoutButton />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-12">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-8 shadow">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold">Admin Dashboard</h1>

              <p className="text-gray-700">
                Managing{" "}
                <span className="font-semibold">
                  {adminAccess.organization_name}
                </span>
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Role: {adminAccess.role}
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminCard
            title="Journal / Updates"
            description="Create and manage site updates."
            href="/admin/updates"
          />

          <AdminCard
            title="Tastings"
            description="Manage tasting results and review entries."
            href="/admin/tastings"
          />

          <AdminCard
            title="Bottles"
            description="Manage bottle and single barrel records."
            href="/admin/bottles"
          />

          <AdminCard
            title="Producers"
            description="Maintain producer records."
            href="/admin/producers"
          />

          <AdminCard
            title="Pickers"
            description="Maintain picker records."
            href="/admin/pickers"
          />
        </div>
      </section>
    </main>
  );
}

function AdminCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-stone-200 bg-white p-6 shadow transition hover:border-stone-500"
    >
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <p className="text-gray-700">{description}</p>
    </Link>
  );
}