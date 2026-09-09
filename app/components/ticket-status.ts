export const ticketStatusLabels = {
  open: "Aberto",
  analyzing: "Em análise",
  resolved: "Resolvido",
} as const;

export const ticketStatusStyles = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  analyzing: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;
