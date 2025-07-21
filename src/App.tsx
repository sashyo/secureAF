import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TideCloakContextProvider } from "@tidecloak/react";
import Index from "./pages/Index";
import RedirectPage from "./pages/RedirectPage";
import NotFound from "./pages/NotFound";
import adapter from "./tidecloakAdapter.json";

const queryClient = new QueryClient();

const App = () => (
  <TideCloakContextProvider config={{...adapter, redirectUri: "https://sashyo.github.io/secureAF/auth/redirect"}}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/redirect" element={<RedirectPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </TideCloakContextProvider>
);

export default App;
