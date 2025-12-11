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

// Candidate Pages
import CandidateDashboard from "./pages/candidate/Dashboard";
import CandidateProfile from "./pages/candidate/Profile";
import CandidateJobs from "./pages/candidate/Jobs";
import CandidateApplications from "./pages/candidate/Applications";
import CandidateInterviews from "./pages/candidate/Interviews";
import CandidateOffers from "./pages/candidate/Offers";
import CandidateRelocation from "./pages/candidate/Relocation";
import CandidateMessages from "./pages/candidate/Messages";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminEmployers from "./pages/admin/Employers";
import AdminCandidates from "./pages/admin/Candidates";
import AdminJobs from "./pages/admin/Jobs";
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
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/jobs" element={<CandidateJobs />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/interviews" element={<CandidateInterviews />} />
            <Route path="/candidate/offers" element={<CandidateOffers />} />
            <Route path="/candidate/relocation" element={<CandidateRelocation />} />
            <Route path="/candidate/messages" element={<CandidateMessages />} />
          </Route>

          {/* Employer Portal Routes */}
          <Route element={<EmployerLayout />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/company" element={<div className="p-6"><h1 className="text-2xl font-bold">Company Profile</h1></div>} />
            <Route path="/employer/jobs" element={<div className="p-6"><h1 className="text-2xl font-bold">Job Postings</h1></div>} />
            <Route path="/employer/candidates" element={<div className="p-6"><h1 className="text-2xl font-bold">Candidates</h1></div>} />
            <Route path="/employer/pipeline" element={<div className="p-6"><h1 className="text-2xl font-bold">Pipeline</h1></div>} />
            <Route path="/employer/interviews" element={<div className="p-6"><h1 className="text-2xl font-bold">Interviews</h1></div>} />
            <Route path="/employer/offers" element={<div className="p-6"><h1 className="text-2xl font-bold">Offers</h1></div>} />
            <Route path="/employer/messages" element={<div className="p-6"><h1 className="text-2xl font-bold">Messages</h1></div>} />
            <Route path="/employer/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1></div>} />
          </Route>

          {/* Admin Portal Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/employers" element={<AdminEmployers />} />
            <Route path="/admin/candidates" element={<AdminCandidates />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
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
