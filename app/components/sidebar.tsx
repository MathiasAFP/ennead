import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Sparkles,
  Ticket,
} from "lucide-react";

type SidebarProps = {
  activeItem?:
    | "Dashboard"
    | "Chamados"
    | "Base de conhecimento"
    | "Configurações"
    | null;
};

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Chamados", icon: Ticket, href: "/chamados" },
  {
    label: "Base de conhecimento",
    icon: BookOpen,
    href: "/base-conhecimento",
  },
];

export function Sidebar({ activeItem = null }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 flex w-72 flex-col bg-[#0f1e33] px-5 py-6 text-white">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm shadow-blue-950/20">
          <Sparkles size={20} strokeWidth={2.3} />
        </div>
        <div>
          <p className="text-base font-semibold leading-5">Reperio</p>
          <p className="text-xs text-slate-400">Memória operacional</p>
        </div>
      </div>

      <nav className="mt-9 space-y-1">
        {navigation.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <Link
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-500 text-white shadow-sm shadow-blue-950/20"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
              href={item.href}
              key={item.label}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="my-5 border-t border-white/10" />

      <Link
        className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
          activeItem === "Configurações"
            ? "bg-blue-500 text-white shadow-sm shadow-blue-950/20"
            : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
        }`}
        href="/configuracoes"
      >
        <Settings size={18} />
        Configurações
      </Link>

      <div className="mt-auto flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-800">
          MS
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Marcos Silva
          </p>
          <p className="truncate text-xs text-slate-400">Suporte Técnico</p>
        </div>
      </div>
    </aside>
  );
}
