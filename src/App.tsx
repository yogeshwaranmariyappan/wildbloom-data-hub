import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "./pages/DashboardPage";
import SpeciesPage from "./pages/SpeciesPage";
import HabitatsPage from "./pages/HabitatsPage";
import ObservationsPage from "./pages/ObservationsPage";
import SurveysPage from "./pages/SurveysPage";
import ThreatsPage from "./pages/ThreatsPage";
import ResearchersPage from "./pages/ResearchersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/species" element={<SpeciesPage />} />
          <Route path="/habitats" element={<HabitatsPage />} />
          <Route path="/observations" element={<ObservationsPage />} />
          <Route path="/surveys" element={<SurveysPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/researchers" element={<ResearchersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
