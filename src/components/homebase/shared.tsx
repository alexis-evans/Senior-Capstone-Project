import { useMemo } from "react";
import { BadgeCheck, ShieldAlert, ShieldCheck, Star, Train, Footprints, Car, Sparkles } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMPUS, avgRating, totalCost, type HiddenFee, type Incident, type Listing, type Review, type ReviewCategory } from "@/lib/homebase-data";
import { cn } from "@/lib/utils";

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function TrustBadge({ l }: { l: Listing }) {
  const full = l.verified.identity && l.verified.ownership;
  if (full) return <Badge className="gap-1 bg-success text-success-foreground hover:bg-success"><ShieldCheck className="h-3 w-3" />Verified owner</Badge>;
  if (l.verified.identity) return <Badge className="gap-1 bg-warning text-warning-foreground hover:bg-warning"><BadgeCheck className="h-3 w-3" />ID verified</Badge>;
  return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" />Unverified</Badge>;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={cn(i <= Math.round(value) ? "fill-warning text-warning" : "text-border")} />
      ))}
    </span>
  );
}

export function StarPicker({ value, onChange, size = 16, label }: { value: number; onChange: (n: number) => void; size?: number; label?: string }) {
  return (
    <span role="radiogroup" aria-label={label ? `${label} rating` : "Rating"} className="inline-flex shrink-0 items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} of 5`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star style={{ width: size, height: size }} className={cn(n <= value ? "fill-warning text-warning" : "text-border")} />
        </button>
      ))}
    </span>
  );
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Meter({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", value >= 70 ? "bg-success" : value >= 45 ? "bg-warning" : "bg-destructive")} style={{ width: `${Math.max(3, value)}%` }} />
    </div>
  );
}

