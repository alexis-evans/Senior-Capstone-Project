import { useMemo, useState } from "react";
import { Calculator, MapPin, Sparkles, Users, FileText, Lock, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHomebase } from "@/lib/homebase-store";
import { matchScore, totalCost, type Layout, type Preferences } from "@/lib/homebase-data";
import { CommuteMap, CommuteRow, CostBreakdownView, ListingDetail, Meter, Section, TrustBadge, money } from "./shared";
import { RoommateMatcher } from "./RoommateMatcher";
import { LeaseAnalyzer } from "./LeaseAnalyzer";
import { PrivacyControls } from "./PrivacyControls";

const LAYOUTS: Layout[] = ["Studio", "1BR", "2BR", "3BR", "4BR"];
const TRAITS = ["Quiet", "Walkable", "Green space", "Nightlife", "Student-heavy", "Historic", "Shopping", "Diverse dining"];

export function StudentView() {
  return (
    <Tabs defaultValue="search" className="space-y-6">
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value="search" className="gap-1"><Search className="h-4 w-4" />Search</TabsTrigger>
        <TabsTrigger value="recs" className="gap-1"><Sparkles className="h-4 w-4" />For you</TabsTrigger>
        <TabsTrigger value="compare" className="gap-1"><Calculator className="h-4 w-4" />Compare costs</TabsTrigger>
        <TabsTrigger value="roommates" className="gap-1"><Users className="h-4 w-4" />Roommates</TabsTrigger>
        <TabsTrigger value="lease" className="gap-1"><FileText className="h-4 w-4" />Lease check</TabsTrigger>
        <TabsTrigger value="privacy" className="gap-1"><Lock className="h-4 w-4" />Privacy & sharing</TabsTrigger>
      </TabsList>
      <TabsContent value="search"><SearchPanel /></TabsContent>
      <TabsContent value="recs"><Recommendations /></TabsContent>
      <TabsContent value="compare"><CompareCosts /></TabsContent>
      <TabsContent value="roommates"><RoommateMatcher /></TabsContent>
      <TabsContent value="lease"><LeaseAnalyzer /></TabsContent>
      <TabsContent value="privacy"><PrivacyControls /></TabsContent>
    </Tabs>
  );
}

