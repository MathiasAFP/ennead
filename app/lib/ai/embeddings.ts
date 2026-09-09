import "server-only";

export const OLLAMA_BASE_URL = "http://127.0.0.1:11434";
export const EMBEDDING_MODEL = "bge-m3";
export const EMBEDDING_DIMENSIONS = 1024;

type OllamaEmbedResponse = {
  embeddings?: unknown;
};

export class EmbeddingServiceError extends Error {
  constructor() {
    super("Serviço local de embeddings indisponível.");
    this.name = "EmbeddingServiceError";
  }
}

function isEmbedding(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === EMBEDDING_DIMENSIONS &&
    value.every((dimension) => typeof dimension === "number" && Number.isFinite(dimension))
  );
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new EmbeddingServiceError();
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new EmbeddingServiceError();
    }

    const payload = (await response.json()) as OllamaEmbedResponse;
    const embedding = Array.isArray(payload.embeddings)
      ? payload.embeddings[0]
      : undefined;

    if (!isEmbedding(embedding)) {
      throw new EmbeddingServiceError();
    }

    return embedding;
  } catch (error) {
    if (error instanceof EmbeddingServiceError) {
      throw error;
    }

    throw new EmbeddingServiceError();
  }
}
