import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster as ShadToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import BecomeOrganizer from "./pages/BecomeOrganizer";
import ManageEvent from "./pages/ManageEvent";
import AdminPanel from "./pages/AdminPanel";
import CoreAdminDashboard from "./pages/CoreAdminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AuthCallback from "./pages/AuthCallback";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerDashboard from "./pages/VolunteerDashboard";

import { AuthProvider } from "./lib/auth-context";
import { VolunteerAuthProvider } from "./hooks/use-volunteer-auth";
import VolunteerRouteGuard from "./components/VolunteerRouteGuard";
import AdminRouteGuard from "./components/AdminRouteGuard";
import OrganizerRouteGuard from "./components/OrganizerRouteGuard";

import { Shield, HelpCircle } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadToaster />
      <SonnerToaster />
      <AuthProvider>
        <BrowserRouter>
          <VolunteerAuthProvider>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/organizer/dashboard"
                element={
                  <OrganizerRouteGuard>
                    <OrganizerDashboard />
                  </OrganizerRouteGuard>
                }
              />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/create-event"
                element={
                  <OrganizerRouteGuard>
                    <CreateEvent />
                  </OrganizerRouteGuard>
                }
              />
              <Route path="/become-organizer" element={<BecomeOrganizer />} />
              <Route
                path="/manage-event/:eventId"
                element={
                  <OrganizerRouteGuard>
                    <ManageEvent />
                  </OrganizerRouteGuard>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRouteGuard>
                    <AdminPanel />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRouteGuard>
                    <CoreAdminDashboard />
                  </AdminRouteGuard>
                }
              />

              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Volunteer Pages */}
              <Route path="/volunteer/login" element={<VolunteerLogin />} />
              <Route
                path="/volunteer/scan/:eventId"
                element={
                  <VolunteerRouteGuard>
                    <VolunteerDashboard />
                  </VolunteerRouteGuard>
                }
              />

              {/* Event Types */}
              <Route
                path="/hackathons"
                element={
                  <PlaceholderPage
                    title="Hackathons"
                    description="Discover amazing hackathons happening across India's top colleges."
                  />
                }
              />
              <Route
                path="/workshops"
                element={
                  <PlaceholderPage
                    title="Workshops"
                    description="Learn new skills through hands-on workshops by industry experts."
                  />
                }
              />
              <Route
                path="/seminars"
                element={
                  <PlaceholderPage
                    title="Seminars"
                    description="Attend insightful seminars and talks by industry leaders."
                  />
                }
              />
              <Route
                path="/fests"
                element={
                  <PlaceholderPage
                    title="College Fests"
                    description="Experience the excitement of college technical festivals."
                  />
                }
              />

              {/* Other Pages */}
              <Route
                path="/verification"
                element={
                  <PlaceholderPage
                    title="Organizer Verification"
                    description="Get verified to host events and reach thousands of students."
                    icon={<Shield className="w-12 h-12 text-green-500 mx-auto" />}
                  />
                }
              />
              <Route
                path="/help"
                element={
                  <PlaceholderPage
                    title="Help Center"
                    description="Find answers to common questions and get support."
                    icon={<HelpCircle className="w-12 h-12 text-fme-blue mx-auto" />}
                  />
                }
              />
              <Route
                path="/contact"
                element={
                  <PlaceholderPage
                    title="Contact Us"
                    description="Get in touch with our team for any questions or support."
                  />
                }
              />
              <Route
                path="/privacy"
                element={
                  <PlaceholderPage
                    title="Privacy Policy"
                    description={`
Introduction
This Privacy Policy describes how SHUBHAM VASANT GUNDU and its affiliates...
(Keep your full text here safely inside backticks to avoid JSX breakage)
                    `}
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <PlaceholderPage
                    title="Terms of Service"
                    description={`
This document is an electronic record in terms of Information Technology Act...
(Keep full text inside backticks)
                    `}
                  />
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VolunteerAuthProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
