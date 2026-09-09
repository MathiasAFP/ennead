export const recentTickets = [
  {
    id: "#1048",
    title: "Impressora não aparece na rede",
    description: "Fila de impressão indisponível para o financeiro.",
    category: "Rede",
    status: "Em análise",
    updatedAt: "Hoje, 14:25",
  },
  {
    id: "#1047",
    title: "Usuário não consegue acessar o ERP",
    description: "Login retorna erro depois da troca de senha.",
    category: "Acesso",
    status: "Aberto",
    updatedAt: "Hoje, 13:40",
  },
  {
    id: "#1046",
    title: "Computador perde conexão durante o expediente",
    description: "Quedas recorrentes em estação cabeada.",
    category: "Rede",
    status: "Resolvido",
    updatedAt: "Hoje, 11:18",
  },
  {
    id: "#1045",
    title: "Erro ao sincronizar arquivos compartilhados",
    description: "Cliente de sincronização trava ao abrir pastas.",
    category: "Software",
    status: "Em análise",
    updatedAt: "Ontem, 17:52",
  },
  {
    id: "#1044",
    title: "Monitor secundário não é reconhecido",
    description: "Tela externa não aparece após reiniciar.",
    category: "Hardware",
    status: "Resolvido",
    updatedAt: "Ontem, 15:06",
  },
  {
    id: "#1043",
    title: "Senha expirada impede acesso ao sistema",
    description: "Usuário bloqueado no portal interno.",
    category: "Acesso",
    status: "Resolvido",
    updatedAt: "22 jan, 09:34",
  },
];

export const ticketStatusStyles: Record<string, string> = {
  Aberto: "border-blue-200 bg-blue-50 text-blue-700",
  "Em análise": "border-amber-200 bg-amber-50 text-amber-700",
  Resolvido: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
