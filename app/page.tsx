import {
  CheckCircle2,
  Clock3,
  History,
  MoreHorizontal,
  Plus,
  Search,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./components/sidebar";
import { ticketStatusLabels, ticketStatusStyles } from "./components/ticket-status";
import {
  formatTicketUpdatedAt,
  getDashboardTicketData,
} from "./lib/data/tickets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboardData = await getDashboardTicketData();
  const indicators = dashboardData
    ? [
        {
          label: "Total de chamados",
          value: dashboardData.totalTickets,
          detail: "Chamados registrados",
          icon: Ticket,
        },
        {
          label: "Chamados ativos",
          value: dashboardData.activeTickets,
          detail: "Abertos e em análise",
          icon: Clock3,
        },
        {
          label: "Resoluções registradas",
          value: dashboardData.resolutions,
          detail: "Históricos estruturados",
          icon: CheckCircle2,
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Dashboard" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                Visão geral
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Acompanhe os chamados e encontre rapidamente soluções
                anteriores.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Buscar"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
                type="button"
              >
                <Search size={19} />
              </button>
              <Link
                className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700"
                href="/chamados/novo"
              >
                <Plus size={18} />
                Novo chamado
              </Link>
            </div>
          </header>

          {dashboardData ? (
            <>
              <section className="grid grid-cols-3 gap-4">
                {indicators.map((indicator) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50"
                    key={indicator.label}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {indicator.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
                          {indicator.value}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-blue-600">
                        <indicator.icon size={20} />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                      {indicator.detail}
                    </p>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-5">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">
                        Chamados recentes
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Últimos atendimentos registrados pela equipe.
                      </p>
                    </div>
                    <Link
                      className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
                      href="/chamados"
                    >
                      Ver todos
                    </Link>
                  </div>

                  <div className="overflow-hidden">
                    <table className="w-full table-fixed border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase text-slate-500">
                          <th className="w-[72px] px-4 py-3 font-semibold">
                            ID
                          </th>
                          <th className="px-4 py-3 font-semibold">Chamado</th>
                          <th className="w-28 px-4 py-3 font-semibold">
                            Categoria
                          </th>
                          <th className="w-32 px-4 py-3 font-semibold">
                            Status
                          </th>
                          <th className="w-32 px-4 py-3 font-semibold">
                            Atualizado
                          </th>
                          <th className="w-14 px-4 py-3 font-semibold">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboardData.recentTickets.map((ticket) => (
                          <tr
                            className="bg-white transition hover:bg-slate-50"
                            key={ticket.id}
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-slate-500">
                              #{ticket.ticketNumber}
                            </td>
                            <td className="px-4 py-3">
                              <p className="truncate text-sm font-semibold text-slate-950">
                                {ticket.title}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {ticket.category ?? "Sem categoria"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  ticketStatusStyles[ticket.status]
                                }`}
                              >
                                {ticketStatusLabels[ticket.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {formatTicketUpdatedAt(ticket.updatedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                aria-label={`Abrir ações do chamado ${ticket.ticketNumber}`}
                                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                type="button"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <aside className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <History size={21} />
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">
                      Conhecimento recuperado
                    </p>
                    <h2 className="mt-2 text-xl font-semibold leading-7 tracking-normal text-slate-950">
                      {dashboardData.resolutions} resoluções estruturadas ajudam
                      a recuperar o conhecimento da equipe.
                    </h2>
                    <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      <Clock3 size={17} className="text-blue-600" />
                      Histórico organizado para apoiar novas resoluções.
                    </div>
                  </div>
                </aside>
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm shadow-slate-200/60">
              <p className="text-sm font-medium text-slate-700">
                Não foi possível carregar os chamados no momento.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
