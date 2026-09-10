import "server-only";

import { EMBEDDING_MODEL, generateEmbedding } from "../ai/embeddings";
import { sanitizeTicketTextForEmbedding } from "../privacy/sanitize-ticket-text";
import { createSupabaseAdminClient } from "../supabase-admin";
import { MVP_ORGANIZATION_ID } from "./mvp-organization.mjs";

type TicketForResolution = {
  id: string;
  title: string;
  category: string | null;
  description_original: string;
  description_sanitized: string | null;
};

type ResolutionSummaryRow = {
  cause: string;
  solution: string;
  reference_ticket_id: string | null;
  reference_similarity: number | null;
};

type ReferenceTicketRow = {
  ticket_number: number;
  title: string;
};

export type SaveResolutionInput = {
  ticketId: string;
  cause: string;
  solution: string;
  steps: string[];
  notes: string | null;
  referenceTicketId: string;
  referenceSimilarity: number;
};

export type SavedResolution = {
  ticketId: string;
  indexed: boolean;
};

export type ResolvedTicketSummary = {
  ticket: {
    title: string;
  };
  resolution: {
    cause: string;
    solution: string;
    reference: {
      id: string;
      title: string;
      similarity: number;
    } | null;
  };
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildEmbeddingContent(ticket: TicketForResolution, problem: string) {
  return [
    `Título: ${sanitizeTicketTextForEmbedding(ticket.title)}`,
    `Categoria: ${sanitizeTicketTextForEmbedding(ticket.category ?? "Não informada")}`,
    `Problema: ${problem}`,
  ].join("\n");
}

async function indexResolvedTicket(ticket: TicketForResolution) {
  const sanitizedDescription = sanitizeTicketTextForEmbedding(
    ticket.description_original,
  );

  if (!sanitizedDescription) {
    return false;
  }

  try {
    const supabase = createSupabaseAdminClient();

    if (ticket.description_sanitized !== sanitizedDescription) {
      const { error: sanitizationError } = await supabase
        .from("tickets")
        .update({ description_sanitized: sanitizedDescription })
        .eq("id", ticket.id)
        .eq("organization_id", MVP_ORGANIZATION_ID);

      if (sanitizationError) {
        console.error("Unable to save the sanitized resolved ticket description.", {
          ticketId: ticket.id,
        });
        return false;
      }
    }

    const embedding = await generateEmbedding(
      buildEmbeddingContent(ticket, sanitizedDescription),
    );
    const { error: semanticDocumentError } = await supabase
      .from("semantic_documents")
      .upsert(
        {
          ticket_id: ticket.id,
          content: buildEmbeddingContent(ticket, sanitizedDescription),
          embedding: JSON.stringify(embedding),
          embedding_model: EMBEDDING_MODEL,
        },
        { onConflict: "ticket_id" },
      );

    if (semanticDocumentError) {
      console.error("Unable to index the resolved ticket.", { ticketId: ticket.id });
      return false;
    }

    return true;
  } catch {
    console.error("Unable to index the resolved ticket.", { ticketId: ticket.id });
    return false;
  }
}

export async function saveTicketResolution(
  input: SaveResolutionInput,
): Promise<SavedResolution | null> {
  if (!isUuid(input.ticketId) || !isUuid(input.referenceTicketId)) {
    return null;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, title, category, description_original, description_sanitized")
      .eq("id", input.ticketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .in("status", ["open", "analyzing"])
      .maybeSingle();

    if (ticketError || !ticket) {
      console.error("Unable to load the ticket for resolution.", {
        ticketId: input.ticketId,
      });
      return null;
    }

    const { data: referenceTicket, error: referenceTicketError } = await supabase
      .from("tickets")
      .select("id")
      .eq("id", input.referenceTicketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .eq("status", "resolved")
      .maybeSingle();

    if (referenceTicketError || !referenceTicket) {
      console.error("Unable to validate the resolution reference.", {
        ticketId: input.ticketId,
      });
      return null;
    }

    const { error: resolutionError } = await supabase
      .from("ticket_resolutions")
      .insert({
        organization_id: MVP_ORGANIZATION_ID,
        ticket_id: input.ticketId,
        cause: input.cause,
        solution: input.solution,
        steps: input.steps,
        notes: input.notes,
        reference_ticket_id: input.referenceTicketId,
        reference_similarity: input.referenceSimilarity / 100,
      });

    if (resolutionError) {
      console.error("Unable to save the ticket resolution.", {
        ticketId: input.ticketId,
      });
      return null;
    }

    const { data: resolvedTicket, error: ticketUpdateError } = await supabase
      .from("tickets")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
      })
      .eq("id", input.ticketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .in("status", ["open", "analyzing"])
      .select("id, title, category, description_original, description_sanitized")
      .maybeSingle();

    if (ticketUpdateError || !resolvedTicket) {
      const { error: rollbackError } = await supabase
        .from("ticket_resolutions")
        .delete()
        .eq("ticket_id", input.ticketId)
        .eq("organization_id", MVP_ORGANIZATION_ID);

      if (rollbackError) {
        console.error("Unable to roll back the ticket resolution.", {
          ticketId: input.ticketId,
        });
      }

      console.error("Unable to mark the ticket as resolved.", {
        ticketId: input.ticketId,
      });
      return null;
    }

    const indexed = await indexResolvedTicket(resolvedTicket as TicketForResolution);

    return { ticketId: resolvedTicket.id, indexed };
  } catch {
    console.error("Unable to save the ticket resolution.", { ticketId: input.ticketId });
    return null;
  }
}

export async function getResolvedTicketSummary(
  ticketId: string,
): Promise<ResolvedTicketSummary | null> {
  if (!isUuid(ticketId)) {
    return null;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, title")
      .eq("id", ticketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .eq("status", "resolved")
      .maybeSingle();

    if (ticketError || !ticket) {
      return null;
    }

    const { data: resolution, error: resolutionError } = await supabase
      .from("ticket_resolutions")
      .select("cause, solution, reference_ticket_id, reference_similarity")
      .eq("ticket_id", ticket.id)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .maybeSingle();

    if (resolutionError || !resolution) {
      return null;
    }

    let reference: ResolvedTicketSummary["resolution"]["reference"] = null;

    if (resolution.reference_ticket_id) {
      const referenceTicketId = resolution.reference_ticket_id;
      const referenceSimilarity = (resolution as ResolutionSummaryRow)
        .reference_similarity;
      const { data: referenceTicket, error: referenceTicketError } = await supabase
        .from("tickets")
        .select("ticket_number, title")
        .eq("id", referenceTicketId)
        .eq("organization_id", MVP_ORGANIZATION_ID)
        .maybeSingle();

      if (referenceTicketError || !referenceTicket) {
        return null;
      }

      reference = {
        id: `#${(referenceTicket as ReferenceTicketRow).ticket_number}`,
        title: (referenceTicket as ReferenceTicketRow).title,
        similarity: referenceSimilarity === null ? 0 : referenceSimilarity * 100,
      };
    }

    return {
      ticket: { title: ticket.title },
      resolution: {
        cause: (resolution as ResolutionSummaryRow).cause,
        solution: (resolution as ResolutionSummaryRow).solution,
        reference,
      },
    };
  } catch {
    console.error("Unable to load the resolved ticket summary.", { ticketId });
    return null;
  }
}
