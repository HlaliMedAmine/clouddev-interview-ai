import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpenCheck, CheckCircle2, FlaskConical, Target } from "lucide-react";
import { AzureShell, Crumbs } from "@/components/AzureShell";
import { useSession } from "@/lib/session";

export function LearningPlanPage() {
  const { state } = useSession();
  const [duration, setDuration] = useState<7 | 14 | 30>(7);

  const weakTopics = useMemo(() => {
    const topicScores = new Map<string, number[]>();
    state.answers.forEach(({ question, result }) => {
      topicScores.set(question.topic, [...(topicScores.get(question.topic) ?? []), result.score]);
    });
    return [...topicScores]
      .filter(([, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length < 70)
      .map(([topic]) => topic);
  }, [state.answers]);

  const plan = useMemo(() => {
    const sources = state.answers.map(({ question, result }) => ({
      topic: question.topic,
      objectives: result.weaknesses,
      studyTasks: result.learningRecommendations,
    }));
    return Array.from({ length: duration }, (_, index) => ({
      day: index + 1,
      ...sources[index % sources.length],
    }));
  }, [duration, state.answers]);

  if (!state.answers.length) {
    return (
      <AzureShell>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <BookOpenCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-xl font-semibold">Complete an assessment first</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your learning plan is generated from the topics that need the most attention.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Return to preparation hub
          </Link>
        </div>
      </AzureShell>
    );
  }

  return (
    <AzureShell>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <Crumbs items={["Preparation Hub", "Final Report", "Learning Plan"]} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Personalized roadmap
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Turn feedback into progress
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A practical plan for {state.name}, prioritized around the Azure domains with the
              greatest score impact.
            </p>
          </div>
          <div
            className="flex rounded-md border border-border bg-card p-1"
            aria-label="Learning plan duration"
          >
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDuration(days)}
                aria-pressed={duration === days}
                className={`rounded px-3 py-2 text-xs font-semibold transition ${duration === days ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Summary icon={Target} label="Focus areas" value={`${weakTopics.length || 1}`} />
          <Summary icon={FlaskConical} label="AI-guided days" value={`${duration}`} />
          <Summary
            icon={CheckCircle2}
            label="Recommendations"
            value={`${state.answers.flatMap((answer) => answer.result.learningRecommendations).length}`}
          />
        </div>

        <div className="mt-8 space-y-3">
          {plan.map((item) => (
            <article
              key={item.day}
              className="grid gap-5 rounded-lg border border-border bg-card p-5 sm:grid-cols-[72px_1fr_1fr]"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Day
                </span>
                <div className="mt-1 text-3xl font-semibold text-primary">{item.day}</div>
              </div>
              <div>
                <h2 className="font-semibold">{item.topic}</h2>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Objectives
                </div>
                <ul className="mt-2 space-y-2 text-sm text-foreground/80">
                  {item.objectives.map((objective) => (
                    <li key={objective} className="flex gap-2">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Study tasks
                </div>
                <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                  {item.studyTasks.map((task) => (
                    <li key={task} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AzureShell>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
