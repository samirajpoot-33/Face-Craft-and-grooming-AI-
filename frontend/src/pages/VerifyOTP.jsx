import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { verifyOTP, resendOTP } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds countdown
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Reset timer countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle typing OTP
  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Allow only numbers
    
    const newOtp = [...otp];
    // Keep only last char (if user pastes/inputs multi-digit)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError("");
    setSuccessMsg("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace / key down
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste code
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(data)) return; // Valid 6-digit number only

    const digits = data.split("");
    setOtp(digits);
    setError("");
    
    // Focus last input field
    inputRefs.current[5].focus();
  };

  // Submit OTP
  const handleSubmit = async (e) => {
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
      const response = await verifyOTP(email, code);
      if (response.success) {
        setSuccessMsg("Email verified successfully! Logging you in...");
        setTimeout(() => {
          navigate("/", { replace: true });
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Invalid or expired verification code.");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (timer > 0) return;
    
    setError("");
    setSuccessMsg("");
    setResending(true);

    try {
      const response = await resendOTP(email);
      if (response.success) {
        setSuccessMsg("A new verification code has been sent to your email.");
        setTimer(60); // Reset timer
      } else {
        setError(response.message || "Failed to resend code.");
      }
    } catch (err) {
      setError(err.message || "Error resending code. Please try again.");
    } finally {
      setResending(false);
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
          onClick={() => navigate("/login")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>

        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Verify Your Email</h1>
          <p className="text-xs text-slate-400 px-4">
            We have sent a 6-digit OTP code to <br />
            <span className="text-sky-400 font-medium">{email || "your registered email"}</span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP INPUTS */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="
                  w-12 h-14 text-center text-xl font-bold rounded-xl
                  bg-slate-950/60 border-2 border-slate-700/60
                  text-slate-100 focus:border-sky-500 focus:bg-slate-900/80
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20
                  transition-all duration-200
                "
                required
              />
            ))}
          </div>

          {/* TIMER AND RESEND */}
          <div className="text-center text-xs text-slate-400">
            {timer > 0 ? (
              <p>Resend code in <span className="text-sky-400 font-semibold">{timer}s</span></p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sky-400 hover:text-sky-300 font-semibold transition-colors disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend Verification Code"}
              </button>
            )}
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
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" variant="white" />
                <span>Verifying code...</span>
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
