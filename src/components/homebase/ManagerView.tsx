import { useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useHomebase, today } from "@/lib/homebase-store";
import type { Incident, ReviewCategory } from "@/lib/homebase-data";
import { IncidentCard, ReviewCard, Section, SentimentChart, Stars, summarizeReviews } from "./shared";

const CATS: (ReviewCategory | "all")[] = ["all", "maintenance", "management", "safety", "amenities", "noise", "fees"];

export function ManagerView() {
  const { listings, reviews, setReviews, incidents, setIncidents } = useHomebase();
  const [lid, setLid] = useState("l3");
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const [period, setPeriod] = useState<"all" | "recent" | "older">("all");
  const l = listings.find((x) => x.id === lid)!;
  let rv = reviews.filter((r) => r.listingId === lid);
  const summary = summarizeReviews(rv, l);
  if (cat !== "all") rv = [...rv].sort((a, b) => a.ratings[cat] - b.ratings[cat]);
  if (l.managementChangedOn && period !== "all") rv = rv.filter((r) => (period === "recent" ? r.date >= l.managementChangedOn! : r.date < l.managementChangedOn!));
  const inc = incidents.filter((i) => i.listingId === lid);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3"><span className="text-sm font-semibold">Property</span>
        <select className="h-9 rounded-md border bg-card px-2 text-sm" value={lid} onChange={(e) => setLid(e.target.value)}>{listings.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        {l.managementChangedOn && <Badge variant="secondary">Management changed {l.managementChangedOn}</Badge>}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Feedback by category">
          {summary ? <div className="grid grid-cols-2 gap-2">{Object.entries(summary.avg).map(([k, v]) => <button key={k} onClick={() => setCat(k as ReviewCategory)} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm capitalize ${cat === k ? "border-primary bg-secondary" : ""}`}>{k}<Stars value={v} size={12} /></button>)}</div> : <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          {summary && <p className="mt-3 text-sm text-muted-foreground">{summary.text}</p>}
        </Section>
        <Section title="Sentiment over time"><SentimentChart reviews={reviews.filter((r) => r.listingId === lid)} /></Section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Incident reports">
          <div className="space-y-3">{inc.map((i) => <IncidentCard key={i.id} i={i}><IncidentResponder i={i} onUpdate={(status, text) => { setIncidents((xs) => xs.map((x) => x.id === i.id ? { ...x, status, updates: text ? [...x.updates, { date: today(), text }] : x.updates } : x)); toast.success("Public status updated"); }} /></IncidentCard>)}
            {!inc.length && <p className="text-sm text-muted-foreground">No incidents.</p>}</div>
        </Section>
        <Section title="Reviews" action={l.managementChangedOn && <div className="flex gap-1">{(["all", "recent", "older"] as const).map((p) => <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>{p === "recent" ? "Since change" : p === "older" ? "Before" : "All"}</Button>)}</div>}>
          <div className="space-y-3">{rv.map((r) => <ReviewCard key={r.id} r={r} l={l}><ReviewActions id={r.id} hasFlag={!!r.flagged} onRespond={(t) => setReviews((xs) => xs.map((x) => x.id === r.id ? { ...x, response: t } : x))} onFlag={(reason) => { setReviews((xs) => xs.map((x) => x.id === r.id ? { ...x, flagged: { reason, status: "pending" } } : x)); toast.success("Sent to moderators — the review stays visible during review"); }} /></ReviewCard>)}</div>
        </Section>
      </div>
    </div>
  );
}

function IncidentResponder({ i, onUpdate }: { i: Incident; onUpdate: (s: Incident["status"], t: string) => void }) {
  const [t, setT] = useState(""); const [s, setS] = useState(i.status);
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <select className="h-9 rounded-md border bg-background px-2 text-sm" value={s} onChange={(e) => setS(e.target.value as Incident["status"])}>{["Reported", "Acknowledged", "In progress", "Resolved"].map((x) => <option key={x}>{x}</option>)}</select>
      <input className="h-9 min-w-40 flex-1 rounded-md border bg-background px-2 text-sm" placeholder="Public update…" value={t} onChange={(e) => setT(e.target.value)} />
      <Button size="sm" onClick={() => { onUpdate(s, t); setT(""); }}>Post</Button>
    </div>
  );
}

function ReviewActions({ hasFlag, onRespond, onFlag }: { id: string; hasFlag: boolean; onRespond: (t: string) => void; onFlag: (r: string) => void }) {
  const [t, setT] = useState(""); const [flagging, setFlagging] = useState(false); const [reason, setReason] = useState("Factually inaccurate");
  return (
    <div className="mt-3 space-y-2">
      <Textarea rows={2} placeholder="Write a public response…" value={t} onChange={(e) => setT(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!t} onClick={() => { onRespond(t); setT(""); }}>Respond publicly</Button>
        {!hasFlag && !flagging && <Button size="sm" variant="outline" onClick={() => setFlagging(true)}><Flag className="mr-1 h-3 w-3" />Flag for moderation</Button>}
        {flagging && <><select className="h-8 rounded-md border bg-background px-2 text-xs" value={reason} onChange={(e) => setReason(e.target.value)}>{["Factually inaccurate", "Personal information", "Harassment / hate speech", "Not a resident"].map((x) => <option key={x}>{x}</option>)}</select><Button size="sm" variant="destructive" onClick={() => { onFlag(reason); setFlagging(false); }}>Submit flag</Button></>}
      </div>
      <p className="text-[11px] text-muted-foreground">Negative but honest reviews can't be removed — only policy violations.</p>
    </div>
  );
}
