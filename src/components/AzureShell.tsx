import { Link } from "@tanstack/react-router";
import { Cloud } from "lucide-react";
import type { ReactNode } from "react";

export function AzureShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
              <Cloud className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-foreground">Azure AI Coach</span>
              <span className="text-[11px] text-muted-foreground">Microsoft Azure preparation</span>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-sm hover:text-foreground transition-colors">
              Preparation Hub
            </span>
            <span className="text-border">|</span>
            <span className="px-2 py-1 rounded-sm hover:text-foreground transition-colors">
              Powered by Azure AI Foundry
            </span>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-4 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Azure AI Coach — Internal Preparation Platform</span>
          <span>Front-end ready for Azure AI Foundry · Azure Functions · Static Web Apps</span>
        </div>
      </footer>
    </div>
  );
}

export function Crumbs({ items }: { items: string[] }) {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-2">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className={i === items.length - 1 ? "text-foreground" : ""}>{it}</span>
          {i < items.length - 1 && <span className="text-border">/</span>}
        </span>
      ))}
    </div>
  );
}
