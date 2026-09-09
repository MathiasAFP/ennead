"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, SearchCheck } from "lucide-react";
import { Sidebar } from "../../components/sidebar";

type TicketAnalysis = {
  title: string;
  description: string;
  category?: string;
};

export default function TicketAnalysisPage() {
  const [ticket, setTicket] = useState<TicketAnalysis | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedTicket = sessionStorage.getItem("reperio:ticket-analysis");

      if (!storedTicket) {
        return;
      }

      try {
        setTicket(JSON.parse(storedTicket) as TicketAnalysis);
      } catch {
        setTicket(null);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                Analisando chamado
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Procurando atendimentos anteriores semelhantes...
              </p>
            </div>

            <Link
              className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
              href="/"
            >
              <ArrowLeft size={18} />
              Voltar ao Dashboard
            </Link>
          </header>

          <section className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <LoaderCircle className="animate-spin" size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SearchCheck size={18} className="text-blue-600" />
                  <p className="text-sm font-semibold text-blue-700">
                    Análise em andamento
                  </p>
                </div>

                <h2 className="mt-4 text-xl font-semibold tracking-normal text-slate-950">
                  {ticket?.title ?? "Chamado não informado"}
                </h2>
                {ticket?.category ? (
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Categoria: {ticket.category}
                  </p>
                ) : null}
                <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
                  {ticket?.description ??
                    "Volte ao formulário para informar os dados do chamado."}
                </p>

                <p className="mt-5 text-sm text-slate-500">
                  Procurando atendimentos anteriores semelhantes...
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
