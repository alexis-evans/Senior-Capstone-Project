import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ShieldCheck } from "lucide-react";
import { useHomebase } from "@/lib/homebase-store";
import { RENT_TREND, avgRating, totalCost } from "@/lib/homebase-data";
import { Section, Stat, money } from "./shared";

const MIN_GROUP = 2; // suppress any group with fewer reports than this

export function AdminView() {
  const { listings, incidents, reviews, hiddenFees } = useHomebase();
  const avgTotal = listings.reduce((s, l) => s + totalCost(l, {}, hiddenFees.filter((f) => f.listingId === l.id)).monthlyTotal, 0) / listings.length;
  const avgMoveIn = listings.reduce((s, l) => s + totalCost(l).moveInTotal, 0) / listings.length;
  const byType = Object.entries(incidents.reduce<Record<string, number>>((a, i) => ({ ...a, [i.type]: (a[i.type] ?? 0) + 1 }), {})).map(([type, count]) => ({ type, count }));
  const problem = listings.map((l) => ({ l, open: incidents.filter((i) => i.listingId === l.id && i.status !== "Resolved").length, total: incidents.filter((i) => i.listingId === l.id).length, rating: avgRating(reviews.filter((r) => r.listingId === l.id)) }))
    .filter((x) => x.total >= MIN_GROUP || x.rating && x.rating < 2.5).sort((a, b) => b.total - a.total);
  const barriers = [
    { k: "Income ≥ 3× rent", n: listings.filter((l) => l.qualification.incomeMultiple >= 3).length },
    { k: "Credit ≥ 650", n: listings.filter((l) => l.qualification.minCredit >= 650).length },
    { k: "No guarantors", n: listings.filter((l) => !l.qualification.guarantorAccepted).length },
    { k: "Deposit > 1 month", n: listings.filter((l) => l.deposit > l.rent).length },
  ];
  const commute = listings.map((l) => ({ name: l.neighborhood, transit: l.commuteMin.transit, score: l.transitScore }));
  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" />All figures are aggregated and anonymized. Groups under {MIN_GROUP} reports are hidden; no student names are ever shown.</p>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Avg true monthly" value={money(avgTotal)} hint="per bedroom, all-in" />
        <Stat label="Avg move-in cash" value={money(avgMoveIn)} />
        <Stat label="Open incidents" value={`${incidents.filter((i) => i.status !== "Resolved").length}`} />
        <Stat label="Surprise fees reported" value={`${hiddenFees.length}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Rent vs. true cost by term"><div className="h-64"><ResponsiveContainer><LineChart data={RENT_TREND}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="term" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Line dataKey="avgRent" name="Advertised rent" stroke="var(--chart-1)" strokeWidth={2} /><Line dataKey="avgTotal" name="True cost" stroke="var(--chart-2)" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Section>
        <Section title="Incident reports by type"><div className="h-64"><ResponsiveContainer><BarChart data={byType}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="type" fontSize={10} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Section>
        <Section title="Qualification barriers">
          {barriers.map((b) => <div key={b.k} className="mb-3 text-sm"><div className="mb-1 flex justify-between"><span>{b.k}</span><b>{Math.round((b.n / listings.length) * 100)}% of listings</b></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-accent" style={{ width: `${(b.n / listings.length) * 100}%` }} /></div></div>)}
        </Section>
        <Section title="Commute & transit access"><div className="h-64"><ResponsiveContainer><BarChart data={commute}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={11} /><Tooltip /><Legend /><Bar dataKey="transit" name="Transit min" fill="var(--chart-1)" /><Bar dataKey="score" name="Transit score" fill="var(--chart-3)" /></BarChart></ResponsiveContainer></div></Section>
      </div>
      <Section title="Properties needing attention">
        <table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">Property</th><th>Total reports</th><th>Open</th><th>Avg rating</th></tr></thead>
          <tbody>{problem.map(({ l, open, total, rating }) => <tr key={l.id} className="border-b"><td className="py-2 font-semibold">{l.name}</td><td>{total}</td><td className={open ? "text-destructive font-semibold" : ""}>{open}</td><td>{rating ? rating.toFixed(1) : "—"}</td></tr>)}</tbody></table>
      </Section>
    </div>
  );
}
