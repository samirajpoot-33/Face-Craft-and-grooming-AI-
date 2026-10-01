import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { registerUser } from "../utils/api";
import OAuthButtons from "../components/OAuthButtons";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = () => {
  const [form, setForm] = useState({ 
    username: "", 
    fullName: "", 
    email: "", 
    password: "" 
  });
  const [showPassword, setShowPassword] = useState(false); // toggle visibility
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error when user types
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password strength validation: minimum 8 chars, includes uppercase, lowercase, number, special char
    const password = form.password;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Generate username from email if not provided
      // Clean the username: remove special chars, make lowercase, limit length
      let username = form.username;
      if (!username || username.trim() === '') {
        username = form.email.split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_.-]/g, '')
          .substring(0, 20);
        
        // Ensure minimum length
        if (username.length < 3) {
          username = username + '123';
        }
      }
      
      const response = await registerUser({
        username: username.trim(),
        email: form.email.trim(),
        password: form.password,
        full_name: form.fullName?.trim() || null,
      });
      
      if (response.success) {
        if (response.needsVerification) {
          navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
        } else {
          // Redirect to home or dashboard
          navigate("/");
          // Optionally reload to update navbar/auth state
          window.location.reload();
        }
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pt-20 pb-10 relative overflow-hidden">

      {/* GLOW EFFECTS */}
       <div className="absolute top-0 left-0 w-100 h-100 bg-sky-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-100 h-100 bg-indigo-500/20 blur-[120px] rounded-full" />

      <div className="
        relative w-full max-w-md p-8 rounded-3xl 
        bg-slate-900/80 backdrop-blur-xl 
        border border-slate-800/70 
        shadow-[0_0_40px_rgba(0,0,0,0.4)]
        animate-scale-in
      ">
        <h1 className="text-3xl font-bold text-slate-100 text-center mb-2 animate-fade-in-up bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
          Create Account
        </h1>

        <p className="text-center text-slate-400 text-sm mb-8 animate-fade-in-up animate-delay-200">
          Join FaceCraft AI and personalize your style journey
        </p>

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
          {/* FULL NAME */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              className="
                w-full pl-12 pr-4 py-3.5 rounded-xl
                bg-slate-950/50 border-2 border-slate-700/50
                text-slate-200 text-sm
                focus:border-sky-500 focus:bg-slate-900/80
                focus:outline-none focus:ring-2 focus:ring-sky-500/20
                transition-all duration-200
                placeholder:text-slate-500
              "
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

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
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password (min. 8 characters, upper, lower, number, special)"
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
              minLength={8}
            />
            {/* Show/Hide Icon */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* SUBMIT BUTTON */}
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
                <LoadingSpinner size="sm" variant="white" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-400 hover:text-sky-300 font-semibold underline-offset-2 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
