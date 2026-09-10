import "server-only";

import { generateEmbedding } from "../ai/embeddings";
import { sanitizeTicketTextForEmbedding } from "../privacy/sanitize-ticket-text";
import { createSupabaseAdminClient } from "../supabase-admin";
import { MVP_ORGANIZATION_ID } from "./mvp-organization.mjs";

type MatchRow = {
  ticket_id: string;
  similarity: number;
};

type SimilarTicketRow = {
  id: string;
  ticket_number: number;
  title: string;
  category: string | null;
  description_sanitized: string | null;
  status: "resolved";
};

type ResolutionRow = {
  ticket_id: string;
  cause: string;
  solution: string;
  steps: unknown;
  notes: string | null;
};

export type SimilarTicketResult = {
  id: string;
  title: string;
  category: string;
  similarity: number;
  summary: string;
  status: "Resolvido";
  reportedProblem: string;
  identifiedCause: string;
  appliedSolution: string;
  steps: string[];
  observation: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function toSteps(value: unknown) {
  return Array.isArray(value)
    ? value.filter((step): step is string => typeof step === "string")
    : [];
}

function buildEmbeddingContent({
  title,
  category,
  problem,
}: {
  title: string;
  category: string | null;
  problem: string;
}) {
  return [
    `Título: ${sanitizeTicketTextForEmbedding(title)}`,
    `Categoria: ${sanitizeTicketTextForEmbedding(category ?? "Não informada")}`,
    `Problema: ${problem}`,
  ].join("\n");
}

export async function searchSimilarTicketsForTicket(
  ticketId: string,
): Promise<SimilarTicketResult[] | null> {
  if (!isUuid(ticketId)) {
    return null;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: currentTicket, error: currentTicketError } = await supabase
      .from("tickets")
      .select("id, title, category, description_original")
      .eq("id", ticketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .maybeSingle();

    if (currentTicketError || !currentTicket) {
      console.error("Unable to load the current ticket for semantic search.");
      return null;
    }

    const sanitizedDescription = sanitizeTicketTextForEmbedding(
      currentTicket.description_original,
    );

    if (!sanitizedDescription) {
      return null;
    }

    const { error: sanitizationUpdateError } = await supabase
      .from("tickets")
      .update({ description_sanitized: sanitizedDescription })
      .eq("id", currentTicket.id)
      .eq("organization_id", MVP_ORGANIZATION_ID);

    if (sanitizationUpdateError) {
      console.error("Unable to save the sanitized ticket description.");
      return null;
    }

    const embedding = await generateEmbedding(
      buildEmbeddingContent({
        title: currentTicket.title,
        category: currentTicket.category,
        problem: sanitizedDescription,
      }),
    );

    const { data: matches, error: matchesError } = await supabase.rpc(
      "match_similar_tickets",
      {
        p_organization_id: MVP_ORGANIZATION_ID,
        p_query_embedding: JSON.stringify(embedding),
        p_exclude_ticket_id: currentTicket.id,
        p_match_count: 3,
      },
    );

    if (matchesError || !Array.isArray(matches)) {
      console.error("Unable to search similar tickets.");
      return null;
    }

    const validMatches = (matches as MatchRow[]).filter(
      (match) =>
        typeof match.ticket_id === "string" &&
        typeof match.similarity === "number" &&
        Number.isFinite(match.similarity),
    );
    const ticketIds = validMatches.map((match) => match.ticket_id);

    if (ticketIds.length === 0) {
      return [];
    }

    const [ticketsResult, resolutionsResult] = await Promise.all([
      supabase
        .from("tickets")
        .select("id, ticket_number, title, category, description_sanitized, status")
        .eq("organization_id", MVP_ORGANIZATION_ID)
        .in("id", ticketIds),
      supabase
        .from("ticket_resolutions")
        .select("ticket_id, cause, solution, steps, notes")
        .eq("organization_id", MVP_ORGANIZATION_ID)
        .in("ticket_id", ticketIds),
    ]);

    if (ticketsResult.error || resolutionsResult.error) {
      console.error("Unable to load similar ticket details.");
      return null;
    }

    const ticketsById = new Map(
      ((ticketsResult.data ?? []) as SimilarTicketRow[]).map((ticket) => [
        ticket.id,
        ticket,
      ]),
    );
    const resolutionsByTicketId = new Map(
      ((resolutionsResult.data ?? []) as ResolutionRow[]).map((resolution) => [
        resolution.ticket_id,
        resolution,
      ]),
    );

    return validMatches.flatMap((match) => {
      const ticket = ticketsById.get(match.ticket_id);
      const resolution = resolutionsByTicketId.get(match.ticket_id);

      if (!ticket || !resolution || !ticket.description_sanitized) {
        return [];
      }

      return [
        {
          id: `#${ticket.ticket_number}`,
          title: ticket.title,
          category: ticket.category ?? "Sem categoria",
          similarity: match.similarity * 100,
          summary: ticket.description_sanitized,
          status: "Resolvido" as const,
          reportedProblem: ticket.description_sanitized,
          identifiedCause: resolution.cause,
          appliedSolution: resolution.solution,
          steps: toSteps(resolution.steps),
          observation: resolution.notes ?? "Sem observações registradas.",
        },
      ];
    });
  } catch {
    console.error("Unable to search similar tickets.");
    return null;
  }
}