function SearchPanel() {
  const { listings, reviews, incidents, hiddenFees } = useHomebase();
  const [maxRent, setMaxRent] = useState(1700);
  const [maxDist, setMaxDist] = useState(3);
  const [maxCommute, setMaxCommute] = useState(30);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [traits, setTraits] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [costOpen, setCostOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | undefined>();

  const results = listings.filter((l) =>
    l.rent <= maxRent && l.distanceMi <= maxDist && l.commuteMin.transit <= maxCommute &&
    (!layouts.length || layouts.includes(l.layout)) && traits.every((t) => l.neighborhoodTraits.includes(t)) &&
    (!verifiedOnly || (l.verified.identity && l.verified.ownership)) && l.unitsAvailable > 0);
  const sel = listings.find((l) => l.id === open);
  const costSel = listings.find((l) => l.id === costOpen);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-5 rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24 lg:self-start">
        <h3 className="text-lg font-semibold">Filters</h3>
        <FilterSlider label="Max rent / bedroom" value={maxRent} display={money(maxRent)} min={800} max={2000} step={25} onChange={setMaxRent} />
        <FilterSlider label="Distance from campus" value={maxDist} display={`${maxDist} mi`} min={0.5} max={3} step={0.1} onChange={setMaxDist} />
        <FilterSlider label="Max transit commute" value={maxCommute} display={`${maxCommute} min`} min={5} max={45} step={1} onChange={setMaxCommute} />
        <div>
          <Label className="mb-2 block">Room layout</Label>
          <div className="flex flex-wrap gap-1.5">
            {LAYOUTS.map((l) => <Chip key={l} on={layouts.includes(l)} onClick={() => setLayouts((x) => x.includes(l) ? x.filter((y) => y !== l) : [...x, l])}>{l}</Chip>)}
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Neighborhood</Label>
          <div className="flex flex-wrap gap-1.5">
            {TRAITS.map((t) => <Chip key={t} on={traits.includes(t)} onClick={() => setTraits((x) => x.includes(t) ? x.filter((y) => y !== t) : [...x, t])}>{t}</Chip>)}
          </div>
        </div>
        <div className="flex items-center justify-between"><Label htmlFor="vo">Verified owners only</Label><Switch id="vo" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} /></div>
      </aside>

      <div className="space-y-5">
        <CommuteMap listings={results} selected={hover} onSelect={setOpen} />
        <div className="text-sm text-muted-foreground">{results.length} of {listings.length} listings match</div>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((l) => {
            const c = totalCost(l, {}, hiddenFees.filter((f) => f.listingId === l.id));
            const openInc = incidents.filter((i) => i.listingId === l.id && i.status !== "Resolved").length;
            return (
              <article key={l.id} onMouseEnter={() => setHover(l.id)} className="flex flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div><h4 className="font-display text-lg font-semibold leading-tight">{l.name}</h4><div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{l.neighborhood} · {l.distanceMi} mi</div></div>
                  <TrustBadge l={l} />
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <div><div className="font-display text-2xl font-bold">{money(l.rent)}</div><div className="text-xs text-muted-foreground">advertised</div></div>
                  <div className="pb-1 text-sm">→ <b className="text-accent">{money(c.monthlyTotal)}</b> <span className="text-xs text-muted-foreground">true monthly</span></div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5"><Badge variant="secondary">{l.layout}</Badge><Badge variant="outline">Transit {l.transitScore}</Badge><Badge variant="outline">{l.unitsAvailable} units left</Badge>{openInc > 0 && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{openInc} open incident</Badge>}</div>
                <div className="mt-2"><CommuteRow l={l} /></div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => setOpen(l.id)}>View details</Button>
                  <Button size="sm" variant="outline" onClick={() => setCostOpen(l.id)}><Calculator className="mr-1 h-4 w-4" />Total cost</Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {sel && (<><DialogHeader><DialogTitle className="font-display text-2xl">{sel.name}</DialogTitle><p className="text-sm text-muted-foreground">{sel.address}</p></DialogHeader>
            <ListingDetail l={sel} reviews={reviews} incidents={incidents} fees={hiddenFees} /></>)}
        </DialogContent>
      </Dialog>
      <Dialog open={!!costSel} onOpenChange={(o) => !o && setCostOpen(null)}>
        <DialogContent className="max-w-2xl">
          {costSel && <CostModal id={costSel.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CostModal({ id }: { id: string }) {
  const { listings, hiddenFees } = useHomebase();
  const l = listings.find((x) => x.id === id)!;
  const [parking, setParking] = useState(false);
  const [transit, setTransit] = useState(true);
  return (
    <>
      <DialogHeader><DialogTitle className="font-display text-xl">Total cost of living · {l.name}</DialogTitle></DialogHeader>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><Switch checked={transit} onCheckedChange={setTransit} />Monthly transit pass</label>
        <label className="flex items-center gap-2"><Switch checked={parking} onCheckedChange={setParking} />I need parking</label>
      </div>
      <CostBreakdownView l={l} fees={hiddenFees} needsParking={parking} usesTransit={transit} />
    </>
  );
}

function FilterSlider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><Label>{label}</Label><span className="font-semibold">{display}</span></div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-secondary"}`}>{children}</button>;
}

function Recommendations() {
  const { listings, reviews, hiddenFees } = useHomebase();
  const [p, setP] = useState<Preferences>({ maxBudget: 1700, maxCommute: 25, layouts: [], verifiedOnly: true, weights: { cost: 5, commute: 4, safety: 3, reviews: 3, amenities: 1 } });
  const results = useMemo(() => listings.map((l) => matchScore(l, p, reviews, hiddenFees.filter((f) => f.listingId === l.id))).sort((a, b) => Number(b.passes) - Number(a.passes) || b.score - a.score), [listings, p, reviews, hiddenFees]);
  const setW = (k: keyof Preferences["weights"], v: number) => setP({ ...p, weights: { ...p.weights, [k]: v } });
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-card lg:self-start">
        <div><h3 className="text-lg font-semibold">Must-haves</h3><p className="text-xs text-muted-foreground">Hard limits — listings that break these are excluded.</p></div>
        <FilterSlider label="All-in monthly budget" value={p.maxBudget} display={money(p.maxBudget)} min={1000} max={2500} step={25} onChange={(v) => setP({ ...p, maxBudget: v })} />
        <FilterSlider label="Max commute" value={p.maxCommute} display={`${p.maxCommute} min`} min={5} max={45} step={1} onChange={(v) => setP({ ...p, maxCommute: v })} />
        <div className="flex flex-wrap gap-1.5">{LAYOUTS.map((l) => <Chip key={l} on={p.layouts.includes(l)} onClick={() => setP({ ...p, layouts: p.layouts.includes(l) ? p.layouts.filter((x) => x !== l) : [...p.layouts, l] })}>{l}</Chip>)}</div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={p.verifiedOnly} onCheckedChange={(v) => setP({ ...p, verifiedOnly: !!v })} />Verified owners only</label>
        <div className="border-t pt-4"><h3 className="text-lg font-semibold">Nice-to-haves</h3><p className="text-xs text-muted-foreground">How much each factor matters to you (0–5).</p></div>
        {(Object.keys(p.weights) as (keyof Preferences["weights"])[]).map((k) => (
          <FilterSlider key={k} label={k[0].toUpperCase() + k.slice(1)} value={p.weights[k]} display={`${p.weights[k]}`} min={0} max={5} step={1} onChange={(v) => setW(k, v)} />
        ))}
      </div>
      <div className="space-y-4">
        {results.map((m) => (
          <div key={m.listing.id} className={`rounded-2xl border bg-card p-5 shadow-card ${m.passes ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between gap-3">
              <div><h4 className="font-display text-lg font-semibold">{m.listing.name}</h4><div className="text-xs text-muted-foreground">{m.listing.neighborhood} · {m.listing.layout}</div></div>
              <div className="text-right">
                <div className={`font-display text-3xl font-bold ${m.passes ? "text-primary" : "text-muted-foreground"}`}>{m.passes ? `${m.score}%` : "—"}</div>
                <div className="text-xs text-muted-foreground">{m.passes ? "match" : "excluded"}</div>
              </div>
            </div>
            {!m.passes && <div className="mt-2 space-y-1">{m.failures.map((f) => <div key={f} className="text-sm text-destructive">✕ {f}</div>)}</div>}
            {m.passes && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why this matches</div>
                {m.reasons.map((r) => (
                  <div key={r.label} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                    <span>{r.label}</span><Meter value={r.value} /><span className="w-56 truncate text-xs text-muted-foreground">{r.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareCosts() {
  const { listings, hiddenFees } = useHomebase();
  const [ids, setIds] = useState<string[]>(["l1", "l2", "l3"]);
  return (
    <Section title="Side-by-side affordability">
      <div className="mb-4 flex flex-wrap gap-1.5">{listings.map((l) => <Chip key={l.id} on={ids.includes(l.id)} onClick={() => setIds((x) => x.includes(l.id) ? x.filter((y) => y !== l.id) : [...x, l.id])}>{l.name}</Chip>)}</div>
      <CostCompareTable ids={ids} listings={listings} hiddenFees={hiddenFees} />
    </Section>
  );
}

export function CostCompareTable({ ids, listings, hiddenFees }: { ids: string[]; listings: ReturnType<typeof useHomebase>["listings"]; hiddenFees: ReturnType<typeof useHomebase>["hiddenFees"] }) {
  const rows = listings.filter((l) => ids.includes(l.id)).map((l) => ({ l, c: totalCost(l, {}, hiddenFees.filter((f) => f.listingId === l.id)) }));
  const min = Math.min(...rows.map((r) => r.c.monthlyTotal));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Property</th><th>Advertised</th><th>True monthly</th><th>Move-in</th><th>Full lease</th><th>Income needed</th></tr></thead>
        <tbody>
          {rows.map(({ l, c }) => (
            <tr key={l.id} className="border-b">
              <td className="py-3 font-semibold">{l.name}</td><td>{money(l.rent)}</td>
              <td className={c.monthlyTotal === min ? "font-bold text-success" : ""}>{money(c.monthlyTotal)}</td>
              <td>{money(c.moveInTotal)}</td><td>{money(c.leaseTotal)}</td>
              <td>{money(l.rent * l.qualification.incomeMultiple)}/mo</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
