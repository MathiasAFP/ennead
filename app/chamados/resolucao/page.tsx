"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Wrench,
} from "lucide-react";
import { Sidebar } from "../../components/sidebar";

type Ticket = {
  title: string;
  description: string;
  category?: string;
};

type ReferenceCase = {
  id: string;
  title: string;
  similarity: number;
  identifiedCause: string;
  appliedSolution: string;
  steps: string[];
};

type ResolutionValues = {
  cause: string;
  solution: string;
  steps: string;
  observations: string;
};

type ResolutionErrors = Partial<Pick<ResolutionValues, "cause" | "solution">>;

const initialValues: ResolutionValues = {
  cause: "",
  solution: "",
  steps: "",
  observations: "",
};

export default function ResolutionPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [referenceCase, setReferenceCase] = useState<ReferenceCase | null>(null);
  const [values, setValues] = useState<ResolutionValues>(initialValues);
  const [errors, setErrors] = useState<ResolutionErrors>({});

  useEffect(() => {
    const storageTimeoutId = window.setTimeout(() => {
      setTicket(readStorageItem<Ticket>("reperio:ticket-analysis"));
      setReferenceCase(readStorageItem<ReferenceCase>("reperio:reference-case"));
    }, 0);

    return () => window.clearTimeout(storageTimeoutId);
  }, []);

  function updateField(field: keyof ResolutionValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));

    if (field === "cause" || field === "solution") {
      setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    }
  }

  function validateForm() {
    const nextErrors: ResolutionErrors = {};

    if (!values.cause.trim()) {
      nextErrors.cause = "Informe a causa identificada.";
    }

    if (!values.solution.trim()) {
      nextErrors.solution = "Informe a solução aplicada.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    sessionStorage.setItem(
      "reperio:ticket-resolution",
      JSON.stringify({
        cause: values.cause.trim(),
        solution: values.solution.trim(),
        steps: values.steps
          .split("\n")
          .map((step) => step.trim())
          .filter(Boolean),
        observations: values.observations.trim(),
      }),
    );
    router.push("/chamados/concluido");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <Sidebar activeItem="Chamados" />

      <section className="ml-72 min-h-screen px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
                Resolver chamado
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Registre o diagnóstico e a solução aplicada neste atendimento.
              </p>
            </div>
            <Link
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
              href="/chamados/analise"
            >
              <ArrowLeft size={18} />
              Voltar aos casos semelhantes
            </Link>
          </header>

          <section className="grid gap-4 lg:grid-cols-2">
            <SummaryPanel
              description={ticket?.description}
              eyebrow="Chamado atual"
              icon={FileText}
              meta={ticket?.category}
              title={ticket?.title ?? "Chamado não informado"}
            />
            <SummaryPanel
              eyebrow="Referência utilizada"
              icon={CheckCircle2}
              meta={
                referenceCase
                  ? `${referenceCase.id} · ${referenceCase.similarity}% de similaridade`
                  : "Nenhuma referência selecionada"
              }
              title={referenceCase?.title ?? "Referência não informada"}
            />
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
            <form
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
              onSubmit={handleSubmit}
            >
              <div className="space-y-5">
                <FormField
                  error={errors.cause}
                  id="resolution-cause"
                  label="Causa identificada"
                  onChange={(value) => updateField("cause", value)}
                  placeholder="Descreva a causa confirmada do problema."
                  value={values.cause}
                />
                <FormField
                  error={errors.solution}
                  id="resolution-solution"
                  label="Solução aplicada"
                  onChange={(value) => updateField("solution", value)}
                  placeholder="Descreva a solução que foi realmente aplicada."
                  value={values.solution}
                />
                <FormField
                  id="resolution-steps"
                  label="Passos executados"
                  onChange={(value) => updateField("steps", value)}
                  placeholder="Registre um passo por linha."
                  value={values.steps}
                />
                <FormField
                  id="resolution-observations"
                  label="Observações"
                  onChange={(value) => updateField("observations", value)}
                  placeholder="Adicione informações relevantes, se necessário."
                  value={values.observations}
                />
              </div>

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <Link
                  className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                  href="/chamados/analise"
                >
                  <ArrowLeft size={17} />
                  Voltar aos casos semelhantes
                </Link>
                <button
                  className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  type="submit"
                >
                  <Wrench size={18} />
                  Resolver chamado
                </button>
              </div>
            </form>

            <aside className="sticky top-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
              <div className="flex items-center gap-2 text-slate-900">
                <ClipboardList size={19} className="text-blue-600" />
                <h2 className="text-base font-semibold">
                  Histórico utilizado como apoio
                </h2>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-500">
                Revise este histórico antes de registrar a solução confirmada.
              </p>

              {referenceCase ? (
                <div className="mt-5 space-y-5">
                  <HistoryDetail label="Causa anterior" text={referenceCase.identifiedCause} />
                  <HistoryDetail label="Solução anterior" text={referenceCase.appliedSolution} />
                  <section>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Passos anteriores
                    </h3>
                    <ol className="mt-2.5 space-y-2">
                      {referenceCase.steps.map((step, index) => (
                        <li
                          className="flex gap-3 text-sm leading-5 text-slate-600"
                          key={step}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Selecione um caso semelhante para consultar seu histórico aqui.
                </p>
              )}
            </aside>
          </div>
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

function SummaryPanel({
  eyebrow,
  title,
  meta,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  description?: string;
  icon: typeof FileText;
}) {
  return (
    <section className="flex min-w-0 items-start gap-3 border-l-2 border-blue-500 bg-white px-4 py-3 shadow-sm shadow-slate-200/50">
      <Icon className="mt-0.5 shrink-0 text-blue-600" size={18} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 truncate text-sm font-semibold text-slate-950">
          {title}
        </h2>
        {meta ? <p className="mt-1 text-xs font-medium text-slate-500">{meta}</p> : null}
        {description ? (
          <p className="mt-1 line-clamp-1 text-sm leading-5 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function FormField({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        aria-required={label === "Causa identificada" || label === "Solução aplicada"}
        className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function HistoryDetail({ label, text }: { label: string; text: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
    </section>
  );
}
