export type Role = "student" | "landlord" | "reviewer" | "admin" | "manager" | "parent";

export type Layout = "Studio" | "1BR" | "2BR" | "3BR" | "4BR";

export interface Listing {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  neighborhoodTraits: string[];
  rent: number; // per bedroom / month
  layout: Layout;
  bedrooms: number;
  distanceMi: number;
  commuteMin: { walk: number; transit: number; drive: number };
  transitScore: number; // 0-100
  safetyScore: number; // 0-100
  amenities: string[];
  nearby: string[];
  utilities: number;
  internet: number;
  transit: number;
  parking: number;
  deposit: number;
  insurance: number;
  fees: { label: string; amount: number }[];
  applicationFee: number;
  leaseMonths: number;
  moveIn: string;
  sublet: "Allowed" | "With approval" | "Not allowed";
  occupancyLimit: number;
  qualification: { incomeMultiple: number; minCredit: number; guarantorAccepted: boolean };
  unitsAvailable: number;
  verified: { identity: boolean; ownership: boolean };
  landlord: string;
  managementChangedOn?: string;
  x: number; // map position 0-100
  y: number;
  updatedAt: string;
  history: string[];
}

export type ReviewCategory = "management" | "maintenance" | "noise" | "safety" | "fees" | "amenities";

export interface Review {
  id: string;
  listingId: string;
  author: string;
  visibility: "named" | "pseudonym" | "anonymous";
  date: string;
  ratings: Record<ReviewCategory, number>;
  text: string;
  verifiedLease: boolean;
  flagged?: { reason: string; status: "pending" | "upheld" | "dismissed" };
  response?: string;
}

export type IncidentType = "Power outage" | "Pests" | "Delayed repair" | "Water / plumbing" | "Heating / cooling" | "Safety / security";

export interface Incident {
  id: string;
  listingId: string;
  type: IncidentType;
  date: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  status: "Reported" | "Acknowledged" | "In progress" | "Resolved";
  updates: { date: string; text: string }[];
}

export interface HiddenFee {
  id: string;
  listingId: string;
  label: string;
  monthly: number;
  date: string;
}

export interface ModerationCase {
  id: string;
  listingId: string;
  reason: string;
  status: "Open" | "Docs submitted" | "Cleared";
  landlordNote?: string;
}

export const CAMPUS = { x: 50, y: 42, name: "Howard University" };

