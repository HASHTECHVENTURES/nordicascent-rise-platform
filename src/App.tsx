import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "./components/layouts/PublicLayout";
import CandidateLayout from "./components/layouts/CandidateLayout";
import EmployerLayout from "./components/layouts/EmployerLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Careers from "./pages/Careers";
import JobDetail from "./pages/JobDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

// Admin Pages
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSecurity from "./pages/admin/Security";
import AdminSettings from "./pages/admin/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<JobDetail />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Candidate Portal Routes */}
          <Route element={<CandidateLayout />}>
            <Route path="/candidate/dashboard" element={<div className="text-2xl font-bold">Candidate Dashboard - Coming Soon</div>} />
            <Route path="/candidate/profile" element={<div className="text-2xl font-bold">Profile - Coming Soon</div>} />
            <Route path="/candidate/jobs" element={<div className="text-2xl font-bold">Jobs - Coming Soon</div>} />
            <Route path="/candidate/applications" element={<div className="text-2xl font-bold">Applications - Coming Soon</div>} />
            <Route path="/candidate/interviews" element={<div className="text-2xl font-bold">Interviews - Coming Soon</div>} />
            <Route path="/candidate/offers" element={<div className="text-2xl font-bold">Offers - Coming Soon</div>} />
            <Route path="/candidate/relocation" element={<div className="text-2xl font-bold">Relocation - Coming Soon</div>} />
            <Route path="/candidate/messages" element={<div className="text-2xl font-bold">Messages - Coming Soon</div>} />
          </Route>

          {/* Employer Portal Routes */}
          <Route element={<EmployerLayout />}>
            <Route path="/employer/dashboard" element={<div className="text-2xl font-bold">Employer Dashboard - Coming Soon</div>} />
            <Route path="/employer/company" element={<div className="text-2xl font-bold">Company Profile - Coming Soon</div>} />
            <Route path="/employer/jobs" element={<div className="text-2xl font-bold">Job Postings - Coming Soon</div>} />
            <Route path="/employer/candidates" element={<div className="text-2xl font-bold">Candidates - Coming Soon</div>} />
            <Route path="/employer/pipeline" element={<div className="text-2xl font-bold">Pipeline - Coming Soon</div>} />
            <Route path="/employer/interviews" element={<div className="text-2xl font-bold">Interviews - Coming Soon</div>} />
            <Route path="/employer/offers" element={<div className="text-2xl font-bold">Offers - Coming Soon</div>} />
            <Route path="/employer/messages" element={<div className="text-2xl font-bold">Messages - Coming Soon</div>} />
            <Route path="/employer/analytics" element={<div className="text-2xl font-bold">Analytics - Coming Soon</div>} />
          </Route>

          {/* Admin Portal Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<div className="text-2xl font-bold">Admin Dashboard - Coming Soon</div>} />
            <Route path="/admin/users" element={<div className="text-2xl font-bold">Users - Coming Soon</div>} />
            <Route path="/admin/employers" element={<div className="text-2xl font-bold">Employers - Coming Soon</div>} />
            <Route path="/admin/candidates" element={<div className="text-2xl font-bold">Candidates - Coming Soon</div>} />
            <Route path="/admin/jobs" element={<div className="text-2xl font-bold">Jobs - Coming Soon</div>} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
