import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Historical from "./pages/Historical";
import Inputs from "./pages/Inputs";
import AUM from "./pages/AUM";
import Forecast from "./pages/Forecast";
import Analysis from "./pages/Analysis";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/users" element={<MainLayout><UsersPage /></MainLayout>} />
          <Route path="/historical" element={<MainLayout><Historical /></MainLayout>} />
          <Route path="/inputs" element={<MainLayout><Inputs /></MainLayout>} />
          <Route path="/aum" element={<MainLayout><AUM /></MainLayout>} />
          <Route path="/forecast" element={<MainLayout><Forecast /></MainLayout>} />
          <Route path="/analysis" element={<MainLayout><Analysis /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
