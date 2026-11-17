import { useMemo, useState } from "react";
import { AlertTriangle, Users } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ROOMMATES, bestGroup, roommateScore, type RoommateProfile, type RoommateWeights } from "@/lib/homebase-data";
import { Meter, Section, money } from "./shared";

const TRAITS: { k: "sleep" | "cleanliness" | "social" | "study"; label: string; lo: string; hi: string }[] = [
  { k: "sleep", label: "Sleep schedule", lo: "Early bird", hi: "Night owl" },
  { k: "cleanliness", label: "Cleanliness", lo: "Relaxed", hi: "Spotless" },
  { k: "social", label: "Guests & social", lo: "Quiet", hi: "Guests often" },
  { k: "study", label: "Study at home", lo: "Studies out", hi: "Needs quiet home" },
];

export function RoommateMatcher() {
  const [me, setMe] = useState<RoommateProfile>({ id: "me", name: "You", major: "", sleep: 3, cleanliness: 4, social: 2, study: 4, budget: 1200 });
  const [w, setW] = useState<RoommateWeights>({ sleep: 4, cleanliness: 4, social: 3, study: 3, budget: 5 });
  const [size, setSize] = useState(3);
  const ranked = useMemo(() => ROOMMATES.map((p) => ({ p, ...roommateScore(me, p, w) })).sort((a, b) => b.score - a.score), [me, w]);
  const group = useMemo(() => bestGroup(me, ROOMMATES, size, w), [me, w, size]);
  const S = ({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; show: string }) => (
    <div><div className="mb-1.5 flex justify-between text-sm"><Label>{label}</Label><span className="font-semibold">{show}</span></div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} /></div>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-5">
        <Section title="Your habits">
          <div className="space-y-4">
            {TRAITS.map((t) => <S key={t.k} label={t.label} value={me[t.k]} min={1} max={5} show={me[t.k] <= 2 ? t.lo : me[t.k] >= 4 ? t.hi : "In between"} onChange={(v) => setMe({ ...me, [t.k]: v })} />)}
            <S label="Budget / month" value={me.budget} min={800} max={2000} step={25} show={money(me.budget)} onChange={(v) => setMe({ ...me, budget: v })} />
          </div>
        </Section>
        <Section title="What matters most">
          <div className="space-y-4">
            {(Object.keys(w) as (keyof RoommateWeights)[]).map((k) => <S key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={w[k]} min={0} max={5} show={`${w[k]}`} onChange={(v) => setW({ ...w, [k]: v })} />)}
          </div>
        </Section>
      </div>
      <div className="space-y-5">
        <Section title="Best group for a multi-bedroom unit" action={<div className="flex items-center gap-2 text-sm">Bedrooms {[2, 3, 4].map((n) => <button key={n} onClick={() => setSize(n)} className={`h-7 w-7 rounded-full border text-xs font-semibold ${size === n ? "bg-primary text-primary-foreground" : ""}`}>{n}</button>)}</div>}>
          <div className="flex flex-wrap items-center gap-3">
            <Users className="h-5 w-5 text-accent" />
            <span className="font-semibold">You</span>{group.members.map((m) => <span key={m.id} className="rounded-full bg-secondary px-3 py-1 text-sm">{m.name}</span>)}
            <span className="ml-auto font-display text-2xl font-bold text-primary">{group.avg}%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Average compatibility across every pair in the group.</p>
        </Section>
        {ranked.map(({ p, score, parts, conflicts }) => (
          <div key={p.id} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between"><div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.major} · budget {money(p.budget)}</div></div><div className="font-display text-3xl font-bold text-primary">{score}%</div></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {Object.entries(parts).map(([k, v]) => <div key={k} className="text-xs capitalize"><div className="mb-1">{k}</div><Meter value={Math.round(v * 100)} /></div>)}
            </div>
            {conflicts.length > 0 && <div className="mt-3 space-y-1 rounded-lg bg-warning/20 p-3">{conflicts.map((c) => <div key={c} className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning-foreground" />{c}</div>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
