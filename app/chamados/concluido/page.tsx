"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, FilePlus2, LayoutDashboard } from "lucide-react";
import { Sidebar } from "../../components/sidebar";

type Ticket = {
  title: string;
};

type ReferenceCase = {
  id: string;
  title: string;
  similarity: number;
};

type Resolution = {
  cause: string;
  solution: string;
};

export default function CompletionPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [referenceCase, setReferenceCase] = useState<ReferenceCase | null>(null);
  const [resolution, setResolution] = useState<Resolution | null>(null);

  useEffect(() => {
    const storageTimeoutId = window.setTimeout(() => {
      setTicket(readStorageItem<Ticket>("reperio:ticket-analysis"));
      setReferenceCase(readStorageItem<ReferenceCase>("reperio:reference-case"));
      setResolution(readStorageItem<Resolution>("reperio:ticket-resolution"));
    }, 0);

    return () => window.clearTimeout(storageTimeoutId);
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

            <div className="mt-7 divide-y divide-slate-100 border-y border-slate-100">
              <SummaryRow
                label="Chamado"
                value={ticket?.title ?? "Chamado não informado"}
              />
              <SummaryRow
                label="Causa"
                value={resolution?.cause ?? "Causa não informada"}
              />
              <SummaryRow
                label="Solução"
                value={resolution?.solution ?? "Solução não informada"}
              />
              <SummaryRow
                label="Referência utilizada"
                value={
                  referenceCase
                    ? `${referenceCase.id} · ${referenceCase.title} · ${referenceCase.similarity}% de similaridade`
                    : "Nenhuma referência informada"
                }
              />
            </div>

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
