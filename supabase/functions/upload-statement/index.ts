/// <reference types="https://deno.land/x/deno/cli/types/lib.deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Buffer } from "node:buffer";
import { AnalysisEngine } from "../_shared/analysis/engine";
import { ParserFactory } from "../_shared/parsing/ParserFactory";
import { NormalizedTransaction } from "../_shared/csv-adapters/types";

async function generateFingerprint(tx: any, accountId: string, userId: string): Promise<string> {
  const str = `${tx.date}-${tx.amount}-${tx.description}-${tx.type}-${accountId}-${userId}`;
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;
    const mapping = formData.get('mapping') as string | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'File not provided' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    if (!accountId) {
        return new Response(JSON.stringify({ error: 'Account ID not provided' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'csv';

    // --- Parsing ---
    const parserFactory = new ParserFactory();
    const parser = parserFactory.createParser(fileType);
    const parsedTransactions = await parser.parse(buffer);

    // --- Database Operations ---
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .from('uploads')
      .insert({
        file_name: file.name,
        file_type: fileType,
        user_id: user.id,
        status: 'completed',
        account_id: accountId,
      })
      .select()
      .single();

    if (uploadError) throw uploadError;

    const transactionsToInsert = await Promise.all(parsedTransactions.map(async (tx: any) => {
      const fingerprint = await generateFingerprint(tx, accountId, user.id);
      return {
        ...tx,
        user_id: user.id,
        upload_id: uploadData.id,
        status: 'pending_review',
        fingerprint,
      };
    }));

    if (transactionsToInsert.length > 0) {
        // Deduplication: Check for existing fingerprints
        const fingerprints = transactionsToInsert.map((tx: NormalizedTransaction) => tx.fingerprint).filter(Boolean) as string[];
        const { data: existing, error: fingerError } = await supabaseAdmin
            .from('transactions')
            .select('fingerprint')
            .in('fingerprint', fingerprints)
            .eq('user_id', user.id);

        if (fingerError) console.error('Fingerprint check failed:', fingerError);

        const existingFingerprints = new Set(existing?.map((tx: { fingerprint: string }) => tx.fingerprint));
        const uniqueTransactions = transactionsToInsert.filter((tx: NormalizedTransaction) => !tx.fingerprint || !existingFingerprints.has(tx.fingerprint));

      const { error: txError } = await supabaseAdmin.from('transactions').insert(uniqueTransactions);
      if (txError) {
        // Rollback upload if transactions fail? For now, just log it.
        console.error("Failed to insert transactions:", txError);
        // Optionally update upload status to 'failed'
        await supabaseAdmin.from('uploads').update({ status: 'failed', error_details: txError.message }).eq('id', uploadData.id);
        throw txError;
      }
    }

    // --- Trigger Analysis Asynchronously ---
        const analysisEngine = new AnalysisEngine(supabaseAdmin);
    try {
      await analysisEngine.runAnalysis(uploadData.id, user.id);
    } catch (e) {
      console.error("Analysis failed:", e);
      // Optionally update upload status to 'failed'
      await supabaseAdmin.from('uploads').update({ status: 'failed', error_details: e.message }).eq('id', uploadData.id);
    }

    return new Response(JSON.stringify({ success: true, uploadId: uploadData.id, count: transactionsToInsert.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error: any) {
    console.error('Edge function error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
};

Deno.serve(handler);
