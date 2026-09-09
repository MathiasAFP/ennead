import { createSupabaseAdminClient } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const [organizations, tickets, resolutions] = await Promise.all([
      supabase
        .from("organizations")
        .select("*", { count: "exact", head: true }),
      supabase.from("tickets").select("*", { count: "exact", head: true }),
      supabase
        .from("ticket_resolutions")
        .select("*", { count: "exact", head: true }),
    ]);

    const supabaseError = [organizations.error, tickets.error, resolutions.error].find(
      Boolean,
    );

    if (supabaseError) {
      console.error("Supabase database health error", {
        code: supabaseError.code,
        message: supabaseError.message,
        details: supabaseError.details,
        hint: supabaseError.hint,
      });
      throw new Error("Não foi possível consultar o banco de dados.");
    }

    return Response.json({
      connected: true,
      organizations: organizations.count ?? 0,
      tickets: tickets.count ?? 0,
      resolutions: resolutions.count ?? 0,
    });
  } catch {
    return Response.json(
      {
        connected: false,
        message: "Não foi possível verificar o banco de dados.",
      },
      { status: 503 },
    );
  }
}
