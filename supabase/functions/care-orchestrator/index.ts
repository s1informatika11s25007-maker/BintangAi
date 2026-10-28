import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, payload, actor } = await req.json();

    // Security Prompt Injection Filter Simulation
    const rawText = payload?.text || "";
    if (rawText.toLowerCase().includes("ignore") || rawText.toLowerCase().includes("bypass")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "SECURITY_BLOCKED: Terdeteksi percobaan Prompt Injection.",
          gatewayTag: "[A] Prompt Injection Filter"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403
        }
      );
    }

    // Care Mission Orchestrator Response
    const responsePayload = {
      success: true,
      missionId: `msn-2026-${Date.now()}`,
      actionEvaluated: action || "EVALUATE_OBLIGATION",
      actor: actor || "Suster Dewi Pertiwi",
      authorityEnvelope: payload?.priority === "critical" ? "A3" : "A1",
      epistemicStatus: "observed",
      bitemporalTimestamp: new Date().toISOString(),
      auditEntryHash: "sha256-edge-function-validated-hash-2026",
      message: "Care Mission Orchestrator Edge Function executed successfully."
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
