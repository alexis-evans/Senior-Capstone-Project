import { useState } from "react";
import { Download, FileUp, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_LEASE, analyzeLease, type LeaseFinding } from "@/lib/homebase-data";
import { useHomebase } from "@/lib/homebase-store";
import { Section } from "./shared";

export function LeaseFindings({ findings }: { findings: LeaseFinding[] }) {
  const high = findings.filter((f) => f.risk === "High").length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-sm"><Badge variant="destructive">{high} high risk</Badge><Badge className="bg-warning text-warning-foreground hover:bg-warning">{findings.filter((f) => f.risk === "Medium").length} watch</Badge><Badge variant="secondary">{findings.filter((f) => f.risk === "Info").length} key terms</Badge></div>
      {findings.map((f, i) => (
        <div key={i} className={`rounded-xl border-l-4 bg-card p-4 shadow-card ${f.risk === "High" ? "border-destructive" : f.risk === "Medium" ? "border-warning" : "border-primary"}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">{f.category}<Badge variant="outline">{f.risk}</Badge></div>
          <p className="mt-1 text-sm">{f.explanation}</p>
          <p className="mt-2 text-xs italic text-muted-foreground">“{f.clause}”</p>
        </div>
      ))}
    </div>
  );
}

function exportSummary(name: string, findings: LeaseFinding[]) {
  const txt = `HOMEBASE LEASE SUMMARY — ${name}\nGenerated ${new Date().toLocaleDateString()}\n\n` + findings.map((f) => `[${f.risk}] ${f.category}: ${f.explanation}\n   Clause: "${f.clause}"`).join("\n\n");
  const url = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
  const a = document.createElement("a"); a.href = url; a.download = "lease-summary.txt"; a.click(); URL.revokeObjectURL(url);
}

export function LeaseAnalyzer() {
  const { leaseSummary, setLeaseSummary, share, setShare } = useHomebase();
  const [text, setText] = useState("");
  const [name, setName] = useState("Pasted lease");

  const onFile = async (f: File) => {
    setName(f.name);
    if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
      const raw = await f.text();
      const parts = [...raw.matchAll(/\(([^)]{3,})\)\s*Tj/g)].map((m) => m[1]).join(" ");
      if (parts.length > 80) setText(parts);
      else toast.error("Couldn't read text from this PDF. Copy the lease text and paste it below.");
    } else setText(await f.text());
  };
  const run = () => {
    const findings = analyzeLease(text);
    if (!findings.length) { toast.error("No recognizable lease clauses found."); return; }
    setLeaseSummary({ fileName: name, findings });
    toast.success(`Found ${findings.length} clauses to review`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Upload or paste your lease">
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-muted-foreground hover:bg-secondary">
            <FileUp className="h-5 w-5" />Choose lease file (PDF or text)
            <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </label>
          <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="…or paste the lease text here" />
          <div className="flex gap-2">
            <Button onClick={run} disabled={!text.trim()}><Sparkles className="mr-1 h-4 w-4" />Analyze lease</Button>
            <Button variant="outline" onClick={() => { setText(SAMPLE_LEASE); setName("Sample lease — Georgia Flats"); }}>Try a sample lease</Button>
          </div>
        </div>
      </Section>
      <Section title="What to watch out for" action={leaseSummary && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportSummary(leaseSummary.fileName, leaseSummary.findings)}><Download className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm" variant={share.shareLease ? "secondary" : "default"} onClick={() => { setShare({ ...share, shareLease: !share.shareLease }); toast.success(share.shareLease ? "Stopped sharing with parent" : "Shared with your parent/guardian"); }}><Share2 className="mr-1 h-4 w-4" />{share.shareLease ? "Shared" : "Share with parent"}</Button>
        </div>
      )}>
        {leaseSummary ? <LeaseFindings findings={leaseSummary.findings} /> : <p className="text-sm text-muted-foreground">Run an analysis to see fees, termination penalties, liability and subletting risks in plain language.</p>}
      </Section>
    </div>
  );
}
