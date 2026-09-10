import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Computer,
  FileText,
  ListChecks,
  Tag,
  Wrench,
} from "lucide-react";

import { Sidebar } from "../../components/sidebar";
import { ticketStatusLabels, ticketStatusStyles } from "../../components/ticket-status";
import { formatTicketDate, getTicketById } from "../../lib/data/tickets";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: PageProps<"/chamados/[ticketId]">) {
  const { ticketId } = await params;
  const result = await getTicketById(ticketId);

  if (result.kind === "not-found") {
    notFound();
  }

  if (result.kind === "unavailable") {
    return <TicketUnavailablePage />;
  }

  const { ticket } = result;
  const isResolved = ticket.status === "resolved";

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Chamado #{ticket.ticketNumber}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">
                {ticket.title}
              </h1>
            </div>
            <Link
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
              href="/chamados"
            >
              <ArrowLeft size={18} />
              Voltar para chamados
            </Link>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-950">Informações do chamado</h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  ticketStatusStyles[ticket.status]
                }`}
              >
                {ticketStatusLabels[ticket.status]}
              </span>
            </div>
            <dl className="grid gap-x-8 gap-y-5 px-5 py-5 md:grid-cols-3">
              <DetailItem icon={Tag} label="Categoria" value={ticket.category ?? "Sem categoria"} />
              <DetailItem icon={Building2} label="Setor" value={ticket.department ?? "Não informado"} />
              <DetailItem icon={Computer} label="Equipamento" value={ticket.equipment ?? "Não informado"} />
              <DetailItem icon={CalendarClock} label="Criado em" value={formatTicketDate(ticket.createdAt)} />
              <DetailItem icon={CalendarClock} label="Atualizado em" value={formatTicketDate(ticket.updatedAt)} />
              {ticket.resolvedAt ? (
                <DetailItem icon={CheckCircle2} label="Resolvido em" value={formatTicketDate(ticket.resolvedAt)} />
              ) : null}
            </dl>

            <div className="border-t border-slate-100 px-5 py-5">
              <SectionHeading icon={FileText} title="Problema relatado" />
              <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {ticket.description}
              </p>
            </div>
          </section>

          {isResolved && ticket.resolution ? (
            <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm shadow-slate-200/60">
              <SectionHeading icon={Wrench} title="Resolução" />
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <ResolutionHighlight label="Causa identificada" text={ticket.resolution.cause} />
                <ResolutionHighlight label="Solução aplicada" text={ticket.resolution.solution} />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
                <section>
                  <SectionHeading icon={ListChecks} title="Passos executados" />
                  {ticket.resolution.steps.length > 0 ? (
                    <ol className="mt-3 space-y-2.5">
                      {ticket.resolution.steps.map((step, index) => (
                        <li className="flex gap-3 text-sm leading-6 text-slate-600" key={`${index}-${step}`}>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-500">Nenhum passo registrado.</p>
                  )}
                </section>

                <div className="space-y-5 border-l border-slate-100 pl-6">
                  <DetailText label="Observações" text={ticket.resolution.notes} />
                </div>
              </div>

              {ticket.resolution.reference ? (
                <section className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-sm font-semibold text-slate-900">Referência utilizada</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    #{ticket.resolution.reference.ticketNumber} — {ticket.resolution.reference.title}
                  </p>
                  {ticket.resolution.reference.similarity !== null ? (
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      {formatSimilarity(ticket.resolution.reference.similarity)} de similaridade
                    </p>
                  ) : null}
                </section>
              ) : null}
            </section>
          ) : (
            <section className="border-l-2 border-blue-500 bg-white px-5 py-4 shadow-sm shadow-slate-200/50">
              <p className="text-sm font-semibold text-slate-900">
                {ticketStatusLabels[ticket.status]}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Este chamado ainda não possui uma resolução registrada.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function TicketUnavailablePage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />
      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm shadow-slate-200/60">
          <p className="text-sm font-medium text-slate-700">
            Não foi possível carregar o chamado no momento.
          </p>
        </div>
      </section>
    </main>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 shrink-0 text-slate-400" size={17} />
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof FileText; title: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-900">
      <Icon className="text-blue-600" size={18} />
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  );
}

function ResolutionHighlight({ label, text }: { label: string; text: string }) {
  return (
    <section className="border-l-2 border-blue-500 bg-blue-50/40 px-4 py-3">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-700">{text}</p>
    </section>
  );
}

function DetailText({ label, text }: { label: string; text: string | null }) {
  if (!text) {
    return null;
  }

  return (
    <section>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
    </section>
  );
}

function formatSimilarity(similarity: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(similarity * 100)}%`;
}
