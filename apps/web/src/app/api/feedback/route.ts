// [STAKE+TRUST:BEGIN:feedback_api]
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth-middleware";

export const runtime = "nodejs"; // Changed from edge to support auth middleware

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, comment, category = "general" } = body;

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

    // Try to get authenticated user (optional - allow anonymous feedback)
    const authResult = await getAuthenticatedUser(req);
    const userId = authResult?.user.id || null;
    const supabase = authResult?.supabase || createClient();

    // Store feedback in audit_log table
    // Note: In production, you might want a separate feedback table
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
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
