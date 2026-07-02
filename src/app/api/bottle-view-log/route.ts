import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");

      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      );
    }

    if (!supabaseServiceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");

      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      organizationId,
      singleBarrelId,
      bottleId,
      bottleSlug,
      bottleName,
      routePath,
      siteHost,
    } = body;

    if (!organizationId || !singleBarrelId || !bottleSlug || !routePath) {
      console.error("Missing required bottle view fields:", {
        organizationId,
        singleBarrelId,
        bottleSlug,
        routePath,
      });

      return NextResponse.json(
        {
          error: "Missing required bottle view fields",
          received: {
            organizationId,
            singleBarrelId,
            bottleSlug,
            routePath,
          },
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const insertPayload = {
      organization_id: organizationId,
      single_barrel_id: singleBarrelId,
      bottle_id: bottleId ?? null,
      bottle_slug: bottleSlug,
      bottle_name: bottleName ?? null,
      route_path: routePath,
      site_host: siteHost ?? null,
      page_type: "bottle_detail",
    };

    const { data, error } = await supabase
      .schema("barrel_ledger_public")
      .from("bottle_view_log")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Bottle view insert failed:", error);

      return NextResponse.json(
        {
          error: "Bottle view insert failed",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Bottle view log API error:", error);

    return NextResponse.json(
      {
        error: "Unexpected bottle view log error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}