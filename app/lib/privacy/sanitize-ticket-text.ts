import "server-only";

// Basic MVP safeguard only. Production needs broader PII detection and governance.
const CPF_PATTERN = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-\s]?\d{4}\b/g;
const LONG_IDENTIFIER_PATTERN = /\b(?:\d[\s-]?){10,}\d\b/g;

export function sanitizeTicketTextForEmbedding(text: string) {
  return text
    .replace(CPF_PATTERN, "[CPF removido]")
    .replace(EMAIL_PATTERN, "[e-mail removido]")
    .replace(PHONE_PATTERN, "[telefone removido]")
    .replace(LONG_IDENTIFIER_PATTERN, "[identificador removido]")
    .replace(/\s+/g, " ")
    .trim();
}
