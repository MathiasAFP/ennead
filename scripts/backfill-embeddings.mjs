import { createClient } from "@supabase/supabase-js";
import { MVP_ORGANIZATION_ID } from "../app/lib/data/mvp-organization.mjs";

const OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const EMBEDDING_MODEL = "bge-m3";
const EMBEDDING_DIMENSIONS = 1024;
const OLLAMA_TIMEOUT_MS = 60000;

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

function buildSemanticContent(ticket) {
  return [
    `Título: ${ticket.title}`,
    `Categoria: ${ticket.category ?? "Não informada"}`,
    `Problema: ${ticket.description_sanitized}`,
  ].join("\n");
}

async function generateEmbedding(content) {
  let response;

  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: content,
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

async function getResolvedTickets(supabase) {
  const { data, error } = await supabase
    .from("tickets")
    .select("id, ticket_number, title, category, description_sanitized")
    .eq("organization_id", MVP_ORGANIZATION_ID)
    .eq("status", "resolved")
    .order("ticket_number", { ascending: true });

  if (error) {
    throw new Error("Falha ao buscar tickets resolvidos no Supabase.");
  }

  return data ?? [];
}

async function upsertSemanticDocument(supabase, ticket, content, embedding) {
  const { error } = await supabase.from("semantic_documents").upsert(
    {
      ticket_id: ticket.id,
      content,
      embedding: JSON.stringify(embedding),
      embedding_model: EMBEDDING_MODEL,
    },
    { onConflict: "ticket_id" },
  );

  if (error) {
    throw new Error("Falha ao salvar documento semântico no Supabase.");
  }
}

async function countSemanticDocuments(supabase) {
  const { count, error } = await supabase
    .from("semantic_documents")
    .select("ticket_id, tickets!inner(organization_id)", {
      count: "exact",
      head: true,
    })
    .eq("tickets.organization_id", MVP_ORGANIZATION_ID);

  if (error) {
    throw new Error("Falha ao contar documentos semânticos no Supabase.");
  }

  return count ?? 0;
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
  const tickets = await getResolvedTickets(supabase);
  const ignoredTickets = [];
  let processedTickets = 0;

  for (const ticket of tickets) {
    if (!ticket.description_sanitized?.trim()) {
      ignoredTickets.push(ticket.ticket_number);
      console.log(`#${ticket.ticket_number} ignorado`);
      continue;
    }

    const content = buildSemanticContent(ticket);
    const embedding = await generateEmbedding(content);

    await upsertSemanticDocument(supabase, ticket, content, embedding);

    processedTickets += 1;
    console.log(`#${ticket.ticket_number} processado`);
  }

  const semanticDocuments = await countSemanticDocuments(supabase);

  console.log(`${processedTickets} embeddings gerados`);
  console.log(`${semanticDocuments} documentos semânticos existentes`);

  if (ignoredTickets.length > 0) {
    console.log(`Tickets ignorados: ${ignoredTickets.map((number) => `#${number}`).join(", ")}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Falha no backfill de embeddings.";

  console.error(message);
  process.exitCode = 1;
});
