import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import { AzureShell, Crumbs } from "@/components/AzureShell";
import { useSession } from "@/lib/session";
import { evaluateAnswer, getQuestion } from "@/services/azureAI";
import type { AnswerEvaluation } from "@/types/assessment";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Session — Azure AI Coach" },
      { name: "description", content: "Live Azure preparation session." },
    ],
  }),
  component: InterviewPage,
});

function trackLabel(state: ReturnType<typeof useSession>["state"]) {
  if (state.mode === "certification")
    return `Certification · ${state.config.certification} · ${state.config.difficulty}`;
  if (state.mode === "interview")
    return `Interview · ${state.config.role} · ${state.config.experience}`;
  if (state.mode === "scenario") return `Scenario · ${state.config.topic}`;
  return "";
}

function InterviewPage() {
  const navigate = useNavigate();
  const { state, set } = useSession();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!state.questions.length) {
    return (
      <AzureShell>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-lg font-semibold">No active session</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a preparation session from the hub.
          </p>
          <Link to="/" className="mt-6 inline-flex text-sm text-primary hover:underline">
            Back to Preparation Hub
          </Link>
        </div>
      </AzureShell>
    );
  }

  const total = state.config.questionCount ?? 5;
  const idx = state.current;
  const q = state.questions[idx];
  const pct = Math.round(((idx + (result ? 1 : 0)) / total) * 100);

  const submit = async () => {
    if (!answer.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await evaluateAnswer(q, answer, state.mode);
      setResult(r);
      set({ answers: [...state.answers, { question: q, answer, result: r }] });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Evaluation failed.");
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (idx + 1 >= total) {
      navigate({ to: "/report" });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const generated = await getQuestion(state);
      set({ questions: [...state.questions, generated], current: idx + 1 });
      setAnswer("");
      setResult(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Question generation failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AzureShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Crumbs items={["Preparation Hub", trackLabel(state), `Question ${idx + 1}`]} />

        {/* Candidate header */}
        <div className="mt-4 bg-card border border-border rounded-md p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Candidate</div>
            <div className="text-sm font-medium text-foreground">
              {state.name || "Anonymous"}{" "}
              <span className="text-muted-foreground font-normal">· {state.email || "—"}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Track</div>
            <div className="text-sm font-medium text-foreground">{trackLabel(state)}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              Question <span className="text-foreground font-medium">{idx + 1}</span> of {total}
            </span>
            <span>{pct}% complete</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="mt-6 bg-card border border-border rounded-md p-6">
          <div className="text-[11px] uppercase tracking-wider text-primary font-medium">
            {q.topic}
          </div>
          <h2 className="mt-2 text-lg md:text-xl font-semibold text-foreground leading-snug">
            {q.prompt}
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!result}
            placeholder="Type your answer here. Be specific, mention Azure services, trade-offs, and examples."
            rows={8}
            className="mt-5 w-full bg-input border border-border rounded-sm p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-y disabled:opacity-70"
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {answer.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            {!result ? (
              <button
                onClick={submit}
                disabled={!answer.trim() || busy}
                className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Evaluating…" : "Submit Answer"}
              </button>
            ) : (
              <button
                onClick={next}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {busy ? "Generating…" : idx + 1 >= total ? "View Final Report" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Feedback */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-card border border-border rounded-md p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Score</div>
                <div className="text-3xl font-semibold text-foreground">
                  {result.score}
                  <span className="text-base text-muted-foreground font-normal"> / 100</span>
                </div>
              </div>
              <div
                className={
                  "px-2.5 py-1 rounded-sm text-xs font-medium " +
                  (result.score >= 75
                    ? "bg-success/15 text-success"
                    : result.score >= 50
                      ? "bg-warning/15 text-warning"
                      : "bg-destructive/15 text-destructive")
                }
              >
                {result.score >= 75 ? "Strong" : result.score >= 50 ? "Developing" : "Needs work"}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card border border-border rounded-md p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Strengths
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border border-border rounded-md p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <AlertCircle className="h-4 w-4 text-warning" /> Missing points & improvements
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                  {result.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-card border border-border rounded-md p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpen className="h-4 w-4 text-primary" /> Ideal answer
              </div>
              <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                {result.idealAnswer}
              </p>
            </div>
            <div className="bg-card border border-border rounded-md p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpen className="h-4 w-4 text-primary" /> Learning recommendations
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {result.learningRecommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AzureShell>
  );
}
