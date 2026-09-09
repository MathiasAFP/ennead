import { Settings } from "lucide-react";
import { Sidebar } from "../components/sidebar";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Configurações" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              Configurações
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gerencie preferências e configurações do Reperio.
            </p>
          </header>

          <section className="flex max-w-3xl items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-blue-600">
              <Settings size={21} />
            </div>
            <p className="pt-1 text-sm leading-6 text-slate-600">
              Preferências e configurações estarão disponíveis aqui futuramente.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