export function CostBreakdownView({ l, fees, needsParking, usesTransit }: { l: Listing; fees: HiddenFee[]; needsParking?: boolean | undefined; usesTransit?: boolean | undefined }) {
  const c = totalCost(l, { needsParking: !!needsParking, usesTransit: usesTransit ?? true }, fees.filter((f) => f.listingId === l.id));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-2 text-sm font-semibold">Monthly</div>
        {c.monthly.map((m) => (
          <div key={m.label} className={cn("flex justify-between border-b border-dashed py-1.5 text-sm", m.label.startsWith("Reported") && "text-accent")}>
            <span>{m.label}</span><span className="tabular-nums">{money(m.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 font-semibold"><span>True monthly cost</span><span>{money(c.monthlyTotal)}</span></div>
        <div className="text-xs text-muted-foreground">Advertised {money(l.rent)} → +{money(c.monthlyTotal - l.rent)} hidden in extras</div>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">Move-in</div>
        {c.moveIn.map((m) => (
          <div key={m.label} className="flex justify-between border-b border-dashed py-1.5 text-sm"><span>{m.label}</span><span className="tabular-nums">{money(m.amount)}</span></div>
        ))}
        <div className="flex justify-between pt-2 font-semibold"><span>Due at move-in</span><span>{money(c.moveInTotal)}</span></div>
        <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">Full {l.leaseMonths}-month lease: <b>{money(c.leaseTotal)}</b></div>
      </div>
    </div>
  );
}

export function CommuteRow({ l }: { l: Listing }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1"><Footprints className="h-3.5 w-3.5" />{l.commuteMin.walk}m</span>
      <span className="inline-flex items-center gap-1"><Train className="h-3.5 w-3.5" />{l.commuteMin.transit}m</span>
      <span className="inline-flex items-center gap-1"><Car className="h-3.5 w-3.5" />{l.commuteMin.drive}m</span>
    </div>
  );
}

export function CommuteMap({ listings, selected, onSelect }: { listings: Listing[]; selected?: string | undefined; onSelect?: ((id: string) => void) | undefined }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-map-land">
      <svg viewBox="0 0 100 62" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path d="M0 40 L100 38" stroke="var(--map-road)" strokeWidth="2" />
        <path d="M50 0 L48 62" stroke="var(--map-road)" strokeWidth="2.2" />
        <path d="M28 0 L34 62" stroke="var(--map-road)" strokeWidth="1.2" />
        <path d="M0 15 L100 25" stroke="var(--map-road)" strokeWidth="1.2" />
        <path d="M70 0 Q75 30 100 50" stroke="var(--map-road)" strokeWidth="1.2" fill="none" />
        <path d="M46 4 Q52 30 48 45 Q44 55 50 62" stroke="var(--chart-2)" strokeWidth="0.8" strokeDasharray="1.5 1" fill="none" />
        <path d="M30 14 Q40 26 50 30 Q65 30 82 20" stroke="var(--chart-3)" strokeWidth="0.8" strokeDasharray="1.5 1" fill="none" />
        <circle cx={CAMPUS.x} cy={CAMPUS.y * 0.62} r="9" fill="var(--primary)" opacity="0.08" />
        <circle cx={CAMPUS.x} cy={CAMPUS.y * 0.62} r="18" fill="var(--primary)" opacity="0.05" />
      </svg>
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${CAMPUS.x}%`, top: `${CAMPUS.y}%` }}>
        <div className="rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground shadow-card">HU Campus</div>
      </div>
      {listings.map((l) => (
        <button
          key={l.id}
          onClick={() => onSelect?.(l.id)}
          className={cn("absolute -translate-x-1/2 -translate-y-full rounded-full border-2 px-2 py-0.5 text-[10px] font-semibold shadow-card transition", selected === l.id ? "z-10 scale-110 border-primary bg-accent text-accent-foreground" : "border-card bg-card text-foreground hover:bg-secondary")}
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
          title={l.name}
        >
          {money(l.rent)} · {l.commuteMin.transit}m
        </button>
      ))}
      <div className="absolute bottom-2 left-2 flex gap-3 rounded-md bg-card/90 px-2 py-1 text-[10px]">
        <span className="text-accent">— Green/Yellow Metro</span><span className="text-success">— Bus line</span>
      </div>
    </div>
  );
}

const CATS: ReviewCategory[] = ["management", "maintenance", "noise", "safety", "fees", "amenities"];

export function summarizeReviews(reviews: Review[], l?: Listing) {
  if (!reviews.length) return null;
  const avg = Object.fromEntries(CATS.map((c) => [c, reviews.reduce((s, r) => s + r.ratings[c], 0) / reviews.length])) as Record<ReviewCategory, number>;
  const sorted: ReviewCategory[] = [...CATS].sort((a, b) => avg[b] - avg[a]);
  const recent = l?.managementChangedOn ? reviews.filter((r) => r.date >= l.managementChangedOn!) : [];
  const older = l?.managementChangedOn ? reviews.filter((r) => r.date < l.managementChangedOn!) : [];
  const [a0, a1, a5] = [sorted[0]!, sorted[1]!, sorted[5]!];
  let text = `Residents rate ${a0} (${avg[a0].toFixed(1)}★) and ${a1} highest; ${a5} (${avg[a5].toFixed(1)}★) is the most common complaint.`;
  if (recent.length && older.length) {
    text += ` Since management changed, ratings moved from ${avgRating(older).toFixed(1)}★ to ${avgRating(recent).toFixed(1)}★.`;
  }
  return { avg, text };
}

export function SentimentChart({ reviews }: { reviews: Review[] }) {
  const data = [...reviews].sort((a, b) => a.date.localeCompare(b.date)).map((r) => ({ date: r.date.slice(0, 7), score: Number(avgRating([r]).toFixed(2)) }));
  if (data.length < 2) return <p className="text-sm text-muted-foreground">Not enough reviews to show a trend yet.</p>;
  return (
    <div className="h-44">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
          <YAxis domain={[1, 5]} fontSize={11} stroke="var(--muted-foreground)" />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="var(--chart-2)" strokeWidth={2.5} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReviewCard({ r, l, children }: { r: Review; l?: Listing; children?: React.ReactNode }) {
  const isOld = l?.managementChangedOn && r.date < l.managementChangedOn;
  return (
    <div className={cn("rounded-xl border p-4", isOld && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Stars value={avgRating([r])} />
        <span className="font-semibold">{r.author}</span>
        <span className="text-muted-foreground">{r.date}</span>
        {r.verifiedLease ? <Badge variant="secondary" className="gap-1"><BadgeCheck className="h-3 w-3" />Verified lease</Badge> : <Badge variant="outline">Unverified</Badge>}
        {isOld && <Badge variant="outline">Before mgmt change</Badge>}
        {r.flagged?.status === "pending" && <Badge className="bg-warning text-warning-foreground hover:bg-warning">Under moderation</Badge>}
      </div>
      <p className="mt-2 text-sm">{r.text}</p>
      {r.response && <div className="mt-3 rounded-lg border-l-4 border-primary bg-secondary p-3 text-sm"><b>Management response:</b> {r.response}</div>}
      {children}
    </div>
  );
}

export function IncidentCard({ i, children }: { i: Incident; children?: React.ReactNode }) {
  const statusColor = { Reported: "bg-destructive text-destructive-foreground", Acknowledged: "bg-warning text-warning-foreground", "In progress": "bg-warning text-warning-foreground", Resolved: "bg-success text-success-foreground" }[i.status];
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{i.type}</span>
        <Badge variant="outline">{i.severity}</Badge>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusColor)}>{i.status}</span>
        <span className="text-muted-foreground">{i.date}</span>
      </div>
      <p className="mt-1 text-sm">{i.description}</p>
      {i.updates.map((u, k) => <div key={k} className="mt-2 text-xs text-muted-foreground">↳ {u.date}: {u.text}</div>)}
      {children}
    </div>
  );
}

export function ListingDetail({ l, reviews, incidents, fees, sections = { cost: true, commute: true, reviews: true } }: {
  l: Listing; reviews: Review[]; incidents: Incident[]; fees: HiddenFee[]; sections?: { cost: boolean; commute: boolean; reviews: boolean };
}) {
  const rv = useMemo(() => reviews.filter((r) => r.listingId === l.id && r.flagged?.status !== "upheld"), [reviews, l.id]);
  const inc = incidents.filter((i) => i.listingId === l.id);
  const summary = summarizeReviews(rv, l);
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {sections.cost && <TabsTrigger value="cost">True cost</TabsTrigger>}
        {sections.commute && <TabsTrigger value="commute">Commute</TabsTrigger>}
        {sections.reviews && <TabsTrigger value="reviews">Reviews ({rv.length})</TabsTrigger>}
        {sections.reviews && <TabsTrigger value="incidents">Incidents ({inc.length})</TabsTrigger>}
      </TabsList>
      <TabsContent value="overview" className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2"><TrustBadge l={l} />{l.neighborhoodTraits.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Info k="Layout" v={`${l.layout} · ${l.bedrooms} bed`} /><Info k="Lease" v={`${l.leaseMonths} months`} /><Info k="Move-in" v={l.moveIn} />
          <Info k="Subletting" v={l.sublet} /><Info k="Occupancy limit" v={`${l.occupancyLimit}`} /><Info k="Units available" v={`${l.unitsAvailable}`} />
          <Info k="Income req." v={`${l.qualification.incomeMultiple}× rent`} /><Info k="Min credit" v={l.qualification.minCredit ? `${l.qualification.minCredit}` : "None"} /><Info k="Guarantor" v={l.qualification.guarantorAccepted ? "Accepted" : "Not accepted"} />
        </div>
        <div><b>Amenities:</b> {l.amenities.join(" · ")}</div>
        <div><b>Landlord:</b> {l.landlord} · updated {l.updatedAt}</div>
        <div><b>Property history:</b><ul className="ml-5 list-disc text-muted-foreground">{l.history.map((h) => <li key={h}>{h}</li>)}</ul></div>
      </TabsContent>
      {sections.cost && <TabsContent value="cost"><CostBreakdownView l={l} fees={fees} usesTransit /></TabsContent>}
      {sections.commute && (
        <TabsContent value="commute" className="space-y-3 text-sm">
          <CommuteMap listings={[l]} selected={l.id} />
          <div className="grid grid-cols-3 gap-2"><Info k="Walk" v={`${l.commuteMin.walk} min`} /><Info k="Transit" v={`${l.commuteMin.transit} min`} /><Info k="Drive" v={`${l.commuteMin.drive} min`} /></div>
          <div className="space-y-1"><div className="flex justify-between"><span>Transit access</span><span>{l.transitScore}/100</span></div><Meter value={l.transitScore} /></div>
          <div className="space-y-1"><div className="flex justify-between"><span>Neighborhood safety</span><span>{l.safetyScore}/100</span></div><Meter value={l.safetyScore} /></div>
          <div><b>Nearby:</b> {l.nearby.join(" · ")}</div>
        </TabsContent>
      )}
      {sections.reviews && (
        <TabsContent value="reviews" className="space-y-3">
          {summary && (
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <div className="mb-1 flex items-center gap-1 font-semibold"><Sparkles className="h-4 w-4 text-accent" />AI review summary</div>
              {summary.text}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {Object.entries(summary.avg).map(([k, v]) => <div key={k} className="flex items-center justify-between gap-2 capitalize"><span>{k}</span><Stars value={v} size={11} /></div>)}
              </div>
            </div>
          )}
          <SentimentChart reviews={rv} />
          {rv.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          {[...rv].sort((a, b) => b.date.localeCompare(a.date)).map((r) => <ReviewCard key={r.id} r={r} l={l} />)}
        </TabsContent>
      )}
      {sections.reviews && (
        <TabsContent value="incidents" className="space-y-3">
          {inc.length === 0 && <p className="text-sm text-muted-foreground">No incidents reported.</p>}
          {inc.map((i) => <IncidentCard key={i.id} i={i} />)}
        </TabsContent>
      )}
    </Tabs>
  );
}

export function Info({ k, v }: { k: string; v: string }) {
  return <div className="rounded-lg bg-muted px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</div><div className="font-semibold">{v}</div></div>;
}
