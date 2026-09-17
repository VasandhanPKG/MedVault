import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { supabase } from "./lib/supabase";
import { setAuthToken, setStoredUser, isProfileComplete, getStoredUser } from "./lib/api-client";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TimelinePage } from "./pages/TimelinePage";
import { RecordsPage } from "./pages/RecordsPage";
import { VaccinationsPage } from "./pages/VaccinationsPage";
import { UploadPage } from "./pages/UploadPage";
import { AssistantPage } from "./pages/AssistantPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { RiskPage } from "./pages/RiskPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { EmergencyResponderPage } from "./pages/EmergencyResponderPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { IntakePage } from "./pages/IntakePage";
import { NotFoundPage } from "./pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthSessionListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Direct URL Hash Token Extraction (handles Supabase Google OAuth redirect fragment)
    if (window.location.hash && window.location.hash.includes("access_token=")) {
      try {
        const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken) {
          setAuthToken(accessToken);

          let user: any = null;
          // Decode JWT payload to extract user info immediately
          try {
            const base64Url = accessToken.split(".")[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);
              user = {
                id: payload.sub || payload.id,
                email: payload.email,
                name:
                  payload.user_metadata?.full_name ||
                  payload.user_metadata?.name ||
                  payload.email?.split("@")[0] ||
                  "Google Patient",
                dob: payload.user_metadata?.dob || "",
                gender: payload.user_metadata?.gender || "Unspecified",
                bloodGroup: payload.user_metadata?.blood_group || "O+",
                phone: payload.user_metadata?.phone || "",
                isProfileComplete: false
              };
              setStoredUser(user);
            }
          } catch (e) {
            console.warn("JWT payload decoding fallback:", e);
          }

          // Sync session to Supabase client if configured
          if (supabase && refreshToken) {
            supabase.auth
              .setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              .catch((err) => console.warn("Supabase setSession notice:", err));
          }

          // Clean URL hash so access tokens are not exposed in browser address bar
          window.history.replaceState(null, "", window.location.pathname || "/dashboard");
          if (isProfileComplete(user)) {
            navigate("/dashboard");
          } else {
            navigate("/profile", { state: { requiredSetup: true } });
          }
          return;
        }
      } catch (err) {
        console.error("Error processing OAuth hash tokens:", err);
      }
    }

    if (!supabase) return;

    // 2. Check existing active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthToken(session.access_token);
        const currentUser = getStoredUser();
        const user = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Patient",
          ...currentUser
        };
        setStoredUser(user);
      }
    });

    // 3. Listen for OAuth callbacks and sign-in state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setAuthToken(session.access_token);
        const currentUser = getStoredUser();
        const user = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Patient",
          ...currentUser
        };
        setStoredUser(user);
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/"
        ) {
          if (isProfileComplete(user)) {
            navigate("/dashboard");
          } else {
            navigate("/profile", { state: { requiredSetup: true } });
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="medvault_theme">
        <TooltipProvider>
          <BrowserRouter>
            <AuthSessionListener />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/e/:token" element={<EmergencyResponderPage />} />
              <Route path="/emergency/verify" element={<EmergencyResponderPage />} />
              <Route path="/emergency/verify/:token" element={<EmergencyResponderPage />} />

              {/* Profile Route - accessible to complete onboarding */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowIncompleteProfile={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected App Routes - locked until profile is complete */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <TimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/records"
                element={
                  <ProtectedRoute>
                    <RecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccinations"
                element={
                  <ProtectedRoute>
                    <VaccinationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute>
                    <AssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intake"
                element={
                  <ProtectedRoute>
                    <IntakePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intake/:sessionId"
                element={
                  <ProtectedRoute>
                    <IntakePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/risk"
                element={
                  <ProtectedRoute>
                    <RiskPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emergency"
                element={
                  <ProtectedRoute>
                    <EmergencyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
