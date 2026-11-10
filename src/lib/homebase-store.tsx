import { createContext, useContext, useState, type ReactNode } from "react";
import {
  HIDDEN_FEES, INCIDENTS, LISTINGS, MODERATION, REVIEWS,
  type HiddenFee, type Incident, type LeaseFinding, type Listing, type ModerationCase, type Review, type Role,
} from "./homebase-data";

export interface ParentShare {
  enabled: boolean;
  listingIds: string[];
  shareCosts: boolean;
  shareCommute: boolean;
  shareReviews: boolean;
  shareLease: boolean;
}

interface Store {
  role: Role;
  setRole: (r: Role) => void;
  listings: Listing[];
  upsertListing: (l: Listing) => void;
  reviews: Review[];
  setReviews: (fn: (r: Review[]) => Review[]) => void;
  incidents: Incident[];
  setIncidents: (fn: (r: Incident[]) => Incident[]) => void;
  hiddenFees: HiddenFee[];
  addHiddenFee: (f: HiddenFee) => void;
  moderation: ModerationCase[];
  setModeration: (fn: (m: ModerationCase[]) => ModerationCase[]) => void;
  share: ParentShare;
  setShare: (s: ParentShare) => void;
  leaseSummary: { fileName: string; findings: LeaseFinding[] } | null;
  setLeaseSummary: (s: { fileName: string; findings: LeaseFinding[] } | null) => void;
}

const Ctx = createContext<Store | null>(null);

export function HomebaseProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("student");
  const [listings, setListings] = useState(LISTINGS);
  const [reviews, setReviewsState] = useState(REVIEWS);
  const [incidents, setIncidentsState] = useState(INCIDENTS);
  const [hiddenFees, setHiddenFees] = useState(HIDDEN_FEES);
  const [moderation, setModerationState] = useState(MODERATION);
  const [share, setShare] = useState<ParentShare>({ enabled: true, listingIds: ["l1", "l2"], shareCosts: true, shareCommute: true, shareReviews: true, shareLease: false });
  const [leaseSummary, setLeaseSummary] = useState<Store["leaseSummary"]>(null);

  return (
    <Ctx.Provider
      value={{
        role, setRole, listings,
        upsertListing: (l) => setListings((ls) => (ls.some((x) => x.id === l.id) ? ls.map((x) => (x.id === l.id ? l : x)) : [l, ...ls])),
        reviews, setReviews: (fn) => setReviewsState(fn),
        incidents, setIncidents: (fn) => setIncidentsState(fn),
        hiddenFees, addHiddenFee: (f) => setHiddenFees((h) => [f, ...h]),
        moderation, setModeration: (fn) => setModerationState(fn),
        share, setShare, leaseSummary, setLeaseSummary,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useHomebase() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useHomebase outside provider");
  return c;
}

export const uid = () => Math.random().toString(36).slice(2, 9);
export const today = () => new Date().toISOString().slice(0, 10);
