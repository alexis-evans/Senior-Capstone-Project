import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useHomebase, uid, today } from "@/lib/homebase-store";
import { LISTINGS, type Layout, type Listing } from "@/lib/homebase-data";
import { Section, TrustBadge, money } from "./shared";

const blank = (): Listing => ({ ...LISTINGS[1]!, id: uid(), name: "", address: "", landlord: "Your company", fees: [], verified: { identity: false, ownership: false }, history: ["New listing"], x: 60 + Math.random() * 20, y: 50 + Math.random() * 10, updatedAt: today() });

export function LandlordView() {
  const { listings, upsertListing, moderation, setModeration } = useHomebase();
  const mine = listings.filter((l) => ["l1", "l5"].includes(l.id) || l.landlord === "Your company");
  const [draft, setDraft] = useState<Listing>(blank());
  const [feeLabel, setFeeLabel] = useState(""); const [feeAmt, setFeeAmt] = useState(0);
  const F = (k: keyof Listing, v: unknown) => setDraft({ ...draft, [k]: v });
  const num = (k: keyof Listing) => ({ type: "number", value: draft[k] as number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => F(k, Number(e.target.value)) });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Section title="Create a listing">
        <div className="grid gap-3 sm:grid-cols-2">
          <Fld l="Property name"><Input value={draft.name} onChange={(e) => F("name", e.target.value)} /></Fld>
          <Fld l="Address"><Input value={draft.address} onChange={(e) => F("address", e.target.value)} /></Fld>
          <Fld l="Rent / bedroom"><Input {...num("rent")} /></Fld>
          <Fld l="Layout"><select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={draft.layout} onChange={(e) => F("layout", e.target.value as Layout)}>{["Studio", "1BR", "2BR", "3BR", "4BR"].map((x) => <option key={x}>{x}</option>)}</select></Fld>
          <Fld l="Utilities (est./mo)"><Input {...num("utilities")} /></Fld>
          <Fld l="Security deposit"><Input {...num("deposit")} /></Fld>
          <Fld l="Lease length (months)"><Input {...num("leaseMonths")} /></Fld>
          <Fld l="Move-in date"><Input type="date" value={draft.moveIn} onChange={(e) => F("moveIn", e.target.value)} /></Fld>
          <Fld l="Subletting"><select className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={draft.sublet} onChange={(e) => F("sublet", e.target.value)}>{["Allowed", "With approval", "Not allowed"].map((x) => <option key={x}>{x}</option>)}</select></Fld>
          <Fld l="Occupancy limit"><Input {...num("occupancyLimit")} /></Fld>
          <Fld l="Income required (× rent)"><Input type="number" step="0.5" value={draft.qualification.incomeMultiple} onChange={(e) => F("qualification", { ...draft.qualification, incomeMultiple: Number(e.target.value) })} /></Fld>
          <Fld l="Minimum credit score"><Input type="number" value={draft.qualification.minCredit} onChange={(e) => F("qualification", { ...draft.qualification, minCredit: Number(e.target.value) })} /></Fld>
          <Fld l="Amenities (comma separated)"><Input value={draft.amenities.join(", ")} onChange={(e) => F("amenities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Fld>
          <Fld l="Units available"><Input {...num("unitsAvailable")} /></Fld>
        </div>
        <div className="mt-4"><Label>Recurring fees (must be disclosed)</Label>
          <div className="mt-1 flex flex-wrap gap-2">{draft.fees.map((f, i) => <Badge key={i} variant="secondary">{f.label} {money(f.amount)}</Badge>)}</div>
          <div className="mt-2 flex gap-2"><Input placeholder="e.g. Amenity fee" value={feeLabel} onChange={(e) => setFeeLabel(e.target.value)} /><Input type="number" className="w-28" value={feeAmt} onChange={(e) => setFeeAmt(Number(e.target.value))} /><Button variant="outline" onClick={() => { if (feeLabel) { F("fees", [...draft.fees, { label: feeLabel, amount: feeAmt }]); setFeeLabel(""); setFeeAmt(0); } }}>Add</Button></div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm">
          <label className="flex items-center gap-2"><Switch checked={draft.verified.identity} onCheckedChange={(v) => F("verified", { ...draft.verified, identity: v })} />Government ID uploaded</label>
          <label className="flex items-center gap-2"><Switch checked={draft.verified.ownership} onCheckedChange={(v) => F("verified", { ...draft.verified, ownership: v })} />Deed / management agreement uploaded</label>
        </div>
        <Button className="mt-4" disabled={!draft.name} onClick={() => { upsertListing({ ...draft, updatedAt: today() }); toast.success("Listing published"); setDraft(blank()); }}>Publish listing</Button>
      </Section>
      <div className="space-y-6">
        <Section title="Your listings">
          <div className="space-y-3">{mine.map((l) => (
            <div key={l.id} className="rounded-xl border p-3 text-sm">
              <div className="flex items-center justify-between"><b>{l.name}</b><TrustBadge l={l} /></div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Fld l="Rent"><Input type="number" value={l.rent} onChange={(e) => upsertListing({ ...l, rent: Number(e.target.value), updatedAt: today() })} /></Fld>
                <Fld l="Units available"><Input type="number" value={l.unitsAvailable} onChange={(e) => upsertListing({ ...l, unitsAvailable: Number(e.target.value), updatedAt: today() })} /></Fld>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Last updated {l.updatedAt} — students see changes instantly</div>
            </div>))}</div>
        </Section>
        <Section title="Moderation requests">
          {moderation.map((m) => <ModCase key={m.id} id={m.id} />)}
          {!moderation.length && <p className="text-sm text-muted-foreground">No open reports.</p>}
        </Section>
      </div>
    </div>
  );
  function ModCase({ id }: { id: string }) {
    const m = moderation.find((x) => x.id === id)!;
    const l = listings.find((x) => x.id === m.listingId);
    const [note, setNote] = useState(m.landlordNote ?? "");
    return (
      <div className="space-y-2 rounded-xl border p-3 text-sm">
        <div className="flex justify-between"><b>{l?.name}</b><Badge variant={m.status === "Open" ? "destructive" : "secondary"}>{m.status}</Badge></div>
        <p>{m.reason}</p>
        <Textarea rows={2} placeholder="Correct the information or explain…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setModeration((ms) => ms.map((x) => x.id === id ? { ...x, status: "Docs submitted", landlordNote: note } : x)); if (l) upsertListing({ ...l, verified: { identity: true, ownership: l.verified.ownership } }); toast.success("Documents sent to Homebase moderators"); }}>Submit ID & ownership documents</Button>
        </div>
      </div>
    );
  }
}

function Fld({ l, children }: { l: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{l}</Label>{children}</div>;
}
