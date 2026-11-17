import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useHomebase } from "@/lib/homebase-store";
import { Section } from "./shared";

export function PrivacyControls() {
  const { share, setShare, listings, leaseSummary } = useHomebase();
  const Row = ({ label, hint, k, disabled }: { label: string; hint: string; k: "enabled" | "shareCosts" | "shareCommute" | "shareReviews" | "shareLease"; disabled?: boolean }) => (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div><div className="text-sm font-semibold">{label}</div><div className="text-xs text-muted-foreground">{hint}</div></div>
      <Switch checked={share[k]} disabled={disabled} onCheckedChange={(v) => setShare({ ...share, [k]: v })} />
    </div>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Parent / guardian access" action={<ShieldCheck className="h-5 w-5 text-success" />}>
        <Row k="enabled" label="Allow parent access" hint="Your parent sees nothing unless this is on." />
        <Row k="shareCosts" disabled={!share.enabled} label="Cost estimates" hint="Monthly and move-in costs for shared homes" />
        <Row k="shareCommute" disabled={!share.enabled} label="Location & commute" hint="Map, transit and safety scores" />
        <Row k="shareReviews" disabled={!share.enabled} label="Reviews & incidents" hint="Resident experiences and trust badges" />
        <Row k="shareLease" disabled={!share.enabled || !leaseSummary} label="Lease summary" hint={leaseSummary ? leaseSummary.fileName : "Analyze a lease first"} />
      </Section>
      <Section title="Homes you're sharing">
        <div className="space-y-2">
          {listings.map((l) => (
            <label key={l.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              {l.name}
              <Switch disabled={!share.enabled} checked={share.listingIds.includes(l.id)} onCheckedChange={(v) => setShare({ ...share, listingIds: v ? [...share.listingIds, l.id] : share.listingIds.filter((x) => x !== l.id) })} />
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Your saved searches, roommate profile and messages are never shared.</p>
      </Section>
    </div>
  );
}