export const LISTINGS: Listing[] = [
  {
    id: "l1", name: "The Georgia Flats", address: "2640 Georgia Ave NW", neighborhood: "Pleasant Plains",
    neighborhoodTraits: ["Walkable", "Student-heavy", "Nightlife"], rent: 1250, layout: "2BR", bedrooms: 2,
    distanceMi: 0.4, commuteMin: { walk: 8, transit: 6, drive: 4 }, transitScore: 92, safetyScore: 68,
    amenities: ["In-unit laundry", "Study lounge", "Bike storage"], nearby: ["Grocery 0.2mi", "Shaw-Howard Metro 0.6mi", "Pharmacy 0.3mi"],
    utilities: 95, internet: 40, transit: 0, parking: 0, deposit: 1250, insurance: 15,
    fees: [{ label: "Amenity fee", amount: 35 }, { label: "Trash/valet", amount: 20 }], applicationFee: 60,
    leaseMonths: 12, moveIn: "2027-08-01", sublet: "With approval", occupancyLimit: 2,
    qualification: { incomeMultiple: 3, minCredit: 650, guarantorAccepted: true }, unitsAvailable: 4,
    verified: { identity: true, ownership: true }, landlord: "Georgia Ave Holdings LLC", x: 52, y: 32, updatedAt: "2026-11-08",
    history: ["Built 2018", "Ownership unchanged since 2018", "No code violations on record"],
  },
  {
    id: "l2", name: "LeDroit Rowhouse Rooms", address: "418 Elm St NW", neighborhood: "LeDroit Park",
    neighborhoodTraits: ["Quiet", "Historic", "Walkable"], rent: 980, layout: "4BR", bedrooms: 4,
    distanceMi: 0.3, commuteMin: { walk: 6, transit: 8, drive: 4 }, transitScore: 85, safetyScore: 72,
    amenities: ["Backyard", "Shared kitchen", "Washer/dryer"], nearby: ["Cafe 0.1mi", "Park 0.2mi", "Grocery 0.5mi"],
    utilities: 70, internet: 20, transit: 0, parking: 0, deposit: 980, insurance: 15,
    fees: [], applicationFee: 40, leaseMonths: 12, moveIn: "2027-06-01", sublet: "Allowed", occupancyLimit: 4,
    qualification: { incomeMultiple: 2.5, minCredit: 600, guarantorAccepted: true }, unitsAvailable: 2,
    verified: { identity: true, ownership: true }, landlord: "M. Thompson (individual owner)", x: 58, y: 48, updatedAt: "2026-11-05",
    history: ["Renovated 2021", "Owner-managed", "1 resolved violation (2022, smoke detector)"],
  },
  {
    id: "l3", name: "Columbia Heights Tower", address: "3100 14th St NW", neighborhood: "Columbia Heights",
    neighborhoodTraits: ["Shopping", "Diverse dining", "Busy"], rent: 1650, layout: "1BR", bedrooms: 1,
    distanceMi: 1.2, commuteMin: { walk: 24, transit: 14, drive: 8 }, transitScore: 96, safetyScore: 64,
    amenities: ["Gym", "Concierge", "Rooftop", "Package lockers"], nearby: ["Columbia Heights Metro 0.1mi", "Target 0.2mi", "Gym 0.0mi"],
    utilities: 110, internet: 55, transit: 64, parking: 175, deposit: 1650, insurance: 18,
    fees: [{ label: "Amenity fee", amount: 75 }, { label: "Pet rent", amount: 0 }, { label: "Admin fee (monthly)", amount: 25 }], applicationFee: 85,
    leaseMonths: 12, moveIn: "2027-07-15", sublet: "Not allowed", occupancyLimit: 2,
    qualification: { incomeMultiple: 3.5, minCredit: 700, guarantorAccepted: false }, unitsAvailable: 9,
    verified: { identity: true, ownership: false }, landlord: "Capstone Residential", managementChangedOn: "2026-03-01", x: 30, y: 22, updatedAt: "2026-11-09",
    history: ["Built 2009", "Management changed March 2026", "3 open housing code complaints (2025)"],
  },
  {
    id: "l4", name: "Brookland Commons", address: "901 Monroe St NE", neighborhood: "Brookland",
    neighborhoodTraits: ["Quiet", "Green space", "Family-friendly"], rent: 1100, layout: "3BR", bedrooms: 3,
    distanceMi: 2.4, commuteMin: { walk: 48, transit: 22, drive: 11 }, transitScore: 74, safetyScore: 81,
    amenities: ["Parking included", "Dishwasher", "Courtyard"], nearby: ["Brookland Metro 0.4mi", "Grocery 0.6mi", "Library 0.3mi"],
    utilities: 85, internet: 30, transit: 64, parking: 0, deposit: 2200, insurance: 15,
    fees: [{ label: "Pest control", amount: 10 }], applicationFee: 50, leaseMonths: 12, moveIn: "2027-08-15", sublet: "With approval", occupancyLimit: 3,
    qualification: { incomeMultiple: 3, minCredit: 620, guarantorAccepted: true }, unitsAvailable: 3,
    verified: { identity: true, ownership: true }, landlord: "Brookland Living Co.", x: 82, y: 30, updatedAt: "2026-10-30",
    history: ["Built 2015", "No code violations on record"],
  },
  {
    id: "l5", name: "Shaw Studio Lofts", address: "1720 7th St NW", neighborhood: "Shaw",
    neighborhoodTraits: ["Nightlife", "Walkable", "Diverse dining"], rent: 1525, layout: "Studio", bedrooms: 1,
    distanceMi: 1.0, commuteMin: { walk: 20, transit: 10, drive: 7 }, transitScore: 94, safetyScore: 66,
    amenities: ["In-unit laundry", "Gym"], nearby: ["Shaw-Howard Metro 0.2mi", "Grocery 0.3mi"],
    utilities: 80, internet: 50, transit: 64, parking: 0, deposit: 1525, insurance: 15,
    fees: [{ label: "Amenity fee", amount: 50 }], applicationFee: 75, leaseMonths: 12, moveIn: "2027-05-15", sublet: "Not allowed", occupancyLimit: 1,
    qualification: { incomeMultiple: 3, minCredit: 680, guarantorAccepted: true }, unitsAvailable: 1,
    verified: { identity: false, ownership: false }, landlord: "Unverified poster", x: 48, y: 66, updatedAt: "2026-09-12",
    history: ["Listing posted via social media import", "Ownership not yet verified"],
  },
  {
    id: "l6", name: "Petworth Garden Apartments", address: "4200 Georgia Ave NW", neighborhood: "Petworth",
    neighborhoodTraits: ["Quiet", "Green space", "Diverse dining"], rent: 1050, layout: "2BR", bedrooms: 2,
    distanceMi: 1.8, commuteMin: { walk: 36, transit: 15, drive: 9 }, transitScore: 82, safetyScore: 75,
    amenities: ["Dishwasher", "Garden", "Bike storage"], nearby: ["Georgia Ave-Petworth Metro 0.3mi", "Farmers market 0.4mi"],
    utilities: 90, internet: 35, transit: 64, parking: 90, deposit: 1050, insurance: 15,
    fees: [{ label: "Trash", amount: 15 }], applicationFee: 45, leaseMonths: 10, moveIn: "2027-08-20", sublet: "Allowed", occupancyLimit: 2,
    qualification: { incomeMultiple: 2.5, minCredit: 0, guarantorAccepted: true }, unitsAvailable: 5,
    verified: { identity: true, ownership: true }, landlord: "Petworth Partners", x: 44, y: 10, updatedAt: "2026-11-02",
    history: ["Built 1962, renovated 2019", "No code violations since 2019"],
  },
];

