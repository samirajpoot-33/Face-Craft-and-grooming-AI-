import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Check for OAuth errors in URL
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clean URL
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect if already logged in as regular user
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
        // If user is already logged in (and not admin), redirect to home page
      if (isAuthenticated && user && user.role !== 'admin') {
        navigate("/", { replace: true });
      }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(form.email, form.password);
      
      if (response.success && response.user) {
        // Update auth context with complete user data
        const { useAuth } = await import("../context/AuthContext");
        // The login function in AuthContext will be called by api.js setAuth
        // Redirect to home or dashboard
        navigate("/");
        // Small delay to ensure state is updated
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      if (err.needsVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(err.email || form.email)}`);
        return;
      }
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pt-20 pb-10 relative overflow-hidden">

      {/* ENHANCED BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="
        relative w-full max-w-md p-10 rounded-3xl 
        bg-slate-900/90 backdrop-blur-2xl 
        border border-slate-800/80 
        shadow-2xl shadow-sky-500/10
        animate-scale-in
      ">
        {/* LOGO/HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 mb-4 shadow-lg shadow-sky-500/50 animate-fade-in-up">
            <span className="text-2xl font-bold text-white">FC</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-100 mb-2 bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent animate-fade-in-up animate-delay-100">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm animate-fade-in-up animate-delay-200">
            Login to access your dashboard & saved looks
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm backdrop-blur-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* OAUTH BUTTONS */}
        <div className="mb-6">
          <OAuthButtons 
            onSuccess={(result) => {
              navigate("/");
              window.location.reload();
            }}
            onError={(err) => setError(err)}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="
                w-full pl-12 pr-4 py-3.5 rounded-xl
                bg-slate-950/50 border-2 border-slate-700/50
                text-slate-200 text-sm
                focus:border-sky-500 focus:bg-slate-900/80
                focus:outline-none focus:ring-2 focus:ring-sky-500/20
                transition-all duration-300
                placeholder:text-slate-500
                input-premium
              "
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="
                w-full pl-12 pr-12 py-3.5 rounded-xl
                bg-slate-950/50 border-2 border-slate-700/50
                text-slate-200 text-sm
                focus:border-sky-500 focus:bg-slate-900/80
                focus:outline-none focus:ring-2 focus:ring-sky-500/20
                transition-all duration-200
                placeholder:text-slate-500
              "
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* FORGOT PASSWORD LINK */}
          <div className="flex justify-end text-xs -mt-2">
            <Link
              to="/forgot-password"
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3.5 rounded-xl text-white text-sm font-bold
              bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500
              shadow-lg shadow-sky-500/30
              hover:shadow-xl hover:shadow-sky-500/40
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
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
