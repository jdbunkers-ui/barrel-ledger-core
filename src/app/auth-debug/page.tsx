import { cookies, headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/admin";

export default async function AuthDebugPage() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const headersList = await headers();

  const host = headersList.get("host") ?? "";
  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);

  const supabaseCookieNames = cookieNames.filter((name) =>
    name.startsWith("sb-")
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const member = await getCurrentMember();

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Auth Debug</h1>

      <h2>Host</h2>
      <pre>{host}</pre>

      <h2>Server Supabase User</h2>
      <pre>
        {JSON.stringify(
          {
            hasUser: Boolean(user),
            userId: user?.id ?? null,
            email: user?.email ?? null,
            error: userError?.message ?? null,
          },
          null,
          2
        )}
      </pre>

      <h2>Current Member</h2>
      <pre>{JSON.stringify(member, null, 2)}</pre>

      <h2>Supabase Cookie Names Visible to Server</h2>
      <pre>{JSON.stringify(supabaseCookieNames, null, 2)}</pre>

      <h2>All Cookie Names Visible to Server</h2>
      <pre>{JSON.stringify(cookieNames, null, 2)}</pre>
    </main>
  );
}