const r = (m: number, ma: number, n: number, s: number, f: number, a: number) => ({ management: m, maintenance: ma, noise: n, safety: s, fees: f, amenities: a });

export const REVIEWS: Review[] = [
  { id: "r1", listingId: "l1", author: "Bison '26", visibility: "pseudonym", date: "2026-06-02", ratings: r(4, 4, 3, 3, 4, 5), text: "Great location, staff responsive. Weekends get loud near Georgia Ave.", verifiedLease: true },
  { id: "r2", listingId: "l1", author: "Anonymous resident", visibility: "anonymous", date: "2025-12-10", ratings: r(5, 4, 3, 4, 3, 4), text: "Maintenance usually came within two days. Amenity fee wasn't mentioned until signing.", verifiedLease: true },
  { id: "r3", listingId: "l3", author: "Anonymous resident", visibility: "anonymous", date: "2025-08-14", ratings: r(1, 1, 3, 2, 1, 4), text: "Old management ignored repair tickets for weeks. Hidden admin fee each month.", verifiedLease: true },
  { id: "r4", listingId: "l3", author: "Kia J.", visibility: "named", date: "2026-09-20", ratings: r(4, 4, 3, 3, 2, 5), text: "New management since spring is way better—repairs within days. Fees still high.", verifiedLease: true },
  { id: "r5", listingId: "l3", author: "Anonymous resident", visibility: "anonymous", date: "2025-05-01", ratings: r(2, 1, 2, 2, 2, 3), text: "Elevator out for a month. Never again.", verifiedLease: true, flagged: { reason: "Possibly inaccurate dates", status: "pending" } },
  { id: "r6", listingId: "l2", author: "Rowhouse Rita", visibility: "pseudonym", date: "2026-05-28", ratings: r(5, 4, 5, 4, 5, 4), text: "Owner lives nearby and fixes things fast. Quiet street, great for studying.", verifiedLease: true },
  { id: "r7", listingId: "l4", author: "Anonymous resident", visibility: "anonymous", date: "2026-04-11", ratings: r(4, 3, 5, 5, 4, 4), text: "Peaceful and safe, but commute is long without a car.", verifiedLease: true },
  { id: "r8", listingId: "l6", author: "D. Carter", visibility: "named", date: "2026-07-01", ratings: r(4, 4, 4, 4, 4, 3), text: "Solid value. Water heater broke once, fixed within a day.", verifiedLease: true },
  { id: "r9", listingId: "l5", author: "Anonymous", visibility: "anonymous", date: "2026-08-03", ratings: r(1, 2, 2, 2, 1, 2), text: "Poster asked for deposit via Cash App before showing. Be careful.", verifiedLease: false },
];

