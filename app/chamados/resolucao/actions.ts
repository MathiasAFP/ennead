"use server";

import { revalidatePath } from "next/cache";

import { saveTicketResolution } from "@/app/lib/data/resolutions";

type ResolutionActionInput = {
  ticketId: string | undefined;
  cause: string;
  solution: string;
  steps: string[];
  notes: string;
  referenceTicketId: string | undefined;
  referenceSimilarity: number | undefined;
};

type ResolutionActionResult =
  | { success: true; ticketId: string; indexed: boolean }
  | { success: false; message: string };

const MAX_CAUSE_LENGTH = 4000;
const MAX_SOLUTION_LENGTH = 4000;
const MAX_NOTES_LENGTH = 4000;
const MAX_STEPS = 20;
const MAX_STEP_LENGTH = 600;

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length <= maxLength
    ? value.trim()
    : null;
}

function normalizeSteps(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_STEPS) {
    return null;
  }

  const steps = value.map((step) => normalizeText(step, MAX_STEP_LENGTH));
  return steps.every((step): step is string => Boolean(step)) ? steps : null;
}

export async function resolveTicketAction(
  input: ResolutionActionInput,
): Promise<ResolutionActionResult> {
  const cause = normalizeText(input.cause, MAX_CAUSE_LENGTH);
  const solution = normalizeText(input.solution, MAX_SOLUTION_LENGTH);
  const notes = normalizeText(input.notes, MAX_NOTES_LENGTH);
  const steps = normalizeSteps(input.steps);
  const similarity = input.referenceSimilarity;

  if (
    !cause ||
    !solution ||
    !steps ||
    !input.ticketId ||
    !input.referenceTicketId ||
    typeof similarity !== "number" ||
    !Number.isFinite(similarity) ||
    similarity < 0 ||
    similarity > 100
  ) {
    return {
      success: false,
      message: "Não foi possível registrar a resolução. Revise os dados e tente novamente.",
    };
  }

  const result = await saveTicketResolution({
    ticketId: input.ticketId,
    cause,
    solution,
    steps,
    notes: notes || null,
    referenceTicketId: input.referenceTicketId,
    referenceSimilarity: similarity,
  });

  if (!result) {
    return {
      success: false,
      message: "Não foi possível registrar a resolução. Tente novamente.",
    };
  }

  revalidatePath("/");
  revalidatePath("/chamados");

  return { success: true, ...result };
}
