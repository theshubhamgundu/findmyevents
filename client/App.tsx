import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { User, Shield, Bell, HelpCircle } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
              <Route
                path="/CoreAdminDashboard"
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
                    icon={
                      <Shield className="w-12 h-12 text-green-500 mx-auto" />
                    }
                  />
                }
              />
              <Route
                path="/help"
                element={
                  <PlaceholderPage
                    title="Help Center"
                    description="Find answers to common questions and get support."
                    icon={
                      <HelpCircle className="w-12 h-12 text-fme-blue mx-auto" />
                    }
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
                    description="Learn how we protect your data and respect your privacy."
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <PlaceholderPage
                    title="Terms of Service"
                    description="This document is an electronic record in terms of Information Technology Act, 2000 and rules there under as applicable and the amended provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000. This electronic record is generated by a computer system and does not require any physical or digital signatures.
This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011 that require publishing the rules and regulations, privacy policy and Terms of Use for access or usage of domain name https://myeventfind.vercel.app/ ('Website'), including the related mobile site and mobile application (hereinafter referred to as 'Platform').
The Platform is owned by SHUBHAM VASANT GUNDU, a company incorporated under the Companies Act, 1956 with its registered office at HYDERABAD,HYDERABAD ,Warangal ,India (hereinafter referred to as ‘Platform Owner’, 'we', 'us', 'our')..
Your use of the Platform and services and tools are governed by the following terms and conditions (“Terms of Use”) as applicable to the Platform including the applicable policies which are incorporated herein by way of reference. If You transact on the Platform, You shall be subject to the policies that are applicable to the Platform for such transaction. By mere use of the Platform, You shall be contracting with the Platform Owner and these terms and conditions including the policies constitute Your binding obligations, with Platform Owner. These Terms of Use relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, 'Services'). Any terms and conditions proposed by You which are in addition to or which conflict with these Terms of Use are expressly rejected by the Platform Owner and shall be of no force or effect. These Terms of Use can be modified at any time without assigning any reason. It is your responsibility to periodically review these Terms of Use to stay informed of updates..
For the purpose of these Terms of Use, wherever the context so requires ‘you’, 'your' or ‘user’ shall mean any natural or legal person who has agreed to become a user/buyer on the Platform..
ACCESSING, BROWSING OR OTHERWISE USING THE PLATFORM INDICATES YOUR AGREEMENT TO ALL THE TERMS AND CONDITIONS UNDER THESE TERMS OF USE, SO PLEASE READ THE TERMS OF USE CAREFULLY BEFORE PROCEEDING..
The use of Platform and/or availing of our Services is subject to the following Terms of Use:
To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account on the Platform..
Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law..
Your use of our Services and the Platform is solely and entirely at your own risk and discretion for which we shall not be liable to you in any manner. You are required to independently assess and ensure that the Services meet your requirements..
The contents of the Platform and the Services are proprietary to us and are licensed to us. You will not have any authority to claim any intellectual property rights, title, or interest in its contents. The contents includes and is not limited to the design, layout, look and graphics..
You acknowledge that unauthorized use of the Platform and/or the Services may lead to action against you as per these Terms of Use and/or applicable laws..
You agree to pay us the charges associated with availing the Services..
You agree not to use the Platform and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.
You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites. These links are provided for your convenience for provide further information..
You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the Platform Owner for the Services..
You shall indemnify and hold harmless Platform Owner, its affiliates, group companies (as applicable) and their respective officers, directors, agents, and employees, from any claim or demand, or actions including reasonable attorney's fees, made by any third party or penalty imposed due to or arising out of Your breach of this Terms of Use, privacy Policy and other Policies, or Your violation of any law, rules or regulations or the rights (including infringement of intellectual property rights) of a third party.
Notwithstanding anything contained in these Terms of Use, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event..
These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India..
All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Warangal and Telangana.
All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website

Refund Policy - Once the refund request is approved , the refunded amount would be processed and credited to the original mode of payment within 5-7 business days ."
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

createRoot(document.getElementById("root")!).render(<App />);
