import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Rankings from "./pages/Rankings";
import UniversityProfile from "./pages/UniversityProfile";
import Methodology from "./pages/Methodology";
import FindMyMatch from "./pages/FindMyMatch";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Notices from "./pages/Notices";
import NotFound from "./pages/NotFound";
import AIChatWidget from "./components/AIChatWidget";
import GlobalAlertBanner from "./components/GlobalAlertBanner";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <GlobalAlertBanner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/university/:id" element={<UniversityProfile />} />
              <Route path="/find-my-match" element={<FindMyMatch />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatWidget />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
