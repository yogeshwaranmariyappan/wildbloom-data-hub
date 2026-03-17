import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSurveys, createSurvey, fetchHabitats, type Survey } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SurveysPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", habitat_id: "", lead_researcher: "", start_date: new Date().toISOString().split("T")[0], end_date: "", methodology: "", status: "planned" as Survey["status"], species_count: "0" });

  const { data: surveys = [], isLoading } = useQuery({ queryKey: ["surveys"], queryFn: fetchSurveys });
  const { data: habitatsList = [] } = useQuery({ queryKey: ["habitats-all"], queryFn: () => fetchHabitats() });

  const addMutation = useMutation({
    mutationFn: createSurvey,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surveys"] }); setOpen(false); toast.success("Survey created"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    addMutation.mutate({
      ...form,
      habitat_id: form.habitat_id || null,
      end_date: form.end_date || null,
      methodology: form.methodology || null,
      species_count: Number(form.species_count) || 0,
    });
  };

  const statusColor = (s: string) => s === "completed" ? "status-lc" : s === "active" ? "status-nt" : "status-vu";

  return (
    <AppLayout title="Surveys" subtitle={`${surveys.length} surveys`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ New Survey</Button>}>
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Title</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Lead Researcher</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Habitat</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground tabular-nums">Start</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Species</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr> :
              surveys.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No surveys yet</td></tr> :
              surveys.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-3 font-medium text-foreground">{s.title}</td>
                  <td className="px-6 py-3 text-muted-foreground">{s.lead_researcher}</td>
                  <td className="px-6 py-3 text-muted-foreground">{s.habitat?.name ?? "–"}</td>
                  <td className="px-6 py-3"><span className={`status-badge ${statusColor(s.status)}`}>{s.status}</span></td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground tabular-nums">{s.start_date}</td>
                  <td className="px-6 py-3 text-muted-foreground">{s.species_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Survey</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Lead Researcher</Label><Input value={form.lead_researcher} onChange={e => setForm(f => ({ ...f, lead_researcher: e.target.value }))} /></div>
            <div className="grid gap-2">
              <Label>Habitat</Label>
              <Select value={form.habitat_id} onValueChange={v => setForm(f => ({ ...f, habitat_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select habitat" /></SelectTrigger>
                <SelectContent>{habitatsList.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Survey["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Species Count</Label><Input type="number" value={form.species_count} onChange={e => setForm(f => ({ ...f, species_count: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Methodology</Label><Textarea value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.title || !form.lead_researcher || addMutation.isPending}>{addMutation.isPending ? "Saving..." : "Create Survey"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
