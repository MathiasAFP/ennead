import {
  createSupabaseClient,
  getSupabaseConfig,
  getSupabaseHealthEndpoint,
} from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = getSupabaseConfig();
    const supabase = createSupabaseClient(config);
    await supabase.auth.getSession();

    const response = await fetch(getSupabaseHealthEndpoint(config), {
      cache: "no-store",
      headers: {
        apikey: config.publishableKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return Response.json({ connected: false }, { status: 503 });
    }

    return Response.json({ connected: true });
  } catch {
    return Response.json({ connected: false }, { status: 503 });
  }
}
