import { BookOpen, FileStack } from "lucide-react";
import { Sidebar } from "../components/sidebar";

export default function KnowledgeBasePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Base de conhecimento" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              Base de conhecimento
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Consulte soluções registradas em atendimentos anteriores.
            </p>
          </header>

          <section className="flex max-w-3xl items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileStack size={21} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="text-base font-semibold text-slate-950">
                  Registros em preparação
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Os registros estruturados dos chamados resolvidos serão exibidos aqui futuramente.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
