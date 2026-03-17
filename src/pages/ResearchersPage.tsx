import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchResearchers, createResearcher } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Mail, Briefcase, Clock } from "lucide-react";

export default function ResearchersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", specialization: "", institution: "", field_experience_years: "0", active_surveys: "0" });

  const { data: researchers = [], isLoading } = useQuery({ queryKey: ["researchers"], queryFn: fetchResearchers });

  const addMutation = useMutation({
    mutationFn: createResearcher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["researchers"] }); setOpen(false); toast.success("Researcher added"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    addMutation.mutate({ ...form, field_experience_years: Number(form.field_experience_years), active_surveys: Number(form.active_surveys) });
  };

  return (
    <AppLayout title="Researchers" subtitle={`${researchers.length} team members`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ Add Researcher</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-card h-40 animate-pulse bg-muted" />) : researchers.map((r) => (
          <div key={r.id} className="surface-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">{r.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <div className="font-semibold text-foreground">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.specialization}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {r.email}</div>
              <div className="flex items-center gap-2"><Briefcase className="h-3 w-3" /> {r.institution}</div>
              <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {r.field_experience_years} yrs experience • {r.active_surveys} active surveys</div>
            </div>
          </div>
        ))}
        {!isLoading && researchers.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No researchers registered.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Researcher</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Herpetology" /></div>
              <div className="grid gap-2"><Label>Institution</Label><Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Field Experience (years)</Label><Input type="number" value={form.field_experience_years} onChange={e => setForm(f => ({ ...f, field_experience_years: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Active Surveys</Label><Input type="number" value={form.active_surveys} onChange={e => setForm(f => ({ ...f, active_surveys: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.email || addMutation.isPending}>{addMutation.isPending ? "Saving..." : "Add Researcher"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
