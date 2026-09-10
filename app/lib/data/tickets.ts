import "server-only";

import { MVP_ORGANIZATION_ID } from "./mvp-organization.mjs";
import { createSupabaseAdminClient } from "../supabase-admin";

export { MVP_ORGANIZATION_ID };
const ticketColumns = "id, ticket_number, title, category, status, updated_at";

type TicketStatus = "open" | "analyzing" | "resolved";

type TicketRow = {
  id: string;
  ticket_number: number;
  title: string;
  category: string | null;
  status: TicketStatus;
  updated_at: string;
};

export type TicketListItem = {
  id: string;
  ticketNumber: number;
  title: string;
  category: string | null;
  status: TicketStatus;
  updatedAt: string;
};

export type DashboardTicketData = {
  totalTickets: number;
  activeTickets: number;
  resolutions: number;
  recentTickets: TicketListItem[];
};

type TicketDetailRow = {
  id: string;
  ticket_number: number;
  title: string;
  description_original: string;
  category: string | null;
  status: TicketStatus;
  department: string | null;
  equipment: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type TicketResolutionRow = {
  cause: string;
  solution: string;
  steps: unknown;
  notes: string | null;
  reference_ticket_id: string | null;
  reference_similarity: number | null;
};

type ReferenceTicketRow = {
  ticket_number: number;
  title: string;
};

export type TicketDetail = {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  category: string | null;
  status: TicketStatus;
  department: string | null;
  equipment: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolution: {
    cause: string;
    solution: string;
    steps: string[];
    notes: string | null;
    reference: {
      ticketNumber: number;
      title: string;
      similarity: number | null;
    } | null;
  } | null;
};

export type TicketDetailResult =
  | { kind: "available"; ticket: TicketDetail }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export type CreateTicketInput = {
  title: string;
  description: string;
  category: string | null;
  department: string | null;
  equipment: string | null;
};

export type CreatedTicket = {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  category: string | null;
  createdAt: string;
};

function toTicketListItem(ticket: TicketRow): TicketListItem {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    title: ticket.title,
    category: ticket.category,
    status: ticket.status,
    updatedAt: ticket.updated_at,
  };
}

function hasQueryError(results: Array<{ error: unknown }>) {
  return results.some((result) => result.error);
}

async function getNextTicketNumber() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("ticket_number")
    .eq("organization_id", MVP_ORGANIZATION_ID)
    .order("ticket_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to generate the next ticket number.");
  }

  // MVP-only strategy: this read-then-write flow is not safe under production concurrency.
  return (data?.ticket_number ?? 0) + 1;
}

export function formatTicketUpdatedAt(updatedAt: string) {
  return formatTicketDate(updatedAt);
}

export function formatTicketDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}

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

export async function getDashboardTicketData(): Promise<DashboardTicketData | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const [totalTickets, activeTickets, resolutions, recentTickets] =
      await Promise.all([
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", MVP_ORGANIZATION_ID),
        supabase
          .from("tickets")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", MVP_ORGANIZATION_ID)
          .in("status", ["open", "analyzing"]),
        supabase
          .from("ticket_resolutions")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", MVP_ORGANIZATION_ID),
        supabase
          .from("tickets")
          .select(ticketColumns)
          .eq("organization_id", MVP_ORGANIZATION_ID)
          .order("updated_at", { ascending: false })
          .limit(6),
      ]);

    if (hasQueryError([totalTickets, activeTickets, resolutions, recentTickets])) {
      console.error("Unable to load ticket dashboard data.");
      return null;
    }

    return {
      totalTickets: totalTickets.count ?? 0,
      activeTickets: activeTickets.count ?? 0,
      resolutions: resolutions.count ?? 0,
      recentTickets: ((recentTickets.data ?? []) as TicketRow[]).map(
        toTicketListItem,
      ),
    };
  } catch {
    console.error("Unable to load ticket dashboard data.");
    return null;
  }
}

