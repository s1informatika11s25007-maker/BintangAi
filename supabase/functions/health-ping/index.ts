import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const responsePayload = {
    status: "healthy",
    system: "SambungJaga AI Superagent System",
    kernelVersion: "v2.0.0",
    timestamp: new Date().toISOString(),
    message: "SambungJaga AI Edge Function Health Ping OK!"
  };

  return new Response(JSON.stringify(responsePayload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
});
