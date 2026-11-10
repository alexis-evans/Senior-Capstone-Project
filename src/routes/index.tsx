import { createFileRoute } from "@tanstack/react-router";
import { HomebaseProvider } from "@/lib/homebase-store";
import { StudentView } from "@/components/homebase/StudentView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Homebase — Off-campus housing for Howard students" },
      { name: "description", content: "Verified listings, true monthly cost, commute maps and AI match scores." },
      { property: "og:title", content: "Homebase" },
      { property: "og:description", content: "Off-campus housing intelligence for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <HomebaseProvider>
      <header className="bg-hero px-6 py-8 text-primary-foreground"><h1 className="text-3xl font-bold">Homebase</h1><p className="opacity-80">Find verified, affordable housing near Howard.</p></header>
      <main className="mx-auto max-w-7xl p-6"><StudentView /></main>
    </HomebaseProvider>
  ),
});