export async function getTickets(): Promise<TicketListItem[] | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tickets")
      .select(ticketColumns)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Unable to load tickets.");
      return null;
    }

    return ((data ?? []) as TicketRow[]).map(toTicketListItem);
  } catch {
    console.error("Unable to load tickets.");
    return null;
  }
}

export async function getTicketById(ticketId: string): Promise<TicketDetailResult> {
  if (!isUuid(ticketId)) {
    return { kind: "not-found" };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(
        "id, ticket_number, title, description_original, category, status, department, equipment, created_at, updated_at, resolved_at",
      )
      .eq("id", ticketId)
      .eq("organization_id", MVP_ORGANIZATION_ID)
      .maybeSingle();

    if (ticketError) {
      console.error("Unable to load the ticket detail.");
      return { kind: "unavailable" };
    }

    if (!ticket) {
      return { kind: "not-found" };
    }

    const ticketDetail = ticket as TicketDetailRow;
    let resolution: TicketDetail["resolution"] = null;

    if (ticketDetail.status === "resolved") {
      const { data: resolutionRow, error: resolutionError } = await supabase
        .from("ticket_resolutions")
        .select(
          "cause, solution, steps, notes, reference_ticket_id, reference_similarity",
        )
        .eq("ticket_id", ticketDetail.id)
        .eq("organization_id", MVP_ORGANIZATION_ID)
        .maybeSingle();

      if (resolutionError) {
        console.error("Unable to load the ticket resolution detail.");
        return { kind: "unavailable" };
      }

      if (resolutionRow) {
        const typedResolution = resolutionRow as TicketResolutionRow;
        let reference: TicketDetail["resolution"] extends infer Resolution
          ? Resolution extends { reference: infer Reference }
            ? Reference
            : never
          : never = null;

        if (typedResolution.reference_ticket_id) {
          const { data: referenceTicket, error: referenceTicketError } = await supabase
            .from("tickets")
            .select("ticket_number, title")
            .eq("id", typedResolution.reference_ticket_id)
            .eq("organization_id", MVP_ORGANIZATION_ID)
            .maybeSingle();

          if (referenceTicketError) {
            console.error("Unable to load the resolution reference.");
            return { kind: "unavailable" };
          }

          if (referenceTicket) {
            const typedReference = referenceTicket as ReferenceTicketRow;
            reference = {
              ticketNumber: typedReference.ticket_number,
              title: typedReference.title,
              similarity: typedResolution.reference_similarity,
            };
          }
        }

        resolution = {
          cause: typedResolution.cause,
          solution: typedResolution.solution,
          steps: toSteps(typedResolution.steps),
          notes: typedResolution.notes,
          reference,
        };
      }
    }

    return {
      kind: "available",
      ticket: {
        id: ticketDetail.id,
        ticketNumber: ticketDetail.ticket_number,
        title: ticketDetail.title,
        description: ticketDetail.description_original,
        category: ticketDetail.category,
        status: ticketDetail.status,
        department: ticketDetail.department,
        equipment: ticketDetail.equipment,
        createdAt: ticketDetail.created_at,
        updatedAt: ticketDetail.updated_at,
        resolvedAt: ticketDetail.resolved_at,
        resolution,
      },
    };
  } catch {
    console.error("Unable to load the ticket detail.");
    return { kind: "unavailable" };
  }
}

export async function createTicket(
  input: CreateTicketInput,
): Promise<CreatedTicket | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const ticketNumber = await getNextTicketNumber();
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        organization_id: MVP_ORGANIZATION_ID,
        ticket_number: ticketNumber,
        title: input.title,
        description_original: input.description,
        description_sanitized: null,
        category: input.category,
        status: "analyzing",
        department: input.department,
        equipment: input.equipment,
      })
      .select("id, ticket_number, title, description_original, category, created_at")
      .single();

    if (error || !data) {
      console.error("Unable to create ticket.");
      return null;
    }

    return {
      id: data.id,
      ticketNumber: data.ticket_number,
      title: data.title,
      description: data.description_original,
      category: data.category,
      createdAt: data.created_at,
    };
  } catch {
    console.error("Unable to create ticket.");
    return null;
  }
}
