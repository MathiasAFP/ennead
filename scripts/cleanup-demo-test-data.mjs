import { createClient } from "@supabase/supabase-js";

import { MVP_ORGANIZATION_ID } from "../app/lib/data/mvp-organization.mjs";

const DEMO_TICKET_LIMIT = 1048;
const EXPECTED_COUNTS = {
  tickets: 11,
  resolutions: 8,
  semanticDocuments: 8,
};

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Configuração ausente para ${name}.`);
  }

  return value;
}

function shouldApplyCleanup() {
  const argumentsList = process.argv.slice(2);

  if (argumentsList.length === 0) {
    return false;
  }

  if (argumentsList.length === 1 && argumentsList[0] === "--apply") {
    return true;
  }

  throw new Error("Use apenas --apply para confirmar a exclusão.");
}

async function getTestTickets(supabase) {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, ticket_number")
    .eq("organization_id", MVP_ORGANIZATION_ID)
    .gt("ticket_number", DEMO_TICKET_LIMIT)
    .order("ticket_number", { ascending: true });

  if (error) {
    throw new Error("Não foi possível consultar os tickets de teste.");
  }

  return data ?? [];
}

async function deleteTestTickets(supabase) {
  // The database foreign keys cascade related resolutions and semantic documents.
  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("organization_id", MVP_ORGANIZATION_ID)
    .gt("ticket_number", DEMO_TICKET_LIMIT);

  if (error) {
    throw new Error("Não foi possível remover os tickets de teste.");
  }
}

async function getCurrentCounts(supabase) {
  const [tickets, resolutions, semanticDocuments] = await Promise.all([
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", MVP_ORGANIZATION_ID),
    supabase
      .from("ticket_resolutions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", MVP_ORGANIZATION_ID),
    supabase
      .from("semantic_documents")
      .select("ticket_id, tickets!inner(organization_id)", {
        count: "exact",
        head: true,
      })
      .eq("tickets.organization_id", MVP_ORGANIZATION_ID),
  ]);

  if (tickets.error || resolutions.error || semanticDocuments.error) {
    throw new Error("Não foi possível verificar as contagens após a exclusão.");
  }

  return {
    tickets: tickets.count ?? 0,
    resolutions: resolutions.count ?? 0,
    semanticDocuments: semanticDocuments.count ?? 0,
  };
}

function printTicketNumbers(tickets) {
  if (tickets.length === 0) {
    console.log("Nenhum ticket de teste encontrado.");
    return;
  }

  console.log(`${tickets.length} tickets de teste encontrados:`);
  tickets.forEach((ticket) => console.log(`#${ticket.ticket_number}`));
}

function printCounts(counts) {
  console.log("Contagens após a exclusão:");
  console.log(`tickets: ${counts.tickets}`);
  console.log(`ticket_resolutions: ${counts.resolutions}`);
  console.log(`semantic_documents: ${counts.semanticDocuments}`);

  const matchesExpectedCounts =
    counts.tickets === EXPECTED_COUNTS.tickets &&
    counts.resolutions === EXPECTED_COUNTS.resolutions &&
    counts.semanticDocuments === EXPECTED_COUNTS.semanticDocuments;

  if (!matchesExpectedCounts) {
    console.log("As contagens diferem do esperado; nenhum ajuste automático foi realizado.");
  }
}

async function main() {
  const applyCleanup = shouldApplyCleanup();
  const supabase = createClient(
    getRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnvironmentVariable("SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const testTickets = await getTestTickets(supabase);

  printTicketNumbers(testTickets);

  if (!applyCleanup) {
    console.log("Nenhum dado foi removido.");
    console.log("Use --apply para confirmar a exclusão.");
    return;
  }

  if (testTickets.length === 0) {
    console.log("Nenhum dado foi removido.");
    return;
  }

  await deleteTestTickets(supabase);
  console.log("Tickets de teste removidos. Resoluções e documentos semânticos associados foram removidos por cascata.");
  printCounts(await getCurrentCounts(supabase));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Falha ao limpar dados de teste.";

  console.error(message);
  process.exitCode = 1;
});
