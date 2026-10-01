/**
 * Admin Protected Route
 * 
 * Protects routes that require admin role
 * Redirects to admin login if not admin
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "./PageLoader";

export default function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Verifying admin access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
