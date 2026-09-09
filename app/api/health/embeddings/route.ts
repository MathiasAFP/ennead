import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  generateEmbedding,
} from "../../../lib/ai/embeddings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await generateEmbedding("Teste de conectividade do sistema");

    return Response.json({
      connected: true,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    });
  } catch {
    return Response.json(
      {
        connected: false,
        message: "Serviço local de embeddings indisponível.",
      },
      { status: 503 },
    );
  }
}
