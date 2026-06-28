import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "editor" | "viewer";

export type CurrentMember = {
  user_id: string;
  email: string | null;
  organization_id: string;
  member_role: AdminRole;
};

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("get_current_member")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    user_id: data.user_id,
    email: user.email ?? null,
    organization_id: data.organization_id,
    member_role: data.member_role as AdminRole,
  };
}

export async function requireMember(): Promise<CurrentMember> {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/admin/login");
  }

  return member;
}

export async function requireEditor(): Promise<CurrentMember> {
  const member = await requireMember();

  if (member.member_role === "viewer") {
    redirect("/");
  }

  return member;
}