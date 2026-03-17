import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHabitats, createHabitat, deleteHabitat, type Habitat } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const TYPES = ["forest", "wetland", "grassland", "marine", "freshwater", "desert"];
const THREATS = ["low", "moderate", "high", "critical"];

export default function HabitatsPage() {
  const qc = useQueryClient();
  const [filterType, setFilterType] = useState("");
  const [filterThreat, setFilterThreat] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", habitat_type: "forest", location: "", area_hectares: "", threat_level: "low" as Habitat["threat_level"], biodiversity_index: "", description: "" });

  const { data: habitats = [], isLoading } = useQuery({
    queryKey: ["habitats", filterType, filterThreat],
    queryFn: () => fetchHabitats(filterType && filterType !== "all" ? filterType : undefined, filterThreat && filterThreat !== "all" ? filterThreat : undefined),
  });

  const addMutation = useMutation({
    mutationFn: createHabitat,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["habitats"] }); setOpen(false); toast.success("Habitat added"); },
    onError: (e) => toast.error(e.message),
  });

  const delMutation = useMutation({
    mutationFn: deleteHabitat,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["habitats"] }); toast.success("Habitat deleted"); },
  });

  const handleSubmit = () => {
    addMutation.mutate({
      ...form,
      area_hectares: form.area_hectares ? Number(form.area_hectares) : null,
      biodiversity_index: form.biodiversity_index ? Number(form.biodiversity_index) : null,
      description: form.description || null,
    });
  };

  return (
    <AppLayout title="Habitats" subtitle={`${habitats.length} habitats monitored`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ Add Habitat</Button>}>
      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterThreat} onValueChange={setFilterThreat}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Threat Levels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Threat Levels</SelectItem>
            {THREATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="surface-card h-40 animate-pulse bg-muted" />) : habitats.map((h) => (
          <div key={h.id} className="surface-card-hover p-5 group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-foreground">{h.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{h.habitat_type} • {h.location}</div>
              </div>
              <span className={`status-badge threat-${h.threat_level}`}>{h.threat_level}</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              {h.area_hectares && <span>{h.area_hectares.toLocaleString()} ha</span>}
              {h.biodiversity_index && <span>BDI: {h.biodiversity_index}</span>}
            </div>
            {h.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{h.description}</p>}
            <button onClick={() => delMutation.mutate(h.id)} className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-destructive flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</button>
          </div>
        ))}
        {!isLoading && habitats.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No habitats found.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Habitat</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Amazon Basin Sector 4" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Type</Label><Select value={form.habitat_type} onValueChange={v => setForm(f => ({ ...f, habitat_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Threat Level</Label><Select value={form.threat_level} onValueChange={v => setForm(f => ({ ...f, threat_level: v as Habitat["threat_level"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{THREATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. South America" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Area (hectares)</Label><Input type="number" value={form.area_hectares} onChange={e => setForm(f => ({ ...f, area_hectares: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Biodiversity Index</Label><Input type="number" step="0.01" value={form.biodiversity_index} onChange={e => setForm(f => ({ ...f, biodiversity_index: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.name || !form.location || addMutation.isPending}>{addMutation.isPending ? "Saving..." : "Save Habitat"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
