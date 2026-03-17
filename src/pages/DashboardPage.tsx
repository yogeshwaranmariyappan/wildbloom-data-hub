import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchSpeciesByKingdom, fetchSpeciesByStatus, fetchObservations } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Bug, Trees, Eye, ClipboardList, AlertTriangle, Users, ShieldAlert, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const STATUS_LABELS: Record<string, string> = {
  LC: "Least Concern", NT: "Near Threatened", VU: "Vulnerable", EN: "Endangered", CR: "Critical",
};
const STATUS_COLORS: Record<string, string> = {
  LC: "#22c55e", NT: "#f59e0b", VU: "#f97316", EN: "#ef4444", CR: "#b91c1c",
};
const PIE_COLORS = ["#0d6b4e", "#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const { data: kingdomData } = useQuery({ queryKey: ["species-kingdom"], queryFn: fetchSpeciesByKingdom });
  const { data: statusData } = useQuery({ queryKey: ["species-status"], queryFn: fetchSpeciesByStatus });
  const { data: observations } = useQuery({ queryKey: ["recent-observations"], queryFn: () => fetchObservations() });

  const statCards = [
    { label: "Total Species", value: stats?.totalSpecies ?? "–", icon: Bug, color: "text-primary" },
    { label: "Habitats", value: stats?.totalHabitats ?? "–", icon: Trees, color: "text-accent" },
    { label: "Observations", value: stats?.totalObservations ?? "–", icon: Eye, color: "text-blue-600" },
    { label: "Active Surveys", value: stats?.activeSurveys ?? "–", icon: Activity, color: "text-violet-600" },
    { label: "Threats", value: stats?.totalThreats ?? "–", icon: AlertTriangle, color: "text-warning" },
    { label: "Researchers", value: stats?.totalResearchers ?? "–", icon: Users, color: "text-muted-foreground" },
    { label: "Endangered", value: stats?.endangeredSpecies ?? "–", icon: ShieldAlert, color: "text-destructive" },
    { label: "Total Surveys", value: stats?.totalSurveys ?? "–", icon: ClipboardList, color: "text-primary" },
  ];

  const kingdomChartData = kingdomData ? Object.entries(kingdomData).map(([name, value]) => ({ name, value })) : [];
  const statusChartData = statusData ? Object.entries(statusData).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key, value, fill: STATUS_COLORS[key] || "#666",
  })) : [];

  const recentObs = observations?.slice(0, 8) ?? [];

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Biodiversity Monitoring Research System"
      actions={<Link to="/observations"><Button size="sm">+ New Observation</Button></Link>}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="surface-card p-4">
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <div>
                <div className="text-2xl font-semibold tracking-tight text-foreground">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="surface-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Species by Kingdom</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={kingdomChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                {kingdomChartData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Conservation Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Observations */}
      <div className="surface-card overflow-hidden">
        <div className="border-b border-border px-6 py-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Observations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Species</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Observer</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground tabular-nums">Date</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentObs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No observations yet</td></tr>
              ) : (
                recentObs.map((obs) => (
                  <tr key={obs.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-6 py-3">
                      <div className="font-medium text-foreground">{obs.species?.scientific_name ?? "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{obs.species?.common_name}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{obs.observer_name}</td>
                    <td className="px-6 py-3">
                      <span className={`status-badge ${obs.status === "verified" ? "status-lc" : obs.status === "rejected" ? "status-en" : "status-nt"}`}>
                        {obs.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground tabular-nums">{obs.observation_date}</td>
                    <td className="px-6 py-3 text-muted-foreground">{obs.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
