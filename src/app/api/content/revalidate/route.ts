import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Revalidate the homepage and content API
    revalidatePath("/");
    revalidatePath("/api/content");

    return NextResponse.json({
      success: true,
      message: "Content revalidated successfully",
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate content" },
      { status: 500 }
    );
  }
}