"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  ListChecks,
  MessageSquareText,
  SearchCheck,
  Wrench,
} from "lucide-react";
import { Sidebar } from "../../components/sidebar";

type TicketAnalysis = {
  ticketId?: string;
  ticketNumber?: number;
  title: string;
  description: string;
  category?: string;
};

type SimilarCase = {
  ticketId: string;
  id: string;
  title: string;
  category: string;
  similarity: number;
  summary: string;
  status: "Resolvido";
  reportedProblem: string;
  identifiedCause: string;
  appliedSolution: string;
  steps: string[];
  observation: string;
};

export default function TicketAnalysisPage() {
  const [ticket, setTicket] = useState<TicketAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [referenceCaseId, setReferenceCaseId] = useState<string | null>(null);
  const [isSearchUnavailable, setIsSearchUnavailable] = useState(false);
  const detailsScrollRef = useRef<HTMLDivElement>(null);

  const runSemanticSearch = useCallback(async (ticketId: string) => {
    setIsAnalyzing(true);
    setIsSearchUnavailable(false);
    setReferenceCaseId(null);
    sessionStorage.removeItem("reperio:reference-case");

    try {
      const response = await fetch(`/api/tickets/${ticketId}/similar`, {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error("Semantic search is unavailable.");
      }

      const payload = (await response.json()) as {
        similarTickets?: SimilarCase[];
      };

      if (!Array.isArray(payload.similarTickets)) {
        throw new Error("Semantic search returned an invalid response.");
      }

      setSimilarCases(payload.similarTickets);
      setSelectedCaseId(payload.similarTickets[0]?.id ?? null);
    } catch {
      setSimilarCases([]);
      setSelectedCaseId(null);
      setIsSearchUnavailable(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const storageTimeoutId = window.setTimeout(() => {
      const storedTicket = sessionStorage.getItem("reperio:ticket-analysis");

      if (!storedTicket) {
        setIsSearchUnavailable(true);
        setIsAnalyzing(false);
        return;
      }

      try {
        const parsedTicket = JSON.parse(storedTicket) as TicketAnalysis;
        setTicket(parsedTicket);

        if (!parsedTicket.ticketId) {
          setIsSearchUnavailable(true);
          setIsAnalyzing(false);
          return;
        }

        void runSemanticSearch(parsedTicket.ticketId);
      } catch {
        setIsSearchUnavailable(true);
        setIsAnalyzing(false);
      }
    }, 0);

    return () => window.clearTimeout(storageTimeoutId);
  }, [runSemanticSearch]);

  useEffect(() => {
    detailsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [selectedCaseId]);

  const selectedCase = similarCases.find(
    (similarCase) => similarCase.id === selectedCaseId,
  );
  const hasSelectedReference = referenceCaseId !== null;

  function handleUseAsReference() {
    if (!selectedCase) {
      return;
    }

    setReferenceCaseId(selectedCase.id);
    sessionStorage.setItem("reperio:reference-case", JSON.stringify(selectedCase));
  }

  function handleChangeReference() {
    setReferenceCaseId(null);
    sessionStorage.removeItem("reperio:reference-case");
  }

  function selectNextCase() {
    if (!selectedCase || similarCases.length === 0) {
      return;
    }

    const currentCaseIndex = similarCases.findIndex(
      (similarCase) => similarCase.id === selectedCase.id,
    );
    const nextCase = similarCases[(currentCaseIndex + 1) % similarCases.length];

    setSelectedCaseId(nextCase.id);
  }

  return (
    <main className="h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 h-screen px-6 py-5">
        <div className="mx-auto flex h-full max-w-7xl flex-col gap-5">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                {isAnalyzing
                  ? "Analisando chamado"
                  : isSearchUnavailable
                    ? "Busca semântica indisponível"
                    : "Casos semelhantes encontrados"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {isAnalyzing
                  ? "Procurando atendimentos anteriores semelhantes..."
                  : isSearchUnavailable
                    ? "Busca semântica indisponível no momento."
                    : "Encontramos atendimentos anteriores que podem ajudar na investigação deste chamado."}
              </p>
            </div>

            <Link
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
              href="/"
            >
              <ArrowLeft size={18} />
              Voltar ao Dashboard
            </Link>
          </header>

          {isAnalyzing ? (
            <AnalysisLoadingState ticket={ticket} />
          ) : isSearchUnavailable ? (
            <SemanticSearchUnavailable
              canRetry={Boolean(ticket?.ticketId)}
              onRetry={() => {
                if (ticket?.ticketId) {
                  void runSemanticSearch(ticket.ticketId);
                }
              }}
              ticket={ticket}
            />
          ) : !selectedCase ? (
            <NoSimilarTickets ticket={ticket} />
          ) : (
            <section className="flex min-h-0 flex-1 flex-col gap-4">
              <CurrentTicketSummary ticket={ticket} />

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Casos semelhantes
                </p>
                <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {similarCases.length} casos encontrados
                </p>
              </div>

              <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(440px,1.15fr)]">
                <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
                  {similarCases.map((similarCase) => {
                    const isSelected = similarCase.id === selectedCase.id;

                    return (
                      <button
                        aria-pressed={isSelected}
                        className={`w-full rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                          isSelected
                            ? "border-blue-300 bg-blue-50/60 shadow-blue-900/5"
                            : "border-slate-200 bg-white shadow-slate-200/60 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                        key={similarCase.id}
                        onClick={() => setSelectedCaseId(similarCase.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <span>{similarCase.id}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>{similarCase.category}</span>
                            </div>
                            <h2 className="mt-2 text-base font-semibold leading-6 text-slate-950">
                              {similarCase.title}
                            </h2>
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                          {similarCase.summary}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            {similarCase.status}
                          </span>
                          <span className="flex items-center gap-1 text-sm font-semibold text-blue-700">
                            {formatSimilarity(similarCase.similarity)} similar
                            <ChevronRight size={16} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <CaseDetails
                  detailsScrollRef={detailsScrollRef}
                  hasSelectedReference={hasSelectedReference}
                  onChangeReference={handleChangeReference}
                  onSelectNextCase={selectNextCase}
                  onUseAsReference={handleUseAsReference}
                  similarCase={selectedCase}
                />
              </div>
            </section>
          )}
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

function AnalysisLoadingState({ ticket }: { ticket: TicketAnalysis | null }) {
  return (
    <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <LoaderCircle className="animate-spin" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SearchCheck className="text-blue-600" size={18} />
            <p className="text-sm font-semibold text-blue-700">
              Análise em andamento
            </p>
          </div>
          <div className="mt-4 h-6 w-3/5 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="sr-only">
            {ticket?.title ?? "Carregando informações do chamado"}
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Procurando atendimentos anteriores semelhantes...
          </p>
        </div>
      </div>
    </section>
  );
}

function SemanticSearchUnavailable({
  ticket,
  canRetry,
  onRetry,
}: {
  ticket: TicketAnalysis | null;
  canRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="max-w-3xl space-y-5">
      <CurrentTicketSummary ticket={ticket} />
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <CircleAlert size={24} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Busca semântica indisponível no momento.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Verifique o serviço local e tente novamente para continuar o atendimento.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {canRetry ? (
                <button
                  className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  onClick={onRetry}
                  type="button"
                >
                  <SearchCheck size={18} />
                  Tentar novamente
                </button>
              ) : null}
              <Link
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
                href="/chamados/novo"
              >
                <ArrowLeft size={17} />
                Voltar ao chamado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoSimilarTickets({ ticket }: { ticket: TicketAnalysis | null }) {
  return (
    <section className="max-w-3xl space-y-5">
      <CurrentTicketSummary ticket={ticket} />
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <h2 className="text-base font-semibold text-slate-950">
          Nenhum caso semelhante foi encontrado
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Não há atendimentos resolvidos suficientes para esta busca no momento.
        </p>
      </div>
    </section>
  );
}

function CurrentTicketSummary({ ticket }: { ticket: TicketAnalysis | null }) {
  return (
    <section className="flex items-start gap-3 border-l-2 border-blue-500 bg-white px-4 py-3 shadow-sm shadow-slate-200/50">
      <FileText className="mt-0.5 shrink-0 text-blue-600" size={18} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chamado atual
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-slate-950">
            {ticket?.title ?? "Chamado não informado"}
          </h2>
          {ticket?.category ? (
            <span className="text-xs font-medium text-slate-500">
              {ticket.category}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-1 text-sm leading-5 text-slate-600">
          {ticket?.description ??
            "Volte ao formulário para informar os dados do chamado."}
        </p>
      </div>
    </section>
  );
}

type CaseDetailsProps = {
  detailsScrollRef: React.RefObject<HTMLDivElement | null>;
  similarCase: SimilarCase;
  hasSelectedReference: boolean;
  onChangeReference: () => void;
  onUseAsReference: () => void;
  onSelectNextCase: () => void;
};

function CaseDetails({
  detailsScrollRef,
  similarCase,
  hasSelectedReference,
  onChangeReference,
  onUseAsReference,
  onSelectNextCase,
}: CaseDetailsProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="shrink-0 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">{similarCase.id}</p>
            <h2 className="mt-1 text-lg font-semibold leading-6 text-slate-950">
              {similarCase.title}
            </h2>
          </div>
          <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {formatSimilarity(similarCase.similarity)}
            <span className="ml-1 font-medium">similaridade</span>
          </span>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"
        ref={detailsScrollRef}
      >
        <DetailSection
          icon={MessageSquareText}
          label="Problema relatado"
          text={similarCase.reportedProblem}
        />
        <DetailSection
          emphasis
          icon={CircleAlert}
          label="Causa identificada"
          text={similarCase.identifiedCause}
        />
        <DetailSection
          emphasis
          icon={Wrench}
          label="Solução utilizada"
          text={similarCase.appliedSolution}
        />
        <section>
          <div className="flex items-center gap-2 text-slate-900">
            <ListChecks className="text-slate-500" size={17} />
            <h3 className="text-sm font-semibold">Passos executados</h3>
          </div>
          <ol className="mt-2.5 space-y-2">
            {similarCase.steps.map((step, index) => (
              <li className="flex gap-3 text-sm leading-5 text-slate-600" key={step}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
        <DetailSection label="Observações" text={similarCase.observation} />
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
        {hasSelectedReference ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            Referência selecionada
          </div>
        ) : null}
        <p className="mb-4 text-sm leading-5 text-slate-500">
          Use este histórico como apoio. Confirme a causa antes de aplicar qualquer solução.
        </p>
        <div className="flex items-center gap-3">
          {hasSelectedReference ? (
            <>
              <Link
                className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                href="/chamados/resolucao"
              >
                Continuar para resolução
                <ArrowRight size={18} />
              </Link>
              <button
                className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
                onClick={onChangeReference}
                type="button"
              >
                Trocar referência
                <ChevronRight size={17} />
              </button>
            </>
          ) : (
            <>
              <button
                className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                onClick={onUseAsReference}
                type="button"
              >
                <ClipboardCheck size={18} />
                Usar como referência
              </button>
              <button
                className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
                onClick={onSelectNextCase}
                type="button"
              >
                Ver próximo caso
                <ChevronRight size={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function DetailSection({
  label,
  text,
  emphasis = false,
  icon: Icon,
}: {
  label: string;
  text: string;
  emphasis?: boolean;
  icon?: typeof FileText;
}) {
  return (
    <section
      className={
        emphasis
          ? "rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-3"
          : undefined
      }
    >
      <div className="flex items-center gap-2 text-slate-900">
        {Icon ? (
          <Icon
            className={emphasis ? "text-blue-600" : "text-slate-500"}
            size={17}
          />
        ) : null}
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      <p className="mt-1.5 text-sm leading-5 text-slate-600">{text}</p>
    </section>
  );
}
