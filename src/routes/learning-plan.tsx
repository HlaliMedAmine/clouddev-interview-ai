import { createFileRoute } from "@tanstack/react-router";
import { LearningPlanPage } from "@/pages/LearningPlanPage";

export const Route = createFileRoute("/learning-plan")({
  head: () => ({
    meta: [
      { title: "Learning Plan | Azure AI Coach" },
      { name: "description", content: "Your personalized Azure study plan." },
    ],
  }),
  component: LearningPlanPage,
});
