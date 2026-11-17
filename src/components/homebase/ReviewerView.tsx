import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHomebase, uid, today } from "@/lib/homebase-store";
import type { IncidentType, Review, ReviewCategory } from "@/lib/homebase-data";
import { Section, Stars } from "./shared";

const CATS: ReviewCategory[] = ["management", "maintenance", "noise", "safety", "fees", "amenities"];
const TYPES: IncidentType[] = ["Power outage", "Pests", "Delayed repair", "Water / plumbing", "Heating / cooling", "Safety / security"];

export function ReviewerView() {
  const { listings, setReviews, setIncidents, addHiddenFee } = useHomebase();
  const [lid, setLid] = useState("l1");
  const [ratings, setRatings] = useState<Record<ReviewCategory, number>>({ management: 4, maintenance: 4, noise: 3, safety: 4, fees: 3, amenities: 4 });
  const [text, setText] = useState("");
  const [vis, setVis] = useState<Review["visibility"]>("pseudonym");
  const [pseudo, setPseudo] = useState("Bison '27");
  const [verified, setVerified] = useState(false);
  const [itype, setItype] = useState<IncidentType>("Delayed repair"); const [idesc, setIdesc] = useState(""); const [isev, setIsev] = useState<"Low" | "Medium" | "High">("Medium"); const [idate, setIdate] = useState(today());
  const [fee, setFee] = useState(""); const [feeAmt, setFeeAmt] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Label>Property you leased</Label>
        <select className="h-9 rounded-md border bg-card px-2 text-sm" value={lid} onChange={(e) => setLid(e.target.value)}>{listings.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <Button size="sm" variant={verified ? "secondary" : "outline"} onClick={() => { setVerified(true); toast.success("Lease verified via signed lease upload"); }}>{verified ? "✓ Lease verified" : "Verify completed lease"}</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Write a review">
          <div className="grid grid-cols-2 gap-3">
            {CATS.map((c) => <div key={c} className="flex items-center justify-between text-sm capitalize">{c}<span className="flex">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRatings({ ...ratings, [c]: n })}><Stars value={n <= ratings[c] ? 1 : 0} size={16} /></button>).map((b, i) => <span key={i} className="-ml-0">{b}</span>)}</span></div>)}
          </div>
          <Textarea className="mt-3" rows={4} placeholder="What should future students know?" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-4 space-y-2"><Label>How your name appears</Label>
            <RadioGroup value={vis} onValueChange={(v) => setVis(v as Review["visibility"])} className="flex gap-4 text-sm">
              <label className="flex items-center gap-1"><RadioGroupItem value="named" />Real name</label>
              <label className="flex items-center gap-1"><RadioGroupItem value="pseudonym" />Pseudonym</label>
              <label className="flex items-center gap-1"><RadioGroupItem value="anonymous" />Anonymous</label>
            </RadioGroup>
            {vis === "pseudonym" && <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} />}
            <p className="text-xs text-muted-foreground">Your identity is verified privately and never shown to landlords.</p>
          </div>
          <Button className="mt-4" disabled={!text || !verified} onClick={() => { setReviews((r) => [{ id: uid(), listingId: lid, author: vis === "named" ? "Alexis E." : vis === "pseudonym" ? pseudo : "Anonymous resident", visibility: vis, date: today(), ratings, text, verifiedLease: true }, ...r]); setText(""); toast.success("Review published — it now feeds the property's summary and trends"); }}>Publish review</Button>
          {!verified && <p className="mt-2 text-xs text-muted-foreground">Verify your lease to publish.</p>}
        </Section>
        <div className="space-y-6">
          <Section title="Report an incident">
            <div className="grid grid-cols-2 gap-3">
              <select className="h-9 rounded-md border bg-background px-2 text-sm" value={itype} onChange={(e) => setItype(e.target.value as IncidentType)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <select className="h-9 rounded-md border bg-background px-2 text-sm" value={isev} onChange={(e) => setIsev(e.target.value as "Low")}>{["Low", "Medium", "High"].map((t) => <option key={t}>{t}</option>)}</select>
              <Input type="date" value={idate} onChange={(e) => setIdate(e.target.value)} className="col-span-2" />
            </div>
            <Textarea className="mt-3" rows={3} placeholder="What happened and how long did it last?" value={idesc} onChange={(e) => setIdesc(e.target.value)} />
            <Button className="mt-3" disabled={!idesc} onClick={() => { setIncidents((x) => [{ id: uid(), listingId: lid, type: itype, date: idate, description: idesc, severity: isev, status: "Reported", updates: [] }, ...x]); setIdesc(""); toast.success("Incident logged"); }}>Submit report</Button>
          </Section>
          <Section title="Report a surprise fee">
            <div className="flex gap-2"><Input placeholder="e.g. Monthly pest fee" value={fee} onChange={(e) => setFee(e.target.value)} /><Input type="number" className="w-28" value={feeAmt} onChange={(e) => setFeeAmt(Number(e.target.value))} /></div>
            <Button className="mt-3" variant="outline" disabled={!fee || !feeAmt} onClick={() => { addHiddenFee({ id: uid(), listingId: lid, label: fee, monthly: feeAmt, date: today() }); setFee(""); setFeeAmt(0); toast.success("Added to this property's true-cost estimate"); }}>Add to cost data</Button>
          </Section>
        </div>
      </div>
    </div>
  );
}
