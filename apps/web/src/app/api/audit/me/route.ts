// [STAKE+TRUST:BEGIN:audit_api]
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // TODO: Get real user ID from session/auth
    // For now, this is a placeholder that would need to be integrated with your auth system
    // Example integration:
    // const session = await getSession(request);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // const userId = session.user.id;

    // Placeholder: In production, replace with actual auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from token or session
    // This is a placeholder - replace with your actual auth implementation
    const userId = "placeholder-user-id"; // Replace with actual user ID from auth

    // RLS will enforce that users can only see their own audit logs
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("user_id", userId)
      .order("ts", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching audit log:", error);
      return NextResponse.json(
        { error: "Failed to fetch audit log" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rows: data || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// [STAKE+TRUST:END:audit_api]