export const INCIDENTS: Incident[] = [
  { id: "i1", listingId: "l3", type: "Delayed repair", date: "2025-07-10", description: "AC out in unit 8C for 19 days.", severity: "High", status: "Resolved", updates: [{ date: "2025-07-29", text: "Unit replaced." }] },
  { id: "i2", listingId: "l3", type: "Power outage", date: "2026-10-02", description: "Floors 4–6 without power for 9 hours.", severity: "Medium", status: "In progress", updates: [{ date: "2026-10-03", text: "Electrician scheduled to replace panel." }] },
  { id: "i3", listingId: "l1", type: "Pests", date: "2026-09-18", description: "Mice sighted in trash room.", severity: "Low", status: "Acknowledged", updates: [] },
  { id: "i4", listingId: "l5", type: "Safety / security", date: "2026-08-20", description: "Front door lock broken, building open overnight.", severity: "High", status: "Reported", updates: [] },
  { id: "i5", listingId: "l6", type: "Water / plumbing", date: "2026-06-25", description: "Water heater failure.", severity: "Medium", status: "Resolved", updates: [{ date: "2026-06-26", text: "Replaced." }] },
];

export const HIDDEN_FEES: HiddenFee[] = [
  { id: "h1", listingId: "l3", label: "Monthly admin fee not in listing", monthly: 25, date: "2025-08-14" },
  { id: "h2", listingId: "l1", label: "Amenity fee disclosed only at signing", monthly: 35, date: "2025-12-10" },
];

export const MODERATION: ModerationCase[] = [
  { id: "m1", listingId: "l5", reason: "Reported as possible scam: deposit requested before showing", status: "Open" },
];

export const RENT_TREND = [
  { term: "F23", avgRent: 1080, avgTotal: 1390 },
  { term: "S24", avgRent: 1110, avgTotal: 1430 },
  { term: "F24", avgRent: 1170, avgTotal: 1505 },
  { term: "S25", avgRent: 1195, avgTotal: 1545 },
  { term: "F25", avgRent: 1240, avgTotal: 1600 },
  { term: "S26", avgRent: 1265, avgTotal: 1640 },
  { term: "F26", avgRent: 1310, avgTotal: 1705 },
];

// ---------- Cost engine (F2) ----------
export interface CostBreakdown {
  monthly: { label: string; amount: number }[];
  monthlyTotal: number;
  moveIn: { label: string; amount: number }[];
  moveInTotal: number;
  leaseTotal: number;
}

