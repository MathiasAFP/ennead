import "server-only";

import { createSupabaseAdminClient } from "../supabase-admin";
import { MVP_ORGANIZATION_ID } from "./mvp-organization.mjs";

type KnowledgeBaseRow = {
  id: string;
  ticket_number: number;
  title: string;
  category: string | null;
  description_sanitized: string | null;
  resolved_at: string | null;
  ticket_resolutions: unknown;
};

type ResolutionRow = {
  cause: string;
  solution: string;
  steps: unknown;
};

export type KnowledgeBaseEntry = {
  id: string;
  ticketNumber: number;
  title: string;
  category: string | null;
  problem: string;
  cause: string;
  solution: string;
  stepsCount: number;
  resolvedAt: string | null;
};

function getResolution(value: unknown): ResolutionRow | null {
  const resolution = Array.isArray(value) ? value[0] : value;

  if (
    !resolution ||
    typeof resolution !== "object" ||
    typeof (resolution as ResolutionRow).cause !== "string" ||
    typeof (resolution as ResolutionRow).solution !== "string"
  ) {
    return null;
  }

  return resolution as ResolutionRow;
}

function countSteps(value: unknown) {
  return Array.isArray(value)
    ? value.filter((step) => typeof step === "string").length
    : 0;
}

export async function getKnowledgeBaseEntries(): Promise<KnowledgeBaseEntry[] | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id, ticket_number, title, category, description_sanitized, resolved_at, ticket_resolutions!ticket_resolutions_ticket_id_fkey!inner(cause, solution, steps)",
      )
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .eq("status", "resolved")
      .order("resolved_at", { ascending: false });

    if (error) {
      console.error("Unable to load knowledge base entries.");
      return null;
    }

    return ((data ?? []) as KnowledgeBaseRow[]).flatMap((ticket) => {
      const resolution = getResolution(ticket.ticket_resolutions);

      if (!resolution || !ticket.description_sanitized?.trim()) {
        return [];
      }

      return [
        {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          title: ticket.title,
          category: ticket.category,
          problem: ticket.description_sanitized,
          cause: resolution.cause,
          solution: resolution.solution,
          stepsCount: countSteps(resolution.steps),
          resolvedAt: ticket.resolved_at,
        },
      ];
    });
  } catch {
    console.error("Unable to load knowledge base entries.");
    return null;
  }
}
