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
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(updatedAt));
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
