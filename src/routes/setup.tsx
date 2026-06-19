import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AzureShell, Crumbs } from "@/components/AzureShell";
import { useSession } from "@/lib/session";
import { startSession } from "@/services/azureAI";
import {
  CERTIFICATIONS,
  DIFFICULTIES,
  EXPERIENCE_LEVELS,
  QUESTION_COUNTS,
  ROLES,
  SCENARIO_TOPICS,
} from "@/data/assessmentOptions";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup — Azure AI Coach" },
      { name: "description", content: "Configure your Azure preparation session." },
    ],
  }),
  component: SetupPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block" role="group" aria-label={label}>
      <span className="block text-xs font-medium text-foreground mb-1.5">{label}</span>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors " +
        (active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground")
      }
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full bg-input border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function SetupPage() {
  const navigate = useNavigate();
  const { state, set } = useSession();

  const [name, setName] = useState(state.name);
  const [email, setEmail] = useState(state.email);
  const [cert, setCert] = useState(state.config.certification ?? "AZ-900");
  const [diff, setDiff] = useState(state.config.difficulty ?? "Intermediate");
  const [role, setRole] = useState(state.config.role ?? ROLES[0]);
  const [exp, setExp] = useState(state.config.experience ?? "Mid-Level");
  const [topic, setTopic] = useState(state.config.topic ?? SCENARIO_TOPICS[0]);
  const [count, setCount] = useState(state.config.questionCount ?? 5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!state.mode) {
    return (
      <AzureShell>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-lg font-semibold">No track selected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a preparation track to continue.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Preparation Hub
          </Link>
        </div>
      </AzureShell>
    );
  }

  const modeLabel =
    state.mode === "certification"
      ? "Certification Exam"
      : state.mode === "interview"
        ? "Technical Interview"
        : "Scenario-Based Assessment";

  const buttonLabel =
    state.mode === "certification"
      ? "Start Preparation"
      : state.mode === "interview"
        ? "Start Interview"
        : "Start Assessment";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config: typeof state.config = { questionCount: count };
    if (state.mode === "certification") {
      config.certification = cert;
      config.difficulty = diff;
    } else if (state.mode === "interview") {
      config.role = role;
      config.experience = exp;
    } else {
      config.topic = topic;
    }
    const next = { ...state, name, email, config };
    setBusy(true);
    setError("");
    try {
      const questions = await startSession(next);
      set({ name, email, config, questions, current: 0, answers: [] });
      navigate({ to: "/interview" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Session could not start.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AzureShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Crumbs items={["Preparation Hub", modeLabel, "Setup"]} />
        <h1 className="mt-3 text-2xl font-semibold text-foreground">{modeLabel}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide your details and configure the session. Azure AI Foundry generates each question
          for your selected track.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 bg-card border border-border rounded-md p-6 space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <input
                aria-label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className={inputCls}
              />
            </Field>
            <Field label="Email Address">
              <input
                aria-label="Email Address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@contoso.com"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="h-px bg-border" />

          {state.mode === "certification" && (
            <>
              <Field label="Certification">
                <select
                  aria-label="Certification"
                  value={cert}
                  onChange={(e) => setCert(e.target.value)}
                  className={inputCls}
                >
                  {CERTIFICATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Difficulty">
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <Pill key={d} active={diff === d} onClick={() => setDiff(d)}>
                      {d}
                    </Pill>
                  ))}
                </div>
              </Field>
            </>
          )}

          {state.mode === "interview" && (
            <>
              <Field label="Role">
                <select
                  aria-label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={inputCls}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Experience">
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((d) => (
                    <Pill key={d} active={exp === d} onClick={() => setExp(d)}>
                      {d}
                    </Pill>
                  ))}
                </div>
              </Field>
            </>
          )}

          {state.mode === "scenario" && (
            <Field label="Topic">
              <select
                aria-label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputCls}
              >
                {SCENARIO_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Question Count">
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((q) => (
                <Pill key={q} active={count === q} onClick={() => setCount(q)}>
                  {q} questions
                </Pill>
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change track
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {busy ? "Generating question…" : buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </div>
    </AzureShell>
  );
}