export function totalCost(l: Listing, opts: { needsParking?: boolean; usesTransit?: boolean } = {}, extraFees: HiddenFee[] = []): CostBreakdown {
  const { needsParking = false, usesTransit = true } = opts;
  const monthly = [
    { label: "Advertised rent", amount: l.rent },
    { label: "Utilities (est.)", amount: l.utilities },
    { label: "Internet", amount: l.internet },
    { label: "Transit pass", amount: usesTransit ? l.transit : 0 },
    { label: "Parking", amount: needsParking ? l.parking : 0 },
    { label: "Renter's insurance", amount: l.insurance },
    ...l.fees.map((f) => ({ label: f.label, amount: f.amount })),
    ...extraFees.map((f) => ({ label: `Reported: ${f.label}`, amount: f.monthly })),
  ].filter((x) => x.amount > 0 || x.label === "Advertised rent");
  const monthlyTotal = monthly.reduce((s, x) => s + x.amount, 0);
  const moveIn = [
    { label: "First month (all-in)", amount: monthlyTotal },
    { label: "Security deposit", amount: l.deposit },
    { label: "Application fee", amount: l.applicationFee },
  ];
  const moveInTotal = moveIn.reduce((s, x) => s + x.amount, 0);
  return { monthly, monthlyTotal, moveIn, moveInTotal, leaseTotal: monthlyTotal * l.leaseMonths + l.deposit + l.applicationFee };
}

// ---------- Recommendation engine (F4) ----------
export interface Preferences {
  maxBudget: number; // hard: all-in monthly
  maxCommute: number; // hard: transit minutes
  layouts: Layout[]; // hard (empty = any)
  verifiedOnly: boolean; // hard
  weights: { cost: number; commute: number; safety: number; reviews: number; amenities: number };
}

export interface MatchResult {
  listing: Listing;
  score: number;
  passes: boolean;
  failures: string[];
  reasons: { label: string; value: number; note: string }[];
}

export function avgRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  const all = reviews.map((rv) => Object.values(rv.ratings).reduce((a, b) => a + b, 0) / 6);
  return all.reduce((a, b) => a + b, 0) / all.length;
}

export function matchScore(l: Listing, p: Preferences, reviews: Review[], fees: HiddenFee[] = []): MatchResult {
  const cost = totalCost(l, {}, fees).monthlyTotal;
  const failures: string[] = [];
  if (cost > p.maxBudget) failures.push(`All-in $${cost}/mo exceeds $${p.maxBudget} budget`);
  if (l.commuteMin.transit > p.maxCommute) failures.push(`${l.commuteMin.transit} min commute exceeds ${p.maxCommute} min`);
  if (p.layouts.length && !p.layouts.includes(l.layout)) failures.push(`${l.layout} not in preferred layouts`);
  if (p.verifiedOnly && !(l.verified.identity && l.verified.ownership)) failures.push("Not fully verified");

  const costS = Math.max(0, Math.min(1, (p.maxBudget - cost) / (p.maxBudget * 0.4) + 0.5));
  const commuteS = Math.max(0, 1 - l.commuteMin.transit / 45);
  const safetyS = l.safetyScore / 100;
  const rv = reviews.filter((x) => x.listingId === l.id);
  const reviewS = rv.length ? avgRating(rv) / 5 : 0.5;
  const amenS = Math.min(1, l.amenities.length / 4);
  const w = p.weights;
  const wsum = w.cost + w.commute + w.safety + w.reviews + w.amenities || 1;
  const raw = (costS * w.cost + commuteS * w.commute + safetyS * w.safety + reviewS * w.reviews + amenS * w.amenities) / wsum;
  const score = Math.round(raw * 100);
  return {
    listing: l, score, passes: failures.length === 0, failures,
    reasons: [
      { label: "Affordability", value: Math.round(costS * 100), note: `$${cost}/mo all-in vs $${p.maxBudget} budget` },
      { label: "Commute", value: Math.round(commuteS * 100), note: `${l.commuteMin.transit} min by transit` },
      { label: "Safety", value: Math.round(safetyS * 100), note: `Neighborhood safety index ${l.safetyScore}` },
      { label: "Resident reviews", value: Math.round(reviewS * 100), note: rv.length ? `${avgRating(rv).toFixed(1)}★ from ${rv.length} reviews` : "No reviews yet (neutral)" },
      { label: "Amenities", value: Math.round(amenS * 100), note: l.amenities.slice(0, 3).join(", ") },
    ],
  };
}

// ---------- Roommate matcher (F6) ----------
export interface RoommateProfile {
  id: string;
  name: string;
  major: string;
  sleep: number; // 1 early – 5 late
  cleanliness: number; // 1 relaxed – 5 spotless
  social: number; // 1 quiet – 5 guests often
  study: number; // 1 out – 5 at home, needs quiet
  budget: number;
}

