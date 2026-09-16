import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "./lib/supabase";
import { setAuthToken, setStoredUser } from "./lib/api-client";

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
              const user = {
                id: payload.sub || payload.id,
                email: payload.email,
                name:
                  payload.user_metadata?.full_name ||
                  payload.user_metadata?.name ||
                  payload.email?.split("@")[0] ||
                  "Google Patient",
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
          navigate("/dashboard");
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
        const user = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Patient",
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
        const user = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Patient",
        };
        setStoredUser(user);
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname === "/"
        ) {
          navigate("/dashboard");
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
      <TooltipProvider>
        <BrowserRouter>
          <AuthSessionListener />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/vaccinations" element={<VaccinationsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/intake" element={<IntakePage />} />
            <Route path="/intake/:sessionId" element={<IntakePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            {/* Scoped Recipient & Triage Viewer Route */}
            <Route path="/e/:token" element={<EmergencyResponderPage />} />
            <Route path="/emergency/verify" element={<EmergencyResponderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
