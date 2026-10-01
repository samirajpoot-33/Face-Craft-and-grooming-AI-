import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { adminLogin } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    // Wait for auth to finish loading
    if (user && user.role === 'admin' && isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await adminLogin(form.email, form.password);
      
      if (response.success && response.user && response.user.role === 'admin') {
        // Admin login successful - redirect to admin dashboard immediately
        window.location.href = "/admin";
      } else {
        setError(response.message || "Invalid admin credentials. Please check your email and password.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 relative overflow-hidden">
      {/* ENHANCED BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-md p-10 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 shadow-2xl shadow-purple-500/10">
        {/* LOGO/HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-4 shadow-lg shadow-purple-500/50 animate-fade-in-up">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-100 mb-2 bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent animate-fade-in-up animate-delay-100">
            Admin Login
          </h1>
          <p className="text-slate-400 text-sm animate-fade-in-up animate-delay-200">
            Access admin dashboard & manage users
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm backdrop-blur-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Enter admin email"
              className="
                w-full pl-12 pr-4 py-3.5 rounded-xl
                bg-slate-950/50 border-2 border-slate-700/50
                text-slate-200 text-sm
                focus:border-purple-500 focus:bg-slate-900/80
                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                transition-all duration-200
                placeholder:text-slate-500
              "
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              className="
                w-full pl-12 pr-4 py-3.5 rounded-xl
                bg-slate-950/50 border-2 border-slate-700/50
                text-slate-200 text-sm
                focus:border-purple-500 focus:bg-slate-900/80
                focus:outline-none focus:ring-2 focus:ring-purple-500/20
                transition-all duration-200
                placeholder:text-slate-500
              "
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3.5 rounded-xl text-white text-sm font-bold
              bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500
              shadow-lg shadow-purple-500/30
              hover:shadow-xl hover:shadow-purple-500/40
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed 
              disabled:hover:scale-100 disabled:hover:shadow-lg
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Login as Admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            Regular user?{" "}
            <a 
              href="/login" 
              className="text-purple-400 hover:text-purple-300 font-semibold underline-offset-2 hover:underline transition-colors"
            >
              User Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
