import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import PlumbingCityLanding from "./pages/PlumbingCityLanding";
import PlumbersLanding from "./pages/PlumbersLanding";
import ThankYou from "./pages/ThankYou";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import LeadDetail from "./pages/admin/LeadDetail";
import BuyersPage from "./pages/admin/Buyers";
import RoutingPage from "./pages/admin/Routing";
import SettingsPage from "./pages/admin/Settings";
import ResetPassword from "./pages/admin/ResetPassword";
import BlogPostsPage from "./pages/admin/BlogPosts";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CostGuides from "./pages/CostGuides";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plumbing/santa-clarita" element={<PlumbingCityLanding />} />
          <Route path="/plumbers" element={<PlumbersLanding />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cost-guides" element={<CostGuides />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
          <Route path="/admin/buyers" element={<ProtectedRoute><BuyersPage /></ProtectedRoute>} />
          <Route path="/admin/routing" element={<ProtectedRoute><RoutingPage /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><BlogPostsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
