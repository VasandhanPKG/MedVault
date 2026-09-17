import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken, getStoredUser, isProfileComplete } from "@/lib/api-client";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowIncompleteProfile?: boolean;
}

export function ProtectedRoute({
  children,
  allowIncompleteProfile = false,
}: ProtectedRouteProps) {
  const token = getAuthToken();
  const location = useLocation();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const profileDone = isProfileComplete(user);

  // If user profile is incomplete and they try to navigate to any protected page other than /profile
  if (!profileDone && !allowIncompleteProfile && location.pathname !== "/profile") {
    return <Navigate to="/profile" state={{ requiredSetup: true }} replace />;
  }

  return children;
}
