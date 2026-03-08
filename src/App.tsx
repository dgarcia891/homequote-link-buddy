import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { PageTracker } from "@/components/PageTracker";
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
import MediaLibraryPage from "./pages/admin/MediaLibrary";
import BlogAnalyticsPage from "./pages/admin/BlogAnalytics";
import SystemStatusPage from "./pages/admin/SystemStatus";
import SiteAnalyticsPage from "./pages/admin/SiteAnalytics";
import HomeownersPage from "./pages/admin/Homeowners";
import ReviewsPage from "./pages/admin/Reviews";
import BuyerProfilesPage from "./pages/admin/BuyerProfiles";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogByTag from "./pages/BlogByTag";
import BlogByCategory from "./pages/BlogByCategory";
import CostGuides from "./pages/CostGuides";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import Account from "./pages/Account";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderDashboard from "./pages/ProviderDashboard";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import HVACPage from "./pages/services/HVAC";
import LandscapingPage from "./pages/services/Landscaping";
import ElectricalPage from "./pages/services/Electrical";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plumbing/santa-clarita" element={<PlumbingCityLanding />} />
          <Route path="/plumbers" element={<PlumbersLanding />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/services/hvac" element={<HVACPage />} />
          <Route path="/services/landscaping" element={<LandscapingPage />} />
          <Route path="/services/electrical" element={<ElectricalPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cost-guides" element={<CostGuides />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/tag/:tag" element={<BlogByTag />} />
          <Route path="/blog/category/:category" element={<BlogByCategory />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
          <Route path="/admin/buyers" element={<ProtectedRoute><BuyersPage /></ProtectedRoute>} />
          <Route path="/admin/routing" element={<ProtectedRoute><RoutingPage /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><BlogPostsPage /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><MediaLibraryPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><BlogAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/site-analytics" element={<ProtectedRoute><SiteAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/system" element={<ProtectedRoute><SystemStatusPage /></ProtectedRoute>} />
          <Route path="/admin/homeowners" element={<ProtectedRoute><HomeownersPage /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/admin/buyer-profiles" element={<ProtectedRoute><BuyerProfilesPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