export const ROOMMATES: RoommateProfile[] = [
  { id: "p1", name: "Jordan A.", major: "Biology", sleep: 2, cleanliness: 4, social: 2, study: 5, budget: 1100 },
  { id: "p2", name: "Taylor M.", major: "Business", sleep: 4, cleanliness: 3, social: 4, study: 2, budget: 1400 },
  { id: "p3", name: "Imani R.", major: "Engineering", sleep: 3, cleanliness: 5, social: 2, study: 4, budget: 1200 },
  { id: "p4", name: "Chris O.", major: "Film", sleep: 5, cleanliness: 2, social: 5, study: 1, budget: 1000 },
  { id: "p5", name: "Ama K.", major: "Nursing", sleep: 1, cleanliness: 4, social: 3, study: 4, budget: 1150 },
];

export type RoommateWeights = { sleep: number; cleanliness: number; social: number; study: number; budget: number };

export function roommateScore(a: RoommateProfile, b: RoommateProfile, w: RoommateWeights) {
  const dims: (keyof Omit<RoommateProfile, "id" | "name" | "major" | "budget">)[] = ["sleep", "cleanliness", "social", "study"];
  const parts = { sleep: 0, cleanliness: 0, social: 0, study: 0, budget: 0 };
  for (const d of dims) parts[d] = 1 - Math.abs(a[d] - b[d]) / 4;
  parts.budget = Math.max(0, 1 - Math.abs(a.budget - b.budget) / 600);
  const wsum = w.sleep + w.cleanliness + w.social + w.study + w.budget || 1;
  const score = Math.round(((parts.sleep * w.sleep + parts.cleanliness * w.cleanliness + parts.social * w.social + parts.study * w.study + parts.budget * w.budget) / wsum) * 100);
  const conflicts: string[] = [];
  if (Math.abs(a.sleep - b.sleep) >= 3) conflicts.push("Sleep schedules clash — late-night noise likely");
  if (Math.abs(a.cleanliness - b.cleanliness) >= 2) conflicts.push("Cleanliness expectations differ — chore friction likely");
  if (Math.abs(a.social - b.social) >= 3 || (b.social >= 4 && a.study >= 4)) conflicts.push("Guests vs. study-at-home needs may conflict");
  if (Math.abs(a.budget - b.budget) >= 300) conflicts.push("Budgets differ by $300+ — unit choice disagreements");
  return { score, parts, conflicts };
}

export function bestGroup(me: RoommateProfile, pool: RoommateProfile[], size: number, w: RoommateWeights) {
  // exhaustive search over combos (small pools) maximizing average pairwise score
  const n = size - 1;
  let best: { members: RoommateProfile[]; avg: number } = { members: [], avg: -1 };
  const combo = (start: number, acc: RoommateProfile[]) => {
    if (acc.length === n) {
      const g = [me, ...acc];
      let s = 0, c = 0;
      for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) { s += roommateScore(g[i]!, g[j]!, w).score; c++; }
      const avg = c ? s / c : 0;
      if (avg > best.avg) best = { members: acc.slice(), avg };
      return;
    }
    for (let i = start; i < pool.length; i++) combo(i + 1, [...acc, pool[i]!]);
  };
  combo(0, []);
  return { members: best.members, avg: Math.round(best.avg) };
}

// ---------- Lease intelligence (F7) ----------
export interface LeaseFinding {
  category: "Fee" | "Termination" | "Liability" | "Subletting" | "Renewal" | "Deposit" | "Term";
  risk: "High" | "Medium" | "Info";
  clause: string;
  explanation: string;
}

