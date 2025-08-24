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
                    description="Get in touch with our team for any questions or support.

contact no:- +91 8698846796
email :- findmyevents.online@gmail.com"
                  />
                }
              />
              <Route
                path="/privacy"
                element={
                  <PlaceholderPage
                    title="Privacy Policy"
                    description={`
(

Introduction  
This Privacy Policy describes how Shubham Vasant Gundu and its affiliates (collectively referred to as “we”, “our”, or “us”) collect, use, share, protect, and otherwise process your personal data through our website https://myeventfind.vercel.app/ (the “Platform”).

- You may browse certain sections of the Platform without registering.  
- We do not offer any product/service outside India.  
- Your personal data will primarily be stored and processed in India.  

By visiting the Platform, providing your information, or availing any service, you agree to be bound by this Privacy Policy, the Terms of Use, and applicable service terms, and consent to the processing of your data under Indian laws. If you do not agree, please do not use or access the Platform.  

---

1. Collection of Information  
We collect personal data when you use our Platform, services, or interact with us. This may include:  
- Name, date of birth, address, mobile number, email ID.  
- Proof of identity/address.  
- Sensitive personal data (with consent): bank/payment details, biometric data (e.g., facial features).  
- Behavioural and preference data on the Platform.  
- Transaction details on our Platform and partner platforms.  

Note: If a third-party partner collects your data directly, their privacy policy applies. We are not responsible for their practices.  

⚠️ Do not share confidential details like debit/credit card PINs, banking passwords, etc. If such details are requested in our name, report immediately to law enforcement.  

---

2. Usage of Information  
Your personal data may be used to:  
- Provide and improve services.  
- Assist sellers and business partners in fulfilling orders.  
- Enhance customer experience.  
- Resolve disputes and troubleshoot issues.  
- Inform you about offers, services, and updates (opt-out available).  
- Prevent, detect, and investigate fraud or criminal activity.  
- Conduct research, analysis, and surveys.  
- Enforce Terms of Use and other policies.  

---

3. Sharing of Information  
We may share personal data with:  
- Our affiliates and group entities.  
- Sellers, business partners, service providers (e.g., logistics, payments).  
- Third parties like payment issuers, reward program operators, etc.  

We may disclose data to government or law enforcement if required to:  
- Comply with legal obligations.  
- Enforce our Terms of Use or Privacy Policy.  
- Prevent fraud, protect rights, property, or user safety.  

---

4. Security Precautions  
- We adopt reasonable security practices and use secure servers.  
- However, transmission of information over the Internet is never fully secure.  
- Users are responsible for protecting account login details.  

---

5. Data Deletion & Retention  
- You may delete your account via settings or by contacting us.  
- Deletion may be delayed if there are pending services or claims.  
- Data is retained only as long as necessary or required by law.  
- Certain anonymised data may be retained for analytics/research.  

---

6. Your Rights  
- You may access, update, or correct your personal data via the Platform.  
- Requests for deletion or correction can also be sent to us.  

---

7. Consent  
By using the Platform, you consent to:  
- Collection, storage, processing, and sharing of your data as per this Policy.  
- Being contacted by us or our partners through SMS, calls, email, or messaging apps.  

Withdrawal of Consent:  
- You may withdraw consent by writing to our Grievance Officer with the subject line “Withdrawal of Consent for Processing Personal Data”.  
- Withdrawal will not apply retrospectively and may affect your ability to use services.  

---

8. Changes to this Policy  
We may update this Privacy Policy from time to time. Significant changes will be notified as required by law. Please review periodically to stay informed.  
)
                    `}
                  />
                }
              />
              <Route
                path="/terms"
                element={
                  <PlaceholderPage
                    title="Terms of Service"
                    description={` (

Electronic Record  
This document is an electronic record in terms of the Information Technology Act, 2000, and the applicable rules thereunder, as amended. This electronic record is generated by a computer system and does not require any physical or digital signatures.  

This document is published in accordance with Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011, which requires publishing the rules and regulations, privacy policy, and Terms of Use for access or usage of the domain name https://myeventfind.vercel.app/ (the “Website”), including the related mobile site and mobile application (collectively referred to as the “Platform”).  

The Platform is owned by Shubham Vasant Gundu, a company incorporated under the Companies Act, 1956, with its registered office at Hyderabad, Warangal, India (hereinafter referred to as the “Platform Owner”, “we”, “us”, or “our”).  

---

1. Acceptance of Terms  
By accessing, browsing, or otherwise using the Platform, you agree to be bound by these Terms of Use, including all applicable policies which are incorporated herein by reference.  
If you transact on the Platform, you shall also be subject to the policies applicable to such transactions.  
If you do not agree with these Terms, you should not use the Platform or our Services.  

---

2. Eligibility and Registration  
- You agree to provide true, accurate, and complete information during and after registration.  
- You are solely responsible for all activities carried out through your registered account.  

---

3. Use of Services  
- The use of the Platform and Services is entirely at your own risk and discretion.  
- Neither we nor third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials offered on the Platform.  
- You are required to independently assess whether the Services meet your requirements.  

---

4. Intellectual Property  
- All contents of the Platform (including but not limited to design, layout, graphics, and text) are proprietary to the Platform Owner or licensed to us.  
- You are not permitted to claim any intellectual property rights, title, or interest in the contents.  

---

5. Restrictions  
You agree not to:  
- Use the Platform or Services for unlawful or illegal purposes.  
- Violate any applicable laws or regulations.  
- Engage in unauthorized use of the Platform which may result in legal action.  

---

6. Payments  
You agree to pay all charges associated with availing the Services.  

---

7. Third-Party Links  
The Platform may contain links to third-party websites. By accessing these links, you agree to be governed by the terms, privacy policies, and other applicable rules of those websites. These links are provided solely for your convenience.  

---

8. Legal Relationship  
By initiating a transaction on the Platform, you enter into a legally binding and enforceable contract with the Platform Owner for availing of the Services.  

---

9. Indemnity  
You agree to indemnify and hold harmless the Platform Owner, its affiliates, group companies, officers, directors, agents, and employees from any claims, demands, or actions (including legal costs) arising out of:  
- Your breach of these Terms of Use or Privacy Policy,  
- Your violation of any law, or  
- Infringement of third-party rights.  

---

10. Force Majeure  
The Platform Owner shall not be liable for failure or delay in performance due to causes beyond reasonable control, including but not limited to natural disasters, acts of government, or technical failures.  

---

11. Governing Law & Jurisdiction  
- These Terms shall be governed by and construed in accordance with the laws of India.  
- All disputes shall be subject to the exclusive jurisdiction of the courts in Warangal, Telangana, India.  

---

12. Communication  
All concerns, queries, or communications relating to these Terms must be addressed to us via the contact details provided on the Platform.  

---

Refund Policy  
Once a refund request is approved, the refunded amount will be processed and credited to the original mode of payment within 5–7 business days.  

---

PRIVACY POLICY

Introduction  
This Privacy Policy describes how Shubham Vasant Gundu and its affiliates (collectively referred to as “we”, “our”, or “us”) collect, use, share, protect, and otherwise process your personal data through our website https://myeventfind.vercel.app/ (the “Platform”).

- You may browse certain sections of the Platform without registering.  
- We do not offer any product/service outside India.  
- Your personal data will primarily be stored and processed in India.  

By visiting the Platform, providing your information, or availing any service, you agree to be bound by this Privacy Policy, the Terms of Use, and applicable service terms, and consent to the processing of your data under Indian laws. If you do not agree, please do not use or access the Platform.  

---

1. Collection of Information  
We collect personal data when you use our Platform, services, or interact with us. This may include:  
- Name, date of birth, address, mobile number, email ID.  
- Proof of identity/address.  
- Sensitive personal data (with consent): bank/payment details, biometric data (e.g., facial features).  
- Behavioural and preference data on the Platform.  
- Transaction details on our Platform and partner platforms.  

Note: If a third-party partner collects your data directly, their privacy policy applies. We are not responsible for their practices.  

⚠️ Do not share confidential details like debit/credit card PINs, banking passwords, etc. If such details are requested in our name, report immediately to law enforcement.  

---

2. Usage of Information  
Your personal data may be used to:  
- Provide and improve services.  
- Assist sellers and business partners in fulfilling orders.  
- Enhance customer experience.  
- Resolve disputes and troubleshoot issues.  
- Inform you about offers, services, and updates (opt-out available).  
- Prevent, detect, and investigate fraud or criminal activity.  
- Conduct research, analysis, and surveys.  
- Enforce Terms of Use and other policies.  

---

3. Sharing of Information  
We may share personal data with:  
- Our affiliates and group entities.  
- Sellers, business partners, service providers (e.g., logistics, payments).  
- Third parties like payment issuers, reward program operators, etc.  

We may disclose data to government or law enforcement if required to:  
- Comply with legal obligations.  
- Enforce our Terms of Use or Privacy Policy.  
- Prevent fraud, protect rights, property, or user safety.  

---

4. Security Precautions  
- We adopt reasonable security practices and use secure servers.  
- However, transmission of information over the Internet is never fully secure.  
- Users are responsible for protecting account login details.  

---

5. Data Deletion & Retention  
- You may delete your account via settings or by contacting us.  
- Deletion may be delayed if there are pending services or claims.  
- Data is retained only as long as necessary or required by law.  
- Certain anonymised data may be retained for analytics/research.  

---

6. Your Rights  
- You may access, update, or correct your personal data via the Platform.  
- Requests for deletion or correction can also be sent to us.  

---

7. Consent  
By using the Platform, you consent to:  
- Collection, storage, processing, and sharing of your data as per this Policy.  
- Being contacted by us or our partners through SMS, calls, email, or messaging apps.  

Withdrawal of Consent:  
- You may withdraw consent by writing to our Grievance Officer with the subject line “Withdrawal of Consent for Processing Personal Data”.  
- Withdrawal will not apply retrospectively and may affect your ability to use services.  

---

8. Changes to this Policy  
We may update this Privacy Policy from time to time. Significant changes will be notified as required by law. Please review periodically to stay informed.  
)
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
