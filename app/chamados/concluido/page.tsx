"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, FilePlus2, LayoutDashboard } from "lucide-react";
import { Sidebar } from "../../components/sidebar";

type ResolvedTicketSummary = {
  ticket: { title: string };
  resolution: {
    cause: string;
    solution: string;
    reference: { id: string; title: string; similarity: number } | null;
  };
};

type CompletionSummary = ResolvedTicketSummary & {
  indexed: boolean;
};

type ResolvedTicketStorage = {
  ticketId: string;
  indexed: boolean;
};

export default function CompletionPage() {
  const [summary, setSummary] = useState<CompletionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const storedResolution = readStorageItem<ResolvedTicketStorage>(
      "reperio:resolved-ticket",
    );

    if (!storedResolution?.ticketId) {
      const missingResolutionTimeoutId = window.setTimeout(() => {
        setIsLoading(false);
        setLoadError(true);
      }, 0);

      return () => window.clearTimeout(missingResolutionTimeoutId);
    }

    const { ticketId, indexed } = storedResolution;
    const controller = new AbortController();

    async function loadSummary() {
      try {
        const response = await fetch(
          `/api/tickets/${ticketId}/resolution`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Unable to load the resolved ticket.");
        }

        const payload = (await response.json()) as ResolvedTicketSummary;
        setSummary({ ...payload, indexed });
      } catch {
        if (!controller.signal.aborted) {
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto max-w-4xl">
          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal text-slate-950">
              Chamado resolvido
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              O atendimento foi registrado e poderá contribuir para futuras buscas por casos semelhantes.
            </p>
            {summary && !summary.indexed ? (
              <p className="mt-3 text-sm leading-5 text-amber-700">
                Chamado salvo, mas a indexação para busca semântica não pôde ser concluída.
              </p>
            ) : null}

            {isLoading ? (
              <p className="mt-7 text-sm text-slate-500">Carregando resolução registrada...</p>
            ) : loadError || !summary ? (
              <p className="mt-7 text-sm text-slate-600">
                Não foi possível carregar o resumo da resolução no momento.
              </p>
            ) : (
              <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
                <SummaryRow label="Chamado" value={summary.ticket.title} />
                <SummaryRow label="Causa" value={summary.resolution.cause} />
                <SummaryRow label="Solução" value={summary.resolution.solution} />
                <SummaryRow
                  label="Referência utilizada"
                  value={
                    summary.resolution.reference
                      ? `${summary.resolution.reference.id} · ${summary.resolution.reference.title} · ${formatSimilarity(summary.resolution.reference.similarity)} de similaridade`
                      : "Nenhuma referência informada"
                  }
                />
              </div>
            )}

            <div className="mt-7 flex items-center gap-3">
              <Link
                className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                href="/"
              >
                <LayoutDashboard size={18} />
                Voltar ao Dashboard
              </Link>
              <Link
                className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
                href="/chamados/novo"
              >
                <FilePlus2 size={18} />
                Criar novo chamado
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function formatSimilarity(similarity: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(similarity)}%`;
}

function readStorageItem<T>(key: string) {
  const storedItem = sessionStorage.getItem(key);

  if (!storedItem) {
    return null;
  }

  try {
    const parsedItem: unknown = JSON.parse(storedItem);

    return parsedItem && typeof parsedItem === "object" ? (parsedItem as T) : null;
  } catch {
    return null;
  }
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[150px_minmax(0,1fr)]">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}
