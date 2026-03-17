import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// Re-export types
export type Species = Tables<"species">;
export type Habitat = Tables<"habitats">;
export type Observation = Tables<"observations"> & { species?: Species | null; habitat?: Habitat | null };
export type Survey = Tables<"surveys"> & { habitat?: Habitat | null };
export type Threat = Tables<"threats">;
export type Researcher = Tables<"researchers">;

// Species
export async function fetchSpecies(kingdom?: string, status?: string) {
  let query = supabase.from("species").select("*").order("common_name");
  if (kingdom) query = query.eq("kingdom", kingdom);
  if (status) query = query.eq("conservation_status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSpecies(species: TablesInsert<"species">) {
  const { data, error } = await supabase.from("species").insert(species).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSpecies(id: string) {
  const { error } = await supabase.from("species").delete().eq("id", id);
  if (error) throw error;
}

// Habitats
export async function fetchHabitats(type?: string, threat?: string) {
  let query = supabase.from("habitats").select("*").order("name");
  if (type) query = query.eq("habitat_type", type);
  if (threat) query = query.eq("threat_level", threat);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createHabitat(habitat: TablesInsert<"habitats">) {
  const { data, error } = await supabase.from("habitats").insert(habitat).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHabitat(id: string) {
  const { error } = await supabase.from("habitats").delete().eq("id", id);
  if (error) throw error;
}

// Observations
export async function fetchObservations(status?: string) {
  let query = supabase.from("observations").select("*, species(*), habitat:habitats(*)").order("observation_date", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as Observation[];
}

export async function createObservation(obs: TablesInsert<"observations">) {
  const { data, error } = await supabase.from("observations").insert(obs).select().single();
  if (error) throw error;
  return data;
}

export async function updateObservationStatus(id: string, status: string) {
  const { error } = await supabase.from("observations").update({ status }).eq("id", id);
  if (error) throw error;
}

// Surveys
export async function fetchSurveys() {
  const { data, error } = await supabase.from("surveys").select("*, habitat:habitats(*)").order("start_date", { ascending: false });
  if (error) throw error;
  return data as unknown as Survey[];
}

export async function createSurvey(survey: TablesInsert<"surveys">) {
  const { data, error } = await supabase.from("surveys").insert(survey).select().single();
  if (error) throw error;
  return data;
}

// Threats
export async function fetchThreats() {
  const { data, error } = await supabase.from("threats").select("*").order("reported_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createThreat(threat: TablesInsert<"threats">) {
  const { data, error } = await supabase.from("threats").insert(threat).select().single();
  if (error) throw error;
  return data;
}

// Researchers
export async function fetchResearchers() {
  const { data, error } = await supabase.from("researchers").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createResearcher(researcher: TablesInsert<"researchers">) {
  const { data, error } = await supabase.from("researchers").insert(researcher).select().single();
  if (error) throw error;
  return data;
}

// Dashboard
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
