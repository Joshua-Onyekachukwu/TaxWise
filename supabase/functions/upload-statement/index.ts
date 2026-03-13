/// <reference types="https://deno.land/x/deno/cli/types/lib.deno.d.ts" />
import { Logger } from '../_shared/logger.ts';
import { createClient } from "@supabase/supabase-js";
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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dev-secret',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const isDevelopment = Deno.env.get('ENV') === 'development';
    const devSecret = req.headers.get('X-Dev-Secret');
    let user: any;

    if (isDevelopment && devSecret === Deno.env.get('DEV_SECRET')) {
      Logger.warn('Bypassing authentication for local development.');
      user = { id: 'dev-user-id' }; 
    } else {
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', ''));
      if (authError || !authUser) {
        Logger.error('Authentication failed', { error: authError?.message });
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      user = authUser;
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const formData = await req.formData();
    const accountId = formData.get('accountId') as string;

    if (!accountId) {
        return new Response(JSON.stringify({ error: 'Account ID not provided' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const { data: account, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('user_id')
        .eq('id', accountId)
        .single();

    if (accountError || !account || account.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const file = formData.get('file') as File;
    const mapping = formData.get('mapping') as string | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'File not provided' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
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

        if (fingerError) Logger.error('Fingerprint check failed:', { error: fingerError });

        const existingFingerprints = new Set(existing?.map((tx: { fingerprint: string }) => tx.fingerprint));
        const uniqueTransactions = transactionsToInsert.filter((tx: NormalizedTransaction) => !tx.fingerprint || !existingFingerprints.has(tx.fingerprint));

      const { error: txError } = await supabaseAdmin.from('transactions').insert(uniqueTransactions);
      if (txError) {
        Logger.error("Failed to insert transactions:", { error: txError });
        await supabaseAdmin.from('uploads').update({ status: 'failed', error_details: txError.message }).eq('id', uploadData.id);
        throw txError;
      }
    }

    // --- Trigger Analysis Asynchronously ---
    const { error: queueError } = await supabaseAdmin.functions.invoke('queue-analysis', {
      body: { uploadId: uploadData.id, userId: user.id },
    });
    if (queueError) {
      Logger.error('Failed to queue analysis:', { error: queueError });
      // Don't fail the whole upload, just log the error
    }

    return new Response(JSON.stringify({ success: true, uploadId: uploadData.id, count: transactionsToInsert.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    Logger.error('Edge function error:', { error });
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
};

Deno.serve(handler);
