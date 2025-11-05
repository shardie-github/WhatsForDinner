// [STAKE+TRUST:BEGIN:feedback_api]
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json();
    const { userId = "anon", rating, comment, category = "general" } = body;

    // Validate input
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment && rating === undefined) {
      return NextResponse.json(
        { error: "Either rating or comment is required" },
        { status: 400 }
      );
    }

    // Store feedback in audit_log table
    // Note: In production, you might want a separate feedback table
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId === "anon" ? null : userId,
      action: "feedback",
      meta: {
        rating,
        comment,
        category,
        timestamp: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Error storing feedback:", error);
      return NextResponse.json(
        { error: "Failed to store feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Feedback received" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// [STAKE+TRUST:END:feedback_api]
