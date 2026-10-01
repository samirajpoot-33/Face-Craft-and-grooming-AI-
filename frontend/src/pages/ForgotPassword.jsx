import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Key, ShieldCheck, AlertCircle, ArrowLeft, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { forgotPassword, verifyResetCode, resetPassword } from "../utils/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Focus the first OTP input when transitioning to Step 2
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Handle typing OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");
    setSuccessMsg("");

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(data)) return;

    const digits = data.split("");
    setOtp(digits);
    setError("");
    inputRefs.current[5].focus();
  };

  // Submit Step 1: Send Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setSuccessMsg("Verification code sent to your email!");
        setTimeout(() => {
          setSuccessMsg("");
          setStep(2);
        }, 1000);
      } else {
        setError(response.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyResetCode(email, code);
      if (response.success) {
        setSuccessMsg("Verification code verified successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          setStep(3);
        }, 1000);
      } else {
        setError(response.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const code = otp.join("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(email, code, password);
      if (response.success) {
        setSuccessMsg("Password reset successfully! Redirecting to home page...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pt-20 pb-10 relative overflow-hidden">
      {/* GLOW EFFECTS */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-500/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full" />

      <div className="
        relative w-full max-w-md p-8 rounded-3xl 
        bg-slate-900/80 backdrop-blur-xl 
        border border-slate-800/70 
        shadow-[0_0_40px_rgba(0,0,0,0.4)]
        animate-scale-in
      ">
        {/* BACK TO LOGIN BUTTON */}
        <button 
          onClick={() => {
            if (step === 2) {
              setStep(1);
              setError("");
              setSuccessMsg("");
            } else if (step === 3) {
              setStep(2);
              setError("");
              setSuccessMsg("");
            } else {
              navigate("/login");
            }
          }}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> {step > 1 ? "Back" : "Back to Login"}
        </button>

        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-4 shadow-inner">
            {step === 1 && <Key size={32} />}
            {step === 2 && <ShieldCheck size={32} />}
            {step === 3 && <CheckCircle2 size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify Code"}
            {step === 3 && "Change Password"}
          </h1>
          <p className="text-xs text-slate-400 px-4">
            {step === 1 && "Enter your email address to receive a 6-digit verification code."}
            {step === 2 && `Enter the 6-digit OTP verification code sent to ${email}.`}
            {step === 3 && "Verify your new password. Make sure it has at least 6 characters."}
          </p>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm backdrop-blur-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="flex-1 text-xs">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm backdrop-blur-sm">
            <ShieldCheck size={20} className="flex-shrink-0" />
            <span className="flex-1 text-xs">{successMsg}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Enter your email address"
                className="
                  w-full pl-12 pr-4 py-3.5 rounded-xl
                  bg-slate-950/50 border-2 border-slate-700/50
                  text-slate-200 text-sm
                  focus:border-sky-500 focus:bg-slate-900/80
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20
                  transition-all duration-300
                  placeholder:text-slate-500
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

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
                flex items-center justify-center gap-2
              "
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP CODE */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">6-Digit Verification Code</label>
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="
                      w-12 h-12 text-center text-lg font-bold rounded-xl
                      bg-slate-950/60 border-2 border-slate-700/60
                      text-slate-100 focus:border-sky-500 focus:bg-slate-900/80
                      focus:outline-none focus:ring-2 focus:ring-sky-500/20
                      transition-all duration-200
                    "
                    required
                  />
                ))}
              </div>
            </div>

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
                flex items-center justify-center gap-2
              "
            >
              {loading ? "Verifying..." : "Verify OTP Code"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password (min 6 characters)"
                className="
                  w-full pl-12 pr-12 py-3.5 rounded-xl
                  bg-slate-950/50 border-2 border-slate-700/50
                  text-slate-200 text-sm
                  focus:border-sky-500 focus:bg-slate-900/80
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20
                  transition-all duration-200
                  placeholder:text-slate-500
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* CONFIRM PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="
                  w-full pl-12 pr-12 py-3.5 rounded-xl
                  bg-slate-950/50 border-2 border-slate-700/50
                  text-slate-200 text-sm
                  focus:border-sky-500 focus:bg-slate-900/80
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20
                  transition-all duration-200
                  placeholder:text-slate-500
                "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* RESET BUTTON */}
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
                flex items-center justify-center gap-2
              "
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
