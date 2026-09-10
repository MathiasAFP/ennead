import { searchSimilarTicketsForTicket } from "@/app/lib/data/semantic-search";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/tickets/[ticketId]/similar">,
) {
  const { ticketId } = await context.params;
  const similarTickets = await searchSimilarTicketsForTicket(ticketId);

  if (similarTickets === null) {
    return Response.json(
      { message: "Busca semântica indisponível no momento." },
      { status: 503 },
    );
  }

  return Response.json({ similarTickets });
}
