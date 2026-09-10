"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";

import type { KnowledgeBaseEntry } from "../lib/data/knowledge-base";

type KnowledgeBaseListProps = {
  entries: KnowledgeBaseEntry[];
};

export function KnowledgeBaseList({ entries }: KnowledgeBaseListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () =>
      Array.from(
        new Set(entries.map((entry) => entry.category ?? "Sem categoria")),
      ).sort((firstCategory, secondCategory) =>
        firstCategory.localeCompare(secondCategory, "pt-BR"),
      ),
    [entries],
  );
  const normalizedSearch = normalizeSearchValue(search);
  const filteredEntries = entries.filter((entry) => {
    const matchesCategory =
      category === "all" || (entry.category ?? "Sem categoria") === category;
    const searchableText = [
      entry.title,
      entry.category,
      entry.problem,
      entry.cause,
      entry.solution,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      matchesCategory &&
      (!normalizedSearch || normalizeSearchValue(searchableText).includes(normalizedSearch))
    );
  });

  return (
    <>
      <section className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <label className="sr-only" htmlFor="knowledge-search">
            Buscar conhecimentos
          </label>
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="knowledge-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar problema, solução ou categoria..."
            type="search"
            value={search}
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="text-slate-400" size={18} />
          <label className="sr-only" htmlFor="knowledge-category">
            Filtrar por categoria
          </label>
          <select
            className="h-11 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="knowledge-category"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="all">Todas</option>
            {categories.map((availableCategory) => (
              <option key={availableCategory} value={availableCategory}>
                {availableCategory}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredEntries.length > 0 ? (
        <section className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          {filteredEntries.map((entry) => (
            <article className="px-5 py-5" key={entry.id}>
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
                    <span>#{entry.ticketNumber}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{entry.category ?? "Sem categoria"}</span>
                    {entry.resolvedAt ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{formatResolvedAt(entry.resolvedAt)}</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-slate-950">{entry.title}</h2>
                </div>
                <Link
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  href={`/chamados/${entry.id}`}
                >
                  Ver detalhes
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <section className="mt-4 max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Problema
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">{entry.problem}</p>
              </section>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <section className="border-l-2 border-blue-500 bg-blue-50/40 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Solução aplicada</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-700">{entry.solution}</p>
                </section>
                <section className="px-1 py-1">
                  <p className="text-sm font-semibold text-slate-800">Causa identificada</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{entry.cause}</p>
                  {entry.stepsCount > 0 ? (
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {entry.stepsCount} {entry.stepsCount === 1 ? "passo registrado" : "passos registrados"}
                    </p>
                  ) : null}
                </section>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-700">
            Nenhum conhecimento encontrado para esta busca.
          </p>
        </section>
      )}
    </>
  );
}

function normalizeSearchValue(value: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function formatResolvedAt(resolvedAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(resolvedAt));
}
