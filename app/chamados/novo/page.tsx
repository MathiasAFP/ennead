import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "../../components/sidebar";
import { NewTicketForm } from "./new-ticket-form";

export default function NewTicketPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                Novo chamado
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Descreva o problema para encontrar atendimentos anteriores
                semelhantes.
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

          <NewTicketForm />
        </div>
      </section>
    </main>
  );
}
