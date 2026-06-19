import { createContext, useContext, useState, type ReactNode } from "react";
import type { AssessmentMode, SessionState } from "@/types/assessment";

export type Mode = AssessmentMode;
export type {
  AnswerEvaluation as AnswerResult,
  Question,
  SessionConfig,
  SessionState,
} from "@/types/assessment";

const initial: SessionState = {
  mode: null,
  name: "",
  email: "",
  config: {},
  questions: [],
  current: 0,
  answers: [],
};

interface Ctx {
  state: SessionState;
  set: (patch: Partial<SessionState>) => void;
  reset: () => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial);
  const set = (patch: Partial<SessionState>) => setState((s) => ({ ...s, ...patch }));
  const reset = () => setState(initial);
  return <SessionCtx.Provider value={{ state, set, reset }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession outside provider");
  return ctx;
}
