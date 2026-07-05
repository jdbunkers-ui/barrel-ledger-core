import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteContextByHost } from "@/lib/getSiteContext";

export type AdminRole = "owner" | "editor" | "viewer";

export type CurrentMember = {
  user_id: string;
  email: string | null;
  organization_id: string;
  member_role: AdminRole;
};

type CurrentMemberRpcRow = {
  user_id: string;
  organization_id: string;
  member_role: string;
};

function isAdminRole(value: string): value is AdminRole {
  return value === "owner" || value === "editor" || value === "viewer";
}

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const site = await getSiteContextByHost(host);

  if (!site?.organization?.organization_id) {
    return null;
  }

  const { data, error } = await supabase
    .schema("barrel_ledger_public")
    .rpc("get_current_member_for_organization", {
      p_organization_id: site.organization.organization_id,
    })
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const member = data as CurrentMemberRpcRow;

  if (!isAdminRole(member.member_role)) {
    return null;
  }

  return {
    user_id: member.user_id,
    email: user.email ?? null,
    organization_id: member.organization_id,
    member_role: member.member_role,
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