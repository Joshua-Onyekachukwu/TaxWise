import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parse } from "csv-parse/sync";
import { GenericAdapter } from "@/lib/csv-adapters/generic-adapter";
import { AnalysisEngine } from "@/lib/analysis/engine";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Allow fallback for local testing if needed, or strict error
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      
      // Attempt to refresh session or handle edge case where middleware passed but getUser fails?
      // Actually, middleware usually handles protection. 
      // If we are here, maybe the token is missing/expired.
      console.error("Auth Error in Upload Route:", authError);
      return NextResponse.json({ error: "Unauthorized: Please sign in again." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic Validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
       return NextResponse.json({ error: "Only CSV files are supported currently" }, { status: 400 });
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const content = new TextDecoder("utf-8").decode(buffer);

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    }

    // Use Generic Adapter
    const adapter = new GenericAdapter();
    const headers = Object.keys(records[0]);
    let mapping = adapter.mapColumns(headers);

    // Check if user provided manual mapping
    const manualMappingJson = formData.get("mapping") as string;
    if (manualMappingJson) {
        try {
            const manualMapping = JSON.parse(manualMappingJson);
            // Override auto-detection
            mapping = { ...mapping, ...manualMapping };
        } catch (e) {
            console.warn("Invalid manual mapping JSON", e);
        }
    }

    // Validate Mapping
    if (!mapping.date || !mapping.description || (!mapping.amount && (!mapping.debit || !mapping.credit))) {
       // Return a special status "mapping_required" instead of hard error
       return NextResponse.json({ 
         success: false,
         status: "mapping_required",
         headers: headers,
         detectedMapping: mapping,
         filePreview: records.slice(0, 3) // Send first 3 rows for preview
       }, { status: 200 });
    }

    // Create Upload Record
    const { data: uploadData, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_url: "local_upload", // Placeholder for now, ideally upload to Storage bucket
        status: "processing",
        parsing_profile: { adapter: "generic", mapping }
      })
      .select()
      .single();

    if (uploadError) {
      console.error("Upload DB Error:", uploadError);
      return NextResponse.json({ error: "Failed to create upload record" }, { status: 500 });
    }

    const uploadId = uploadData.id;

    // Parse Rows & Prepare Transactions
    const transactionsToInsert = [];
    let processedCount = 0;

    for (const row of records) {
      const normalized = await adapter.parseRow(row, mapping);
      
      // Skip invalid rows (e.g. 0 amount)
      if (normalized.amount === 0) continue;

      transactionsToInsert.push({
        user_id: user.id,
        upload_id: uploadId,
        date: normalized.date,
        description: normalized.description,
        amount: normalized.amount,
        type: normalized.type,
        currency: normalized.currency,
        raw_row: row,
        status: "pending_review",
        is_deductible: false // Default to false, AI analysis will update this later
      });
      processedCount++;
    }

    // Batch Insert Transactions (Supabase has limit, usually 1000s is fine, but safer to chunk if large)
    // For < 10MB file, it should be fine in one go or few chunks.
    const chunkSize = 500;
    for (let i = 0; i < transactionsToInsert.length; i += chunkSize) {
      const chunk = transactionsToInsert.slice(i, i + chunkSize);
      const { error: batchError } = await supabase.from("transactions").insert(chunk);
      
      if (batchError) {
         console.error("Batch Insert Error:", batchError);
         // Mark upload as failed?
         await supabase.from("uploads").update({ status: "failed" }).eq("id", uploadId);
         return NextResponse.json({ error: "Failed to save transactions" }, { status: 500 });
      }
    }

    // Update Upload Status
    await supabase.from("uploads").update({ status: "completed" }).eq("id", uploadId);

    // Trigger Analysis
    const analysisEngine = new AnalysisEngine(supabase);
    const analysisResult = await analysisEngine.runAnalysis(uploadId, user.id);
    console.log("Analysis Result:", analysisResult);

    return NextResponse.json({ 
      success: true, 
      uploadId, 
      count: processedCount,
      analysisCount: analysisResult.count,
      message: `Successfully processed ${processedCount} transactions` 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
