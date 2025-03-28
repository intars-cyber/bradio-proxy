import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve((req) => {
  const url = new URL(req.url);
  if (url.pathname === "/stream") {
    const streamUrl = url.searchParams.get("url");
    if (!streamUrl) return new Response("No stream URL provided", { status: 400 });

    console.log(`Requesting stream: ${streamUrl}`);
    return fetch(streamUrl, {
      headers: { "User-Agent": "BRadio-App" }
    }).then((resp) => {
      console.log(`Stream response: ${resp.status}`);
      return new Response(resp.body, {
        headers: {
          "Content-Type": "audio/aac",
          "Access-Control-Allow-Origin": "https://bradio.dev",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }).catch((err) => {
      console.error(`Stream error: ${err.message}`);
      return new Response(`Stream error: ${err.message}`, { status: 500 });
    });
  }
  return Response.redirect("https://bradio.dev", 302);
}, { port: Deno.env.get("PORT") ? parseInt(Deno.env.get("PORT")!) : 8000 });