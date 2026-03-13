/// <reference types="https://deno.land/x/deno/cli/types/lib.deno.d.ts" />
import { createClient } from '@supabase/supabase-js';
import { Logger } from '../_shared/logger.ts';

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

    const { uploadId, userId } = await req.json();

    // TODO: Add to a real queueing system (e.g., RabbitMQ, SQS)
    // For now, we will just call the analysis engine directly
    Logger.info('Queueing analysis for upload:', { uploadId, userId });

    // In a real system, this would be a separate worker process
    const { AnalysisEngine } = await import('../_shared/analysis/engine.ts');
    const analysisEngine = new AnalysisEngine(supabaseAdmin);
    await analysisEngine.runAnalysis(uploadId, userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    Logger.error('Queue analysis error:', { error });
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
};

Deno.serve(handler);
