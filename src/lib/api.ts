import { supabase } from "@/integrations/supabase/client";

// Types
export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  kingdom: string;
  conservation_status: "LC" | "NT" | "VU" | "EN" | "CR";
  population_estimate: number | null;
  description: string | null;
  created_at: string;
}

export interface Habitat {
  id: string;
  name: string;
  habitat_type: string;
  location: string;
  area_hectares: number | null;
  threat_level: "low" | "moderate" | "high" | "critical";
  biodiversity_index: number | null;
  description: string | null;
  created_at: string;
}

export interface Observation {
  id: string;
  species_id: string | null;
  habitat_id: string | null;
  observer_name: string;
  observation_date: string;
  latitude: number | null;
  longitude: number | null;
  quantity: number;
  notes: string | null;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  species?: Species;
  habitat?: Habitat;
}

export interface Survey {
  id: string;
  title: string;
  habitat_id: string | null;
  lead_researcher: string;
  start_date: string;
  end_date: string | null;
  methodology: string | null;
  status: "planned" | "active" | "completed";
  species_count: number;
  created_at: string;
  habitat?: Habitat;
}

export interface Threat {
  id: string;
  name: string;
  category: string;
  severity: "low" | "moderate" | "high" | "critical";
  affected_area: string;
  description: string | null;
  mitigation_plan: string | null;
  reported_date: string;
  created_at: string;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  institution: string;
  field_experience_years: number;
  active_surveys: number;
  created_at: string;
}

// API functions
export async function fetchSpecies(kingdom?: string, status?: string) {
  let query = supabase.from("species").select("*").order("common_name");
  if (kingdom) query = query.eq("kingdom", kingdom);
  if (status) query = query.eq("conservation_status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as Species[];
}

export async function createSpecies(species: Omit<Species, "id" | "created_at">) {
  const { data, error } = await supabase.from("species").insert(species).select().single();
  if (error) throw error;
  return data as Species;
}

export async function deleteSpecies(id: string) {
  const { error } = await supabase.from("species").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchHabitats(type?: string, threat?: string) {
  let query = supabase.from("habitats").select("*").order("name");
  if (type) query = query.eq("habitat_type", type);
  if (threat) query = query.eq("threat_level", threat);
  const { data, error } = await query;
  if (error) throw error;
  return data as Habitat[];
}

export async function createHabitat(habitat: Omit<Habitat, "id" | "created_at">) {
  const { data, error } = await supabase.from("habitats").insert(habitat).select().single();
  if (error) throw error;
  return data as Habitat;
}

export async function deleteHabitat(id: string) {
  const { error } = await supabase.from("habitats").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchObservations(status?: string) {
  let query = supabase.from("observations").select("*, species(*), habitat:habitats(*)").order("observation_date", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as Observation[];
}

export async function createObservation(obs: Omit<Observation, "id" | "created_at" | "species" | "habitat">) {
  const { data, error } = await supabase.from("observations").insert(obs).select().single();
  if (error) throw error;
  return data as Observation;
}

export async function updateObservationStatus(id: string, status: "pending" | "verified" | "rejected") {
  const { error } = await supabase.from("observations").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchSurveys() {
  const { data, error } = await supabase.from("surveys").select("*, habitat:habitats(*)").order("start_date", { ascending: false });
  if (error) throw error;
  return data as Survey[];
}

export async function createSurvey(survey: Omit<Survey, "id" | "created_at" | "habitat">) {
  const { data, error } = await supabase.from("surveys").insert(survey).select().single();
  if (error) throw error;
  return data as Survey;
}

export async function fetchThreats() {
  const { data, error } = await supabase.from("threats").select("*").order("reported_date", { ascending: false });
  if (error) throw error;
  return data as Threat[];
}

export async function createThreat(threat: Omit<Threat, "id" | "created_at">) {
  const { data, error } = await supabase.from("threats").insert(threat).select().single();
  if (error) throw error;
  return data as Threat;
}

export async function fetchResearchers() {
  const { data, error } = await supabase.from("researchers").select("*").order("name");
  if (error) throw error;
  return data as Researcher[];
}

export async function createResearcher(researcher: Omit<Researcher, "id" | "created_at">) {
  const { data, error } = await supabase.from("researchers").insert(researcher).select().single();
  if (error) throw error;
  return data as Researcher;
}

export async function fetchDashboardStats() {
  const [species, habitats, observations, surveys, threats, researchers] = await Promise.all([
    supabase.from("species").select("*", { count: "exact", head: true }),
    supabase.from("habitats").select("*", { count: "exact", head: true }),
    supabase.from("observations").select("*", { count: "exact", head: true }),
    supabase.from("surveys").select("*", { count: "exact", head: true }),
    supabase.from("threats").select("*", { count: "exact", head: true }),
    supabase.from("researchers").select("*", { count: "exact", head: true }),
  ]);

  const endCount = await supabase.from("species").select("*", { count: "exact", head: true }).in("conservation_status", ["EN", "CR"]);
  const activeSurveys = await supabase.from("surveys").select("*", { count: "exact", head: true }).eq("status", "active");

  return {
    totalSpecies: species.count ?? 0,
    totalHabitats: habitats.count ?? 0,
    totalObservations: observations.count ?? 0,
    totalSurveys: surveys.count ?? 0,
    totalThreats: threats.count ?? 0,
    totalResearchers: researchers.count ?? 0,
    endangeredSpecies: endCount.count ?? 0,
    activeSurveys: activeSurveys.count ?? 0,
  };
}

export async function fetchSpeciesByKingdom() {
  const { data, error } = await supabase.from("species").select("kingdom");
  if (error) throw error;
  const counts: Record<string, number> = {};
  data?.forEach((s) => { counts[s.kingdom] = (counts[s.kingdom] || 0) + 1; });
  return counts;
}

export async function fetchSpeciesByStatus() {
  const { data, error } = await supabase.from("species").select("conservation_status");
  if (error) throw error;
  const counts: Record<string, number> = {};
  data?.forEach((s) => { counts[s.conservation_status] = (counts[s.conservation_status] || 0) + 1; });
  return counts;
}
