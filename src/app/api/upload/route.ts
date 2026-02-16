import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parse } from "csv-parse/sync";
import { GenericAdapter } from "@/lib/csv-adapters/generic-adapter";
import { AnalysisEngine } from "@/lib/analysis/engine";
import { PdfParserService } from "@/lib/parsing/pdf-parser";
import { NormalizedTransaction } from "@/lib/csv-adapters/types";

// Force Node.js runtime for this route (required for pdf-parse)
export const runtime = 'nodejs';
// Increase timeout to 60 seconds (Vercel Pro/Hobby limits apply)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth Error in Upload Route:", authError);
      return NextResponse.json({ error: "Unauthorized: Please sign in again." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const accountId = formData.get("accountId") as string;
    const manualMappingJson = formData.get("mapping") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!accountId) {
        return NextResponse.json({ error: "Bank Account ID is required" }, { status: 400 });
    }

    // Basic Validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv';
    const buffer = await file.arrayBuffer();
    
    let transactionsToInsert: any[] = [];
    let headers: string[] = [];
    let mapping: any = {};
    let records: any[] = [];

    // --- PDF HANDLING ---
    if (fileType === 'pdf') {
        const pdfService = new PdfParserService();
        // Convert ArrayBuffer to Buffer for pdf-parse
        const nodeBuffer = Buffer.from(buffer);
        const parsedTxs = await pdfService.parse(nodeBuffer);
        
        if (parsedTxs.length === 0) {
            return NextResponse.json({ error: "Could not extract any transactions from this PDF. Please ensure it is a digital bank statement." }, { status: 400 });
        }

        // Prepare for insertion
        transactionsToInsert = parsedTxs.map(tx => ({
            user_id: user.id,
            // upload_id set later
            date: tx.date,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            currency: tx.currency,
            raw_row: tx.raw_row,
            status: "pending_review",
            is_deductible: false,
            // Fingerprint for deduplication
            fingerprint: generateFingerprint(tx, accountId)
        }));

    } 
    // --- CSV HANDLING ---
    else {
        const content = new TextDecoder("utf-8").decode(buffer);
        records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as Record<string, string>[];

        if (records.length === 0) {
            return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
        }

        const adapter = new GenericAdapter();
        headers = Object.keys(records[0]);
        mapping = adapter.mapColumns(headers);

        if (manualMappingJson) {
            try {
                const manualMapping = JSON.parse(manualMappingJson);
                mapping = { ...mapping, ...manualMapping };
            } catch (e) {
                console.warn("Invalid manual mapping JSON", e);
            }
        }

        // Validate Mapping
        if (!mapping.date || !mapping.description || (!mapping.amount && (!mapping.debit || !mapping.credit))) {
            return NextResponse.json({ 
                success: false,
                status: "mapping_required",
                headers: headers,
                detectedMapping: mapping,
                filePreview: records.slice(0, 3)
            }, { status: 200 });
        }

        // Parse Rows
        for (const row of records) {
            const normalized = await adapter.parseRow(row, mapping);
            if (normalized.amount === 0) continue;

            transactionsToInsert.push({
                user_id: user.id,
                // upload_id set later
                date: normalized.date,
                description: normalized.description,
                amount: normalized.amount,
                type: normalized.type,
                currency: normalized.currency,
                raw_row: row,
                status: "pending_review",
                is_deductible: false,
                fingerprint: generateFingerprint(normalized, accountId)
            });
        }
    }

    // --- Create Upload Record ---
    const { data: uploadData, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_url: "local_upload", 
        status: "processing",
        account_id: accountId, // Link to Bank Account
        file_type: fileType,
        parsing_profile: fileType === 'csv' ? { adapter: "generic", mapping } : { adapter: "pdf-regex" }
      })
      .select()
      .single();

    if (uploadError) {
      console.error("Upload DB Error:", uploadError);
      return NextResponse.json({ error: "Failed to create upload record" }, { status: 500 });
    }

    const uploadId = uploadData.id;

    // --- Deduplication Check ---
    // 1. Get all fingerprints for this account
    // Optimization: In a real app, we'd query by batch or use ON CONFLICT DO NOTHING.
    // For now, let's just fetch existing fingerprints for this account to filter in memory (simple for < 10k rows).
    // Or better, use `upsert` or check individually?
    // Let's rely on a unique constraint or manual check.
    // Manual check for now to allow "marking" as duplicate rather than silent skip.
    
    // Actually, let's just insert all. We can run a "dedup" job later, or filter now.
    // Let's filter now.
    
    // Fetch fingerprints from last 12 months for this account?
    // For MVP, we skip complex DB checks and just insert. 
    // BUT we add the upload_id to the objects.
    transactionsToInsert.forEach(t => t.upload_id = uploadId);

    // Batch Insert
    const chunkSize = 500;
    for (let i = 0; i < transactionsToInsert.length; i += chunkSize) {
      const chunk = transactionsToInsert.slice(i, i + chunkSize);
      const { error: batchError } = await supabase.from("transactions").insert(chunk);
      
      if (batchError) {
         console.error("Batch Insert Error:", batchError);
         await supabase.from("uploads").update({ status: "failed" }).eq("id", uploadId);
         return NextResponse.json({ error: "Failed to save transactions" }, { status: 500 });
      }
    }

    // Update Upload Status
    await supabase.from("uploads").update({ status: "completed" }).eq("id", uploadId);

    // Trigger Analysis
    const analysisEngine = new AnalysisEngine(supabase);
    const analysisResult = await analysisEngine.runAnalysis(uploadId, user.id);

    return NextResponse.json({ 
      success: true, 
      uploadId, 
      count: transactionsToInsert.length,
      analysisCount: analysisResult.count,
      message: `Successfully processed ${transactionsToInsert.length} transactions` 
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Helper: Generate a simple deterministic hash for deduplication
function generateFingerprint(tx: NormalizedTransaction, accountId: string): string {
    // Fingerprint = SHA256(accountId + date + amount + description_slug)
    // We'll just use a string concatenation for now as a "poor man's hash" or real hash if crypto available.
    // Since we are in Node runtime (Next.js API), we can use crypto.
    
    const slug = tx.description.toLowerCase().replace(/[^a-z0-9]/g, '');
    const data = `${accountId}|${tx.date}|${tx.amount.toFixed(2)}|${slug}`;
    
    // Use simple base64 of string if crypto import is hassle, but let's try strict.
    // Actually, just returning the string is fine for the column if it's not too long.
    // But index performance is better with hash.
    // Let's simple-hash it.
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}
