import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSpecies, createSpecies, deleteSpecies, type Species } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const KINGDOMS = ["Animalia", "Plantae", "Fungi", "Protista", "Bacteria"];
const STATUSES = [
  { value: "LC", label: "LC – Least Concern" },
  { value: "NT", label: "NT – Near Threatened" },
  { value: "VU", label: "VU – Vulnerable" },
  { value: "EN", label: "EN – Endangered" },
  { value: "CR", label: "CR – Critical" },
];

export default function SpeciesPage() {
  const qc = useQueryClient();
  const [filterKingdom, setFilterKingdom] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ common_name: "", scientific_name: "", kingdom: "Animalia", conservation_status: "LC" as Species["conservation_status"], population_estimate: "", description: "" });

  const { data: species = [], isLoading } = useQuery({
    queryKey: ["species", filterKingdom, filterStatus],
    queryFn: () => fetchSpecies(filterKingdom || undefined, filterStatus || undefined),
  });

  const addMutation = useMutation({
    mutationFn: createSpecies,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["species"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); setOpen(false); toast.success("Species added"); },
    onError: (e) => toast.error(e.message),
  });

  const delMutation = useMutation({
    mutationFn: deleteSpecies,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["species"] }); toast.success("Species deleted"); },
  });

  const handleSubmit = () => {
    addMutation.mutate({
      ...form,
      population_estimate: form.population_estimate ? Number(form.population_estimate) : null,
      description: form.description || null,
    });
  };

  return (
    <AppLayout title="Species Registry" subtitle={`${species.length} species cataloged`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ Add Species</Button>}>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={filterKingdom} onValueChange={setFilterKingdom}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Kingdoms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Kingdoms</SelectItem>
            {KINGDOMS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Species Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-card h-40 animate-pulse bg-muted" />) : species.map((sp) => (
          <div key={sp.id} className="surface-card-hover p-5 group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-foreground">{sp.scientific_name}</div>
                <div className="text-xs text-muted-foreground">{sp.common_name}</div>
              </div>
              <span className={`status-badge status-${sp.conservation_status.toLowerCase()}`}>{sp.conservation_status}</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Kingdom: {sp.kingdom}</span>
              {sp.population_estimate && <span>Pop: ~{sp.population_estimate.toLocaleString()}</span>}
            </div>
            {sp.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{sp.description}</p>}
            <button onClick={() => delMutation.mutate(sp.id)} className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-destructive flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
          </div>
        ))}
        {!isLoading && species.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No species found. Add your first species record.</div>}
      </div>

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Species</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Scientific Name</Label>
              <Input value={form.scientific_name} onChange={e => setForm(f => ({ ...f, scientific_name: e.target.value }))} placeholder="e.g. Panthera onca" />
            </div>
            <div className="grid gap-2">
              <Label>Common Name</Label>
              <Input value={form.common_name} onChange={e => setForm(f => ({ ...f, common_name: e.target.value }))} placeholder="e.g. Jaguar" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kingdom</Label>
                <Select value={form.kingdom} onValueChange={v => setForm(f => ({ ...f, kingdom: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{KINGDOMS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Conservation Status</Label>
                <Select value={form.conservation_status} onValueChange={v => setForm(f => ({ ...f, conservation_status: v as Species["conservation_status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Population Estimate</Label>
              <Input type="number" value={form.population_estimate} onChange={e => setForm(f => ({ ...f, population_estimate: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.scientific_name || !form.common_name || addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : "Save Species"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
