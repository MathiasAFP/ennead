import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { Sidebar } from "../components/sidebar";
import { recentTickets, ticketStatusStyles } from "../components/mock-tickets";

export default function TicketsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                Chamados
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Acompanhe os atendimentos recentes da equipe de suporte.
              </p>
            </div>
            <Link
              className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              href="/chamados/novo"
            >
              <Plus size={18} />
              Novo chamado
            </Link>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">
                Todos os chamados
              </h2>
            </div>
            <div className="overflow-hidden">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase text-slate-500">
                    <th className="w-[88px] px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Chamado</th>
                    <th className="w-32 px-5 py-3 font-semibold">Categoria</th>
                    <th className="w-36 px-5 py-3 font-semibold">Status</th>
                    <th className="w-36 px-5 py-3 font-semibold">Atualização</th>
                    <th className="w-28 px-5 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <tr className="transition hover:bg-slate-50" key={ticket.id}>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {ticket.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {ticket.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {ticket.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ticket.category}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            ticketStatusStyles[ticket.status]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {ticket.updatedAt}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                          href="/chamados/analise"
                        >
                          <Eye size={17} />
                          Visualizar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
