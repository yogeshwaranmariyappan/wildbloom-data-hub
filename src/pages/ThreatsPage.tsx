import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchThreats, createThreat, type Threat } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const CATEGORIES = ["Deforestation", "Pollution", "Climate Change", "Invasive Species", "Poaching", "Urbanization", "Mining", "Agriculture"];
const SEVERITIES = ["low", "moderate", "high", "critical"];

export default function ThreatsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Deforestation", severity: "moderate" as Threat["severity"], affected_area: "", description: "", mitigation_plan: "", reported_date: new Date().toISOString().split("T")[0] });

  const { data: threats = [], isLoading } = useQuery({ queryKey: ["threats"], queryFn: fetchThreats });

  const addMutation = useMutation({
    mutationFn: createThreat,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["threats"] }); setOpen(false); toast.success("Threat reported"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    addMutation.mutate({ ...form, description: form.description || null, mitigation_plan: form.mitigation_plan || null });
  };

  return (
    <AppLayout title="Threats" subtitle={`${threats.length} active threats`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ Report Threat</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-card h-40 animate-pulse bg-muted" />) : threats.map((t) => (
          <div key={t.id} className="surface-card-hover p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${t.severity === "critical" ? "text-destructive" : t.severity === "high" ? "text-orange-500" : t.severity === "moderate" ? "text-warning" : "text-accent"}`} />
                <div className="font-semibold text-foreground">{t.name}</div>
              </div>
              <span className={`status-badge threat-${t.severity}`}>{t.severity}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{t.category} • {t.affected_area}</div>
            {t.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{t.description}</p>}
            {t.mitigation_plan && <div className="text-xs text-primary/80 mt-2"><strong>Mitigation:</strong> {t.mitigation_plan}</div>}
            <div className="mt-2 font-mono text-xs text-muted-foreground/60 tabular-nums">Reported: {t.reported_date}</div>
          </div>
        ))}
        {!isLoading && threats.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No threats reported.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report Threat</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Threat Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Severity</Label><Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v as Threat["severity"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Affected Area</Label><Input value={form.affected_area} onChange={e => setForm(f => ({ ...f, affected_area: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Reported Date</Label><Input type="date" value={form.reported_date} onChange={e => setForm(f => ({ ...f, reported_date: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Mitigation Plan</Label><Textarea value={form.mitigation_plan} onChange={e => setForm(f => ({ ...f, mitigation_plan: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.affected_area || addMutation.isPending}>{addMutation.isPending ? "Saving..." : "Report Threat"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
