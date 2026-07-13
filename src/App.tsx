import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MaintenanceGate from "@/components/MaintenanceGate";

// Layouts
import { PublicLayout } from "./components/layouts/PublicLayout";
import CandidateLayout from "./components/layouts/CandidateLayout";
import EmployerLayout from "./components/layouts/EmployerLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Platform from "./pages/Platform";
import About from "./pages/About";
import Insight from "./pages/Insight";
import JobDetail from "./pages/JobDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Candidate Pages
import CandidateDashboard from "./pages/candidate/Dashboard";
import CandidateProfile from "./pages/candidate/Profile";
import CandidateRegistrationDetails from "./pages/candidate/RegistrationDetails";
import CandidateUniversity from "./pages/candidate/University";
import CandidatePreparation from "./pages/candidate/Preparation";
import CandidateSelection from "./pages/candidate/Selection";
import CandidateReadiness from "./pages/candidate/Readiness";
import CandidateReadinessIntro from "./pages/candidate/ReadinessIntro";
import CandidateReadinessTest from "./pages/candidate/ReadinessTest";
import CandidateStageTaskDetail from "./pages/candidate/StageTaskDetail";
import CandidateInternship from "./pages/candidate/Internship";
import CandidateActivation from "./pages/candidate/Activation";
import CandidateRelocation from "./pages/candidate/Relocation";
import CandidateOnboarding from "./pages/candidate/Onboarding";
import CandidateFollowup from "./pages/candidate/Followup";
import CandidateMessages from "./pages/candidate/Messages";
import CandidateMentoring from "./pages/candidate/Mentoring";
import CandidateSupport from "./pages/candidate/Support";
import CandidateJobs from "./pages/candidate/Jobs";
import CandidateJobDetail from "./pages/candidate/JobDetail";
import CandidateJobApplication from "./pages/candidate/JobApplication";
import CandidateApplications from "./pages/candidate/Applications";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerTasks from "./pages/employer/Tasks";
import EmployerCompanyProfile from "./pages/employer/CompanyProfile";
import EmployerJobPostings from "./pages/employer/JobPostings";
import EmployerJobDetail from "./pages/employer/JobDetail";
import EmployerCandidates from "./pages/employer/Candidates";
import EmployerCandidateDetail from "./pages/employer/CandidateDetail";
import EmployerMessages from "./pages/employer/Messages";
import EmployerAnalytics from "./pages/employer/Analytics";
import EmployerMentoring from "./pages/employer/Mentoring";
import EmployerMentoringApplication from "./pages/employer/MentoringApplication";
import EmployerSelectionApplication from "./pages/employer/SelectionApplication";
import EmployerSelection from "./pages/employer/Selection";
import EmployerInternship from "./pages/employer/Internship";
import EmployerActivation from "./pages/employer/Activation";
import EmployerActivationApplication from "./pages/employer/ActivationApplication";
import EmployerRelocation from "./pages/employer/Relocation";
import EmployerRelocationApplication from "./pages/employer/RelocationApplication";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEmployers from "./pages/admin/Employers";
import AdminCandidates from "./pages/admin/Candidates";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import AdminIssues from "./pages/admin/Issues";
import AdminSupport from "./pages/admin/Support";
import AdminNotifications from "./pages/admin/Notifications";
import AdminActivity from "./pages/admin/Activity";
import AdminCandidateDetail from "./pages/admin/CandidateDetail";
import AdminEmployerDetail from "./pages/admin/EmployerDetail";
import AdminUsers from "./pages/admin/Users";
import AdminJobs from "./pages/admin/Jobs";
import AdminSecurity from "./pages/admin/Security";
import AdminMessages from "./pages/admin/Messages";
import AdminContacts from "./pages/admin/Contacts";
import AdminInsights from "./pages/admin/Insights";
import AdminStageTasks from "./pages/admin/StageTasks";
import AdminReadiness from "./pages/admin/Readiness";
import AdminMentoring from "./pages/admin/Mentoring";
import AdminMentoringApplication from "./pages/admin/MentoringApplication";
import AdminUniversities from "./pages/admin/Universities";
import AdminRelocation from "./pages/admin/Relocation";
import AdminRelocationApplication from "./pages/admin/RelocationApplication";
import AdminOnboarding from "./pages/admin/Onboarding";
import AdminSelection from "./pages/admin/Selection";
import AdminSelectionApplication from "./pages/admin/SelectionApplication";
import AdminActivation from "./pages/admin/Activation";
import AdminActivationApplication from "./pages/admin/ActivationApplication";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MaintenanceGate>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/about" element={<About />} />
              <Route path="/insight" element={<Insight />} />
              <Route path="/insight/:id" element={<JobDetail />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login fixedRole="internal" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Candidate Portal */}
            <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
              <Route element={<CandidateLayout />}>
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/preparation" element={<CandidatePreparation />} />
                <Route path="/candidate/selection" element={<CandidateSelection />} />
                <Route path="/candidate/readiness/intro" element={<CandidateReadinessIntro />} />
                <Route path="/candidate/readiness" element={<CandidateReadiness />} />
                <Route path="/candidate/readiness/test/:testId" element={<CandidateReadinessTest />} />
                <Route path="/candidate/:stagePath/tasks/:taskId" element={<CandidateStageTaskDetail />} />
                <Route path="/candidate/internship" element={<CandidateInternship />} />
                <Route path="/candidate/activation" element={<CandidateActivation />} />
                <Route path="/candidate/relocation" element={<CandidateRelocation />} />
                <Route path="/candidate/onboarding" element={<CandidateOnboarding />} />
                <Route path="/candidate/followup" element={<CandidateFollowup />} />
                <Route path="/candidate/profile" element={<CandidateProfile />} />
                <Route path="/candidate/registration-details" element={<CandidateRegistrationDetails />} />
                <Route path="/candidate/university" element={<CandidateUniversity />} />
                <Route path="/candidate/jobs" element={<CandidateJobs />} />
                <Route path="/candidate/jobs/:id/apply" element={<CandidateJobApplication />} />
                <Route path="/candidate/jobs/:id" element={<CandidateJobDetail />} />
                <Route path="/candidate/applications" element={<CandidateApplications />} />
                <Route path="/candidate/messages" element={<CandidateMessages />} />
                <Route path="/candidate/mentoring" element={<CandidateMentoring />} />
                <Route path="/candidate/support" element={<CandidateSupport />} />
              </Route>
            </Route>

            {/* Employer Portal */}
            <Route element={<ProtectedRoute allowedRoles={["employer"]} />}>
              <Route element={<EmployerLayout />}>
                <Route path="/employer" element={<Navigate to="/employer/dashboard" replace />} />
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/tasks" element={<EmployerTasks />} />
                <Route path="/employer/candidates" element={<EmployerCandidates />} />
                <Route path="/employer/selection" element={<EmployerSelection />} />
                <Route path="/employer/selection/:applicationId" element={<EmployerSelectionApplication />} />
                <Route path="/employer/candidates/:candidateId/selection/:applicationId" element={<EmployerSelectionApplication />} />
                <Route path="/employer/candidates/:candidateId" element={<EmployerCandidateDetail />} />
                <Route path="/employer/jobs" element={<EmployerJobPostings />} />
                <Route path="/employer/jobs/:id" element={<EmployerJobDetail />} />
                <Route path="/employer/company" element={<EmployerCompanyProfile />} />
                <Route path="/employer/internship" element={<EmployerInternship />} />
                <Route path="/employer/activation" element={<EmployerActivation />} />
                <Route path="/employer/activation/:applicationId" element={<EmployerActivationApplication />} />
                <Route path="/employer/relocation" element={<EmployerRelocation />} />
                <Route path="/employer/relocation/:applicationId" element={<EmployerRelocationApplication />} />
                <Route path="/employer/mentoring" element={<EmployerMentoring />} />
                <Route path="/employer/mentoring/:applicationId" element={<EmployerMentoringApplication />} />
                <Route path="/employer/messages" element={<EmployerMessages />} />
                <Route path="/employer/analytics" element={<EmployerAnalytics />} />
              </Route>
            </Route>

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/employers" element={<AdminEmployers />} />
                <Route path="/admin/employers/:id" element={<AdminEmployerDetail />} />
                <Route path="/admin/candidates" element={<AdminCandidates />} />
                <Route path="/admin/candidates/:id" element={<AdminCandidateDetail />} />
                <Route path="/admin/issues" element={<AdminIssues />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/activity" element={<AdminActivity />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/contacts" element={<AdminContacts />} />
                <Route path="/admin/insights" element={<AdminInsights />} />
                <Route path="/admin/stage-tasks" element={<AdminStageTasks />} />
                <Route path="/admin/readiness" element={<AdminReadiness />} />
                <Route path="/admin/mentoring" element={<AdminMentoring />} />
                <Route path="/admin/mentoring/:applicationId" element={<AdminMentoringApplication />} />
                <Route path="/admin/activation" element={<AdminActivation />} />
                <Route path="/admin/activation/:applicationId" element={<AdminActivationApplication />} />
                <Route path="/admin/universities" element={<AdminUniversities />} />
                <Route path="/admin/relocation" element={<AdminRelocation />} />
                <Route path="/admin/relocation/:applicationId" element={<AdminRelocationApplication />} />
                <Route path="/admin/onboarding" element={<AdminOnboarding />} />
                <Route path="/admin/selection/:applicationId" element={<AdminSelectionApplication />} />
                <Route path="/admin/selection" element={<AdminSelection />} />
                <Route path="/admin/security" element={<AdminSecurity />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </MaintenanceGate>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
