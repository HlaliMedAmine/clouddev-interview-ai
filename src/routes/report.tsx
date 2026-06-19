import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, TrendingUp, AlertTriangle, BookOpen, RotateCcw } from "lucide-react";
import { AzureShell, Crumbs } from "@/components/AzureShell";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Final Report — Azure AI Coach" },
      { name: "description", content: "Your personalized Azure preparation report." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const { state, reset } = useSession();

  const analytics = useMemo(() => {
    const answers = state.answers;
    const overall = answers.length
      ? Math.round(answers.reduce((s, a) => s + a.result.score, 0) / answers.length)
      : 0;

    const byTopic = new Map<string, number[]>();
    for (const a of answers) {
      const list = byTopic.get(a.question.topic) ?? [];
      list.push(a.result.score);
      byTopic.set(a.question.topic, list);
    }
    const topics = Array.from(byTopic.entries()).map(([topic, scores]) => ({
      topic,
      score: Math.round(scores.reduce((s, n) => s + n, 0) / scores.length),
    }));

    const strong = topics.filter((t) => t.score >= 75).map((t) => t.topic);
    const weak = topics.filter((t) => t.score < 65).map((t) => t.topic);
    const readiness = Math.max(
      0,
      Math.min(100, Math.round(overall * 0.9 + (strong.length - weak.length) * 3)),
    );

    return { overall, topics, strong, weak, readiness };
  }, [state.answers]);

  if (!state.answers.length) {
    return (
      <AzureShell>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-lg font-semibold">No report available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete a session to generate a report.
          </p>
          <Link to="/" className="mt-6 inline-flex text-sm text-primary hover:underline">
            Back to Preparation Hub
          </Link>
        </div>
      </AzureShell>
    );
  }

  const trackTitle =
    state.mode === "certification"
      ? `${state.config.certification} · ${state.config.difficulty}`
      : state.mode === "interview"
        ? `${state.config.role} · ${state.config.experience}`
        : `${state.config.topic}`;

  const restart = () => {
    reset();
    navigate({ to: "/" });
  };

  return (
    <AzureShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Crumbs items={["Preparation Hub", "Session", "Final Report"]} />

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Final Report</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {state.name || "Candidate"} · {trackTitle} · {state.answers.length} questions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/learning-plan"
              className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Open learning plan
            </Link>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start new session
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Kpi
            label="Overall Score"
            value={`${analytics.overall}`}
            suffix="/ 100"
            icon={TrendingUp}
            accent="primary"
          />
          <Kpi
            label="Certification Readiness"
            value={`${analytics.readiness}%`}
            icon={Award}
            accent={
              analytics.readiness >= 75
                ? "success"
                : analytics.readiness >= 50
                  ? "warning"
                  : "destructive"
            }
          />
          <Kpi
            label="Topics Assessed"
            value={`${analytics.topics.length}`}
            suffix="domains"
            icon={BookOpen}
            accent="primary"
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="bg-card border border-border rounded-md p-5">
            <div className="text-sm font-medium text-foreground">Topic scores</div>
            <div className="text-xs text-muted-foreground">Average score per Azure domain</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topics}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="topic" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "var(--foreground)",
                    }}
                    cursor={{ fill: "var(--accent)" }}
                  />
                  <Bar dataKey="score" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-md p-5">
            <div className="text-sm font-medium text-foreground">Domain coverage</div>
            <div className="text-xs text-muted-foreground">
              Radar view of strengths across topics
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.topics}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "var(--foreground)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Strengths / Weak Areas */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="bg-card border border-border rounded-md p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-success" /> Strengths
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {analytics.strong.length ? (
                analytics.strong.map((t) => (
                  <li
                    key={t}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-foreground">{t}</span>
                    <span className="text-xs text-success">Strong</span>
                  </li>
                ))
              ) : (
                <li>Keep practicing — no domain reached the strong threshold yet.</li>
              )}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-md p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" /> Weak areas
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {analytics.weak.length ? (
                analytics.weak.map((t) => (
                  <li
                    key={t}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-foreground">{t}</span>
                    <span className="text-xs text-warning">Focus next</span>
                  </li>
                ))
              ) : (
                <li>No weak areas detected. Push difficulty up to keep growing.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-card border border-border rounded-md p-5">
          <div className="text-sm font-medium text-foreground">AI learning recommendations</div>
          <ul className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
            {[
              ...new Set(state.answers.flatMap((answer) => answer.result.learningRecommendations)),
            ].map((recommendation) => (
              <li key={recommendation}>• {recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </AzureShell>
  );
}

function Kpi({
  label,
  value,
  suffix,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: typeof Award;
  accent: "primary" | "success" | "warning" | "destructive";
}) {
  const color =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : accent === "destructive"
          ? "text-destructive"
          : "text-primary";
  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Icon className={"h-4 w-4 " + color} />
      </div>
      <div className="mt-2 text-3xl font-semibold text-foreground">
        {value}
        {suffix && <span className="text-sm text-muted-foreground font-normal"> {suffix}</span>}
      </div>
    </div>
  );
}
