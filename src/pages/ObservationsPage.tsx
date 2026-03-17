import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchObservations, createObservation, updateObservationStatus, fetchSpecies, fetchHabitats, type Observation } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function ObservationsPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ species_id: "", habitat_id: "", observer_name: "", observation_date: new Date().toISOString().split("T")[0], latitude: "", longitude: "", quantity: "1", notes: "", status: "pending" as Observation["status"] });

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ["observations", filterStatus],
    queryFn: () => fetchObservations(filterStatus || undefined),
  });

  const { data: speciesList = [] } = useQuery({ queryKey: ["species-all"], queryFn: () => fetchSpecies() });
  const { data: habitatsList = [] } = useQuery({ queryKey: ["habitats-all"], queryFn: () => fetchHabitats() });

  const addMutation = useMutation({
    mutationFn: createObservation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["observations"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); setOpen(false); toast.success("Observation logged"); },
    onError: (e) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "verified" | "rejected" }) => updateObservationStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["observations"] }); toast.success("Status updated"); },
  });

  const handleSubmit = () => {
    addMutation.mutate({
      ...form,
      species_id: form.species_id || null,
      habitat_id: form.habitat_id || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      quantity: Number(form.quantity) || 1,
      notes: form.notes || null,
    });
  };

  return (
    <AppLayout title="Observations" subtitle={`${observations.length} observations logged`} actions={<Button size="sm" onClick={() => setOpen(true)}>+ Log Observation</Button>}>
      <div className="mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Species</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Observer</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Habitat</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Qty</th>
                <th className="px-6 py-3 font-medium text-muted-foreground tabular-nums">Date</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : observations.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No observations found</td></tr>
              ) : observations.map((obs) => (
                <tr key={obs.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-6 py-3">
                    <div className="font-medium text-foreground">{obs.species?.scientific_name ?? "–"}</div>
                    <div className="text-xs text-muted-foreground">{obs.species?.common_name}</div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{obs.observer_name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{obs.habitat?.name ?? "–"}</td>
                  <td className="px-6 py-3 text-muted-foreground">{obs.quantity}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground tabular-nums">{obs.observation_date}</td>
                  <td className="px-6 py-3">
                    <span className={`status-badge ${obs.status === "verified" ? "status-lc" : obs.status === "rejected" ? "status-en" : "status-nt"}`}>{obs.status}</span>
                  </td>
                  <td className="px-6 py-3">
                    {obs.status === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => statusMutation.mutate({ id: obs.id, status: "verified" })} className="rounded p-1 text-accent hover:bg-accent/10"><Check className="h-4 w-4" /></button>
                        <button onClick={() => statusMutation.mutate({ id: obs.id, status: "rejected" })} className="rounded p-1 text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Observation</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Species</Label>
              <Select value={form.species_id} onValueChange={v => setForm(f => ({ ...f, species_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                <SelectContent>{speciesList.map(s => <SelectItem key={s.id} value={s.id}>{s.scientific_name} ({s.common_name})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Habitat</Label>
              <Select value={form.habitat_id} onValueChange={v => setForm(f => ({ ...f, habitat_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select habitat" /></SelectTrigger>
                <SelectContent>{habitatsList.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Observer Name</Label><Input value={form.observer_name} onChange={e => setForm(f => ({ ...f, observer_name: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.observation_date} onChange={e => setForm(f => ({ ...f, observation_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.observer_name || addMutation.isPending}>{addMutation.isPending ? "Saving..." : "Log Observation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
