import { createClient } from "@supabase/supabase-js";
import { MVP_ORGANIZATION_ID } from "../app/lib/data/mvp-organization.mjs";

const OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const EMBEDDING_MODEL = "bge-m3";
const EMBEDDING_DIMENSIONS = 1024;
const OLLAMA_TIMEOUT_MS = 60000;
const TEST_QUERY =
  "Estação do setor financeiro não consegue localizar a impressora compartilhada, enquanto outros computadores continuam imprimindo normalmente.";

function getRequiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Configuração ausente para ${name}.`);
  }

  return value;
}

function isEmbedding(value) {
  return (
    Array.isArray(value) &&
    value.length === EMBEDDING_DIMENSIONS &&
    value.every((dimension) => typeof dimension === "number" && Number.isFinite(dimension))
  );
}

async function generateEmbedding() {
  let response;

  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: TEST_QUERY,
      }),
      signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
    });
  } catch {
    throw new Error("Ollama local indisponível.");
  }

  if (!response.ok) {
    throw new Error("Ollama local indisponível.");
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error("Resposta inválida do Ollama local.");
  }

  const embedding = Array.isArray(payload.embeddings)
    ? payload.embeddings[0]
    : undefined;

  if (!isEmbedding(embedding)) {
    throw new Error("O embedding retornado não possui 1024 dimensões válidas.");
  }

  return embedding;
}

async function findSimilarTickets(supabase, embedding) {
  const { data, error } = await supabase.rpc("match_similar_tickets", {
    p_organization_id: MVP_ORGANIZATION_ID,
    p_query_embedding: JSON.stringify(embedding),
    p_exclude_ticket_id: null,
    p_match_count: 3,
  });

  if (error) {
    throw new Error("Falha ao executar a busca semântica no Supabase.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da busca semântica.");
  }

  return data.filter(
    (result) =>
      typeof result.ticket_id === "string" &&
      typeof result.similarity === "number" &&
      Number.isFinite(result.similarity),
  );
}

async function getTicketDetails(supabase, ticketIds) {
  const [{ data: tickets, error: ticketsError }, { data: resolutions, error: resolutionsError }] =
    await Promise.all([
      supabase
        .from("tickets")
        .select("id, ticket_number, title, category")
        .in("id", ticketIds),
      supabase
        .from("ticket_resolutions")
        .select("ticket_id, cause, solution")
        .in("ticket_id", ticketIds),
    ]);

  if (ticketsError || resolutionsError) {
    throw new Error("Falha ao buscar os detalhes dos resultados no Supabase.");
  }

  const ticketsById = new Map((tickets ?? []).map((ticket) => [ticket.id, ticket]));
  const resolutionsByTicketId = new Map(
    (resolutions ?? []).map((resolution) => [resolution.ticket_id, resolution]),
  );

  return { ticketsById, resolutionsByTicketId };
}

function printResult(position, similarity, ticket, resolution) {
  console.log(`${position}. #${ticket.ticket_number}`);
  console.log(`   ${ticket.title}`);
  console.log(`   Categoria: ${ticket.category ?? "Não informada"}`);
  console.log(`   Similaridade: ${(similarity * 100).toFixed(2)}%`);
  console.log(`   Causa: ${resolution?.cause ?? "Não registrada"}`);
  console.log(`   Solução: ${resolution?.solution ?? "Não registrada"}`);
  console.log("");
}

async function main() {
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
  const embedding = await generateEmbedding();
  const matches = await findSimilarTickets(supabase, embedding);
  const ticketIds = matches.map((match) => match.ticket_id);
  const { ticketsById, resolutionsByTicketId } = await getTicketDetails(
    supabase,
    ticketIds,
  );

  matches.forEach((match, index) => {
    const ticket = ticketsById.get(match.ticket_id);

    if (!ticket) {
      return;
    }

    printResult(
      index + 1,
      match.similarity,
      ticket,
      resolutionsByTicketId.get(match.ticket_id),
    );
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Falha no teste de busca semântica.";

  console.error(message);
  process.exitCode = 1;
});
