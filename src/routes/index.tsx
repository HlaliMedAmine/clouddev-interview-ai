import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, Briefcase, Layers, ArrowRight } from "lucide-react";
import { AzureShell } from "@/components/AzureShell";
import { useSession, type Mode } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Azure AI Coach — Preparation Hub" },
      {
        name: "description",
        content:
          "Choose your Azure preparation track: certification, technical interview, or scenario-based assessment.",
      },
    ],
  }),
  component: WelcomePage,
});

const CARDS: { mode: Mode; title: string; description: string; icon: typeof Award; tag: string }[] =
  [
    {
      mode: "certification",
      title: "Certification Exam",
      description:
        "Prepare for Microsoft Azure certification exams with AI-generated questions and explanations.",
      icon: Award,
      tag: "AZ-900 · AZ-104 · AZ-305 · AZ-400 · AI-102 · AI-103 · Security · Data",
    },
    {
      mode: "interview",
      title: "Technical Interview",
      description:
        "Practice real Azure technical interviews based on your role and experience level.",
      icon: Briefcase,
      tag: "Administrator · Engineer · Architect · DevOps · AI Engineer",
    },
    {
      mode: "scenario",
      title: "Scenario-Based Assessment",
      description:
        "Solve real Azure architecture, operations and troubleshooting scenarios end-to-end.",
      icon: Layers,
      tag: "Networking · Security · Entra · AKS · Storage · DR",
    },
  ];

function WelcomePage() {
  const navigate = useNavigate();
  const { set, reset } = useSession();

  const select = (mode: Mode) => {
    reset();
    set({ mode });
    navigate({ to: "/setup" });
  };

  return (
    <AzureShell>
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-wider text-primary mb-3">
            Preparation Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
            Azure AI Coach
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Prepare for Azure Certifications, Technical Interviews and Real-World Scenarios using
            Azure AI.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.mode}
                onClick={() => select(c.mode)}
                className="group text-left bg-card border border-border rounded-md p-6 hover:border-primary hover:bg-card/80 transition-colors flex flex-col"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{c.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {c.description}
                </p>
                <div className="mt-5 pt-4 border-t border-border text-[11px] text-muted-foreground">
                  {c.tag}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                  Begin preparation
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 text-xs text-muted-foreground">
          <div className="bg-card/60 border border-border rounded-sm p-4">
            <div className="font-medium text-foreground mb-1">AI-generated questions</div>
            Curated for each Azure exam, role and scenario domain.
          </div>
          <div className="bg-card/60 border border-border rounded-sm p-4">
            <div className="font-medium text-foreground mb-1">Detailed feedback</div>
            Score, strengths, missing points and an ideal answer after every response.
          </div>
          <div className="bg-card/60 border border-border rounded-sm p-4">
            <div className="font-medium text-foreground mb-1">Personalized plan</div>
            7, 14 and 30-day learning plans mapped to your weak areas.
          </div>
        </div>
      </div>
    </AzureShell>
  );
}
