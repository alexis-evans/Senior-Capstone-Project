import { Lock } from "lucide-react";
import { useHomebase } from "@/lib/homebase-store";
import { CostCompareTable } from "./StudentView";
import { LeaseFindings } from "./LeaseAnalyzer";
import { ListingDetail, Section, TrustBadge } from "./shared";

export function ParentView() {
  const { share, listings, reviews, incidents, hiddenFees, leaseSummary } = useHomebase();
  if (!share.enabled) return <Section title="Nothing shared yet"><p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" />Your student hasn't turned on sharing.</p></Section>;
  const shared = listings.filter((l) => share.listingIds.includes(l.id));
  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="h-4 w-4" />You only see what your student chose to share.</p>
      {share.shareCosts && shared.length > 0 && <Section title="Cost comparison"><CostCompareTable ids={share.listingIds} listings={listings} hiddenFees={hiddenFees} /></Section>}
      {share.shareLease && leaseSummary && <Section title={`Lease summary · ${leaseSummary.fileName}`}><LeaseFindings findings={leaseSummary.findings} /></Section>}
      {shared.map((l) => (
        <Section key={l.id} title={l.name} action={<TrustBadge l={l} />}>
          <ListingDetail l={l} reviews={reviews} incidents={incidents} fees={hiddenFees} sections={{ cost: share.shareCosts, commute: share.shareCommute, reviews: share.shareReviews }} />
        </Section>
      ))}
    </div>
  );
}
