import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AnalysisEngine } from "@/lib/analysis/engine";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId } = await req.json();

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID is required" }, { status: 400 });
    }

    const engine = new AnalysisEngine(supabase);
    const result = await engine.runAnalysis(uploadId, user.id);

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
