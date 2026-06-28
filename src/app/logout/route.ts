import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  const headersList = await headers();

  const forwardedHost =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    "";

  const forwardedProto =
    headersList.get("x-forwarded-proto") ??
    "https";

  const redirectUrl = `${forwardedProto}://${forwardedHost}/`;

  return NextResponse.redirect(redirectUrl);
}