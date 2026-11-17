import { createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { HomebaseProvider, useHomebase } from "@/lib/homebase-store";
import { ROLE_META, type Role } from "@/lib/homebase-data";
import { StudentView } from "@/components/homebase/StudentView";
import { LandlordView } from "@/components/homebase/LandlordView";
import { ReviewerView } from "@/components/homebase/ReviewerView";
import { AdminView } from "@/components/homebase/AdminView";
import { ManagerView } from "@/components/homebase/ManagerView";
import { ParentView } from "@/components/homebase/ParentView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Homebase — Off-campus housing for Howard students" },
      { name: "description", content: "Verified listings, true monthly cost, commute maps, reviews, roommate matching and lease checks." },
      { property: "og:title", content: "Homebase" },
      { property: "og:description", content: "Off-campus housing intelligence for students, families and administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <HomebaseProvider><App /></HomebaseProvider>,
});

const HEAD: Record<Role, string> = {
  student: "Find a place you can actually afford.",
  landlord: "List honestly. Earn the trust badge.",
  reviewer: "Leave the next class a better map.",
  admin: "See where students are struggling.",
  manager: "Show residents you're listening.",
  parent: "Help your student decide, on their terms.",
};

function App() {
  const { role, setRole } = useHomebase();
  const View = { student: StudentView, landlord: LandlordView, reviewer: ReviewerView, admin: AdminView, manager: ManagerView, parent: ParentView }[role];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 font-display text-xl font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Home className="h-4 w-4" /></span>Homebase</div>
          <nav className="ml-auto flex flex-wrap gap-1 rounded-full bg-muted p-1" aria-label="Switch role">
            {(Object.keys(ROLE_META) as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${role === r ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>{ROLE_META[r].label}</button>
            ))}
          </nav>
        </div>
      </header>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-xs font-semibold uppercase tracking-widest opacity-75">{ROLE_META[role].label} · {ROLE_META[role].blurb}</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{HEAD[role]}</h1>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8"><View /></main>
    </div>
  );
}
