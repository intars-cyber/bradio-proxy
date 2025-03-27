import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve((req) => {
  const url = new URL(req.url);
  if (url.pathname === "/stream") {
    const streamUrl = url.searchParams.get("url");
    if (!streamUrl) return Response.redirect("https://bradio.dev", 302);
    return fetch(streamUrl, { headers: { "User-Agent": "BRadio-App" } });
  }
  return Response.redirect("https://bradio.dev", 302);
});