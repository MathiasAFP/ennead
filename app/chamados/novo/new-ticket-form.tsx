"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchCheck } from "lucide-react";
import { createTicketAction } from "./actions";

const categories = ["Rede", "Acesso", "Software", "Hardware", "Impressão", "Outro"];

type FormValues = {
  title: string;
  description: string;
  category: string;
  department: string;
  equipment: string;
};

type FormErrors = Partial<Pick<FormValues, "title" | "description">>;

const initialValues: FormValues = {
  title: "",
  description: "",
  category: "",
  department: "",
  equipment: "",
};

export function NewTicketForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  function updateField(field: keyof FormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setSubmissionError(null);

    if (field === "title" || field === "description") {
      setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Informe o título do chamado.";
    }

    if (!values.description.trim()) {
      nextErrors.description = "Descreva o problema antes de analisar.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTicketAction({
          title: values.title,
          description: values.description,
          category: values.category,
          department: values.department,
          equipment: values.equipment,
        });

        if (!result.success) {
          setSubmissionError(result.message);
          return;
        }

        sessionStorage.setItem(
          "reperio:ticket-analysis",
          JSON.stringify({
            ticketId: result.ticket.id,
            ticketNumber: result.ticket.ticketNumber,
            title: result.ticket.title,
            description: result.ticket.description,
            category: result.ticket.category,
            createdAt: result.ticket.createdAt,
          }),
        );

        router.push("/chamados/analise");
      } catch {
        setSubmissionError("Não foi possível criar o chamado. Tente novamente.");
      }
    });
  }

  return (
    <form
      className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        <div>
          <label
            className="text-sm font-semibold text-slate-800"
            htmlFor="ticket-title"
          >
            Título do chamado
          </label>
          <input
            aria-describedby={errors.title ? "ticket-title-error" : undefined}
            aria-invalid={Boolean(errors.title)}
            aria-required="true"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="ticket-title"
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Ex.: Impressora não aparece na rede"
            type="text"
            value={values.title}
          />
          {errors.title ? (
            <p className="mt-2 text-sm text-red-600" id="ticket-title-error">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-800"
            htmlFor="ticket-description"
          >
            Descrição do problema
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Descreva os sintomas e o contexto com o máximo de clareza possível.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Evite incluir CPF, dados de saúde ou outras informações pessoais que
            não sejam necessárias para o atendimento.
          </p>
          <textarea
            aria-describedby={
              errors.description ? "ticket-description-error" : undefined
            }
            aria-invalid={Boolean(errors.description)}
            aria-required="true"
            className="mt-3 min-h-48 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="ticket-description"
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="O computador do setor financeiro não consegue localizar a impressora da sala 2 na rede. Outros computadores continuam imprimindo normalmente."
            value={values.description}
          />
          {errors.description ? (
            <p
              className="mt-2 text-sm text-red-600"
              id="ticket-description-error"
            >
              {errors.description}
            </p>
          ) : null}
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-800"
            htmlFor="ticket-category"
          >
            Categoria
          </label>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            id="ticket-category"
            onChange={(event) => updateField("category", event.target.value)}
            value={values.category}
          >
            <option value="">Selecionar categoria</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Informações adicionais
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-medium text-slate-600"
                htmlFor="ticket-department"
              >
                Setor
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                id="ticket-department"
                onChange={(event) =>
                  updateField("department", event.target.value)
                }
                placeholder="Ex.: Financeiro"
                type="text"
                value={values.department}
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-600"
                htmlFor="ticket-equipment"
              >
                Equipamento
              </label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                id="ticket-equipment"
                onChange={(event) =>
                  updateField("equipment", event.target.value)
                }
                placeholder="Ex.: PC-FIN-03"
                type="text"
                value={values.equipment}
              />
            </div>
          </div>
        </div>
      </div>

      {submissionError ? (
        <p aria-live="polite" className="mt-5 text-sm text-red-600">
          {submissionError}
        </p>
      ) : null}

      <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Link
          className="flex h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:text-slate-950"
          href="/"
        >
          Cancelar
        </Link>
        <button
          className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          disabled={isSubmitting}
          type="submit"
        >
          <SearchCheck size={18} />
          {isSubmitting ? "Criando chamado..." : "Analisar chamado"}
        </button>
      </div>
    </form>
  );
}