const LEASE_RULES: { re: RegExp; category: LeaseFinding["category"]; risk: LeaseFinding["risk"]; explanation: string }[] = [
  { re: /(early termination|terminate).{0,120}(fee|penalt|months'? rent|month's rent)/i, category: "Termination", risk: "High", explanation: "Breaking the lease carries a penalty — know the exact cost before signing." },
  { re: /(automatic(ally)? renew|auto-renew)/i, category: "Renewal", risk: "High", explanation: "Lease renews automatically unless you give notice in time." },
  { re: /(sublet|sublease|assign).{0,80}(prohibit|not permitted|not allowed|without .{0,20}written consent)/i, category: "Subletting", risk: "Medium", explanation: "Subletting is restricted — summer internships or study abroad could leave you paying rent." },
  { re: /(tenant|resident) (shall be|is) (solely )?(responsible|liable).{0,100}(repair|damage|all)/i, category: "Liability", risk: "High", explanation: "Shifts repair or damage liability onto you beyond normal wear." },
  { re: /(indemnif|hold harmless)/i, category: "Liability", risk: "Medium", explanation: "You agree to cover the landlord's legal costs in some situations." },
  { re: /(late fee|late charge).{0,60}(\$\s?\d+|\d+%)/i, category: "Fee", risk: "Medium", explanation: "Late payment fee — check grace period and whether it's capped." },
  { re: /(amenity|admin(istrative)?|convenience|valet|technology|community) fee/i, category: "Fee", risk: "Medium", explanation: "Recurring fee not usually included in advertised rent." },
  { re: /(non-?refundable)/i, category: "Deposit", risk: "Medium", explanation: "Part of what you pay will not be returned." },
  { re: /(security deposit).{0,80}(\$\s?[\d,]+|equal to)/i, category: "Deposit", risk: "Info", explanation: "Security deposit amount and terms." },
  { re: /(term of|lease term|commenc).{0,80}(\d+\s?months|\d{4})/i, category: "Term", risk: "Info", explanation: "Lease length and start date." },
  { re: /(utilities?).{0,80}(tenant|resident).{0,30}(responsible|pay)/i, category: "Fee", risk: "Info", explanation: "You pay utilities on top of rent — budget for them." },
];

export function analyzeLease(text: string): LeaseFinding[] {
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.;])\s+/);
  const out: LeaseFinding[] = [];
  for (const s of sentences) {
    for (const rule of LEASE_RULES) {
      if (rule.re.test(s) && !out.some((o) => o.clause === s.trim() && o.category === rule.category)) {
        out.push({ category: rule.category, risk: rule.risk, clause: s.trim(), explanation: rule.explanation });
      }
    }
  }
  const order = { High: 0, Medium: 1, Info: 2 };
  return out.sort((a, b) => order[a.risk] - order[b.risk]);
}

export const SAMPLE_LEASE = `RESIDENTIAL LEASE AGREEMENT. The term of this lease shall be 12 months commencing August 1, 2027. Monthly rent is $1,250 due on the first of each month. A late fee of $75 will be charged if rent is received after the 5th. Tenant is responsible for paying all utilities including electricity, gas, and water. A monthly amenity fee of $35 and a valet trash fee of $20 apply in addition to rent. The security deposit shall be equal to one month's rent. A non-refundable move-in fee of $250 is due at signing. Tenant may not sublet or assign this lease without the Landlord's prior written consent. Should Tenant terminate this lease early, Tenant shall pay an early termination fee equal to two months' rent. This lease will automatically renew for successive 12-month terms unless either party provides 60 days written notice. Tenant shall be solely responsible for all repairs to appliances regardless of cause. Tenant agrees to indemnify and hold harmless the Landlord from any claims arising from Tenant's use of the premises.`;

export const ROLE_META: Record<Role, { label: string; blurb: string }> = {
  student: { label: "Student", blurb: "Search, compare, and decide" },
  landlord: { label: "Landlord", blurb: "List and verify properties" },
  reviewer: { label: "Senior Reviewer", blurb: "Share your lease experience" },
  admin: { label: "Housing Admin", blurb: "Anonymized trends" },
  manager: { label: "Property Manager", blurb: "Respond to residents" },
  parent: { label: "Parent / Guardian", blurb: "See what your student shares" },
};
