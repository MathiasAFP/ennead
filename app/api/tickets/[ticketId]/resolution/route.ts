import { NextResponse } from "next/server";

import { getResolvedTicketSummary } from "@/app/lib/data/resolutions";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/tickets/[ticketId]/resolution">,
) {
  const { ticketId } = await params;
  const summary = await getResolvedTicketSummary(ticketId);

  if (!summary) {
    return NextResponse.json(
      { message: "Não foi possível carregar a resolução do chamado." },
      { status: 404 },
    );
  }

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "no-store" },
  });
}
