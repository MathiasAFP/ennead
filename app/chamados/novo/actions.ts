"use server";

import { createTicket } from "../../lib/data/tickets";

const categories = new Set([
  "Rede",
  "Acesso",
  "Software",
  "Hardware",
  "Impressão",
  "Outro",
]);

const limits = {
  title: 160,
  description: 4000,
  department: 120,
  equipment: 120,
} as const;

type TicketFormInput = {
  title: unknown;
  description: unknown;
  category: unknown;
  department: unknown;
  equipment: unknown;
};

export type CreateTicketActionResult =
  | {
      success: true;
      ticket: {
        id: string;
        ticketNumber: number;
        title: string;
        description: string;
        category: string | null;
        createdAt: string;
      };
    }
  | {
      success: false;
      message: string;
    };

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue.length <= maxLength && !normalizedValue.includes("\0")
    ? normalizedValue
    : null;
}

export async function createTicketAction(
  input: TicketFormInput,
): Promise<CreateTicketActionResult> {
  const title = normalizeOptionalText(input.title, limits.title);
  const description = normalizeOptionalText(input.description, limits.description);
  const department = normalizeOptionalText(input.department, limits.department);
  const equipment = normalizeOptionalText(input.equipment, limits.equipment);
  const category =
    typeof input.category === "string" ? input.category.trim() : null;

  if (
    !title ||
    !description ||
    department === null ||
    equipment === null ||
    category === null ||
    (category !== "" && !categories.has(category))
  ) {
    return {
      success: false,
      message: "Não foi possível criar o chamado. Tente novamente.",
    };
  }

  const ticket = await createTicket({
    title,
    description,
    category: category || null,
    department: department || null,
    equipment: equipment || null,
  });

  if (!ticket) {
    return {
      success: false,
      message: "Não foi possível criar o chamado. Tente novamente.",
    };
  }

  return { success: true, ticket };
}
