import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, Camera, Save, Mail, Calendar, Image as ImageIcon, 
  AlertCircle, Bell, Sparkles, Check, CheckCheck, Trash2, 
  Crown, Coins, ArrowRight, Shield, Settings, History, 
  ChevronRight, Scissors, Sparkle, X, ExternalLink
} from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";
import { useAuth } from "../context/AuthContext";
import { 
  getUserProfile, updateProfile, updateProfilePicture, 
  getUserAnalyses, getNotifications, markNotificationAsRead, 
  markAllNotificationsAsRead, deleteNotification, getMembershipStatus,
  getBackendOrigin
} from "../utils/api";
import PageLoader from "../components/PageLoader";
import LoadingSpinner from "../components/LoadingSpinner";

// Professional styling advice for each face shape displayed in the modal
const faceShapeDetails = {
  oval: {
    title: "Oval Face Shape",
    description: "Oval face shapes are highly versatile and balanced. The forehead is slightly wider than the jawline, and the face length is longer than the width.",
    tips: [
      "Suits almost any haircut: Pompadour, Undercut, Buzz Cut, or Side Part.",
      "Keep hair off your forehead to show off your balanced proportions.",
      "For beards, a clean-shaven look or short stubble works best to maintain chin shape."
    ],
    features: "Balanced proportions, soft curves, length is 1.5x width."
  },
  round: {
    title: "Round Face Shape",
    description: "Round face shapes feature similar width and length with soft, curved jawlines and cheeks. The goal is to add structure, height, and definition.",
    tips: [
      "Go for styles with volume on top: Pompadours, Faux Hawks, or Quiffs.",
      "Keep the sides short to avoid widening the face.",
      "A square beard or a beard that adds length at the chin (like a Goatee) will help elongate your face structure."
    ],
    features: "Soft jawline, wide cheekbones, equal length and width."
  },
  square: {
    title: "Square Face Shape",
    description: "Square face shapes are defined by a strong jawline, broad forehead, and equal length/width. This is highly masculine and angular.",
    tips: [
      "Textured layers and classic side parts help soften your sharp features.",
      "An undercut or slicked back style highlights your strong jawline.",
      "A full beard or heavy stubble looks exceptionally good with a strong chin."
    ],
    features: "Strong angular jaw, straight sides, wide forehead."
  },
  heart: {
    title: "Heart Face Shape",
    description: "Heart face shapes feature a wider forehead that tapers down to a neat, pointed chin. The objective is to balance the top and bottom halves.",
    tips: [
      "Try side-swept fringes or textured messy cuts that add width on top.",
      "Avoid high fades that make the forehead look even wider.",
      "Grow a full beard or thick stubble to fill out the jawline and chin area."
    ],
    features: "Wide forehead, high cheekbones, pointed chin."
  },
  diamond: {
    title: "Diamond Face Shape",
    description: "Diamond faces have wide cheekbones with a narrow forehead and jawline. The goal is to add volume at the forehead and jaw to balance the cheekbones.",
    tips: [
      "Hairstyles with fringes or messy side sweeps add volume at the forehead.",
      "Try medium-to-long cuts with layers that frame the face.",
      "A full beard helps widen a narrow jawline and balances your cheekbones."
    ],
    features: "Wide cheekbones, narrow chin, narrow forehead."
  }
};

export default function UserDashboard() {
  const { user: authUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile"); // profile, history, notifications
  const [profileData, setProfileData] = useState({
    username: "",
    full_name: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await getNotifications({ limit: 50 });
      if (res.success) setNotifications(res.data || []);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, analysesRes, membershipRes] = await Promise.all([
        getUserProfile(),
        getUserAnalyses(),
        getMembershipStatus()
      ]);

      if (profileRes.success && profileRes.user) {
        const userData = profileRes.user;

        // Merge live membership data (credits + is_premium) from dedicated endpoint
        if (membershipRes?.success && membershipRes?.membership) {
          userData.credits = membershipRes.membership.credits;
          userData.is_premium = membershipRes.membership.is_premium;
        }

        setUser(userData);
        
        // Set profile data with proper fallbacks
        setProfileData({
          username: userData.username || userData.email?.split('@')[0] || "",
          full_name: userData.full_name || "",
        });
        
        // Clear preview
        setProfilePicturePreview(null);
      }

      if (analysesRes.success) {
        setAnalyses(analysesRes.data || []);
      }

      loadNotifications();
    } catch (err) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Profile picture must be less than 2MB");
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpdateProfileFields = async () => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      if (!profileData.username || profileData.username.trim() === '') {
        setError("Username cannot be empty");
        setUpdating(false);
        return;
      }

      const updateData = {
        username: profileData.username.trim(),
        full_name: profileData.full_name?.trim() || null,
      };

      const response = await updateProfile(updateData);
      if (response.success && response.user) {
        const updatedUser = response.user;
        
        // Retain credits/premium info in state since updateProfile API call might not return it
        updatedUser.credits = user?.credits;
        updatedUser.is_premium = user?.is_premium;
        
        setUser(updatedUser);
        
        setProfileData({
          username: updatedUser.username || updatedUser.email?.split('@')[0] || "",
          full_name: updatedUser.full_name || "",
        });
        
        setSuccess("Profile updated successfully!");
        
        const { setAuth } = await import("../utils/api");
        const token = localStorage.getItem('token');
        if (token && response.user) {
          setAuth(token, updatedUser, false);
          updateUser(updatedUser);
        }
      } else {
        setError(response.message || "Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || "Failed to update profile. Please check your connection.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProfilePictureOnly = async () => {
    if (!profilePictureFile) {
      setError("Please select an image first");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const uploadFormData = new FormData();
      uploadFormData.append("profile_picture", profilePictureFile);
      
      const response = await updateProfilePicture(uploadFormData);
      
      if (response.success && response.user) {
        const updatedUser = response.user;
        updatedUser.credits = user?.credits;
        updatedUser.is_premium = user?.is_premium;

        setUser(updatedUser);
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        setSuccess("Profile picture updated successfully!");
        
        const { setAuth } = await import("../utils/api");
        const token = localStorage.getItem('token');
        if (token && response.user) {
          setAuth(token, updatedUser, false);
          updateUser(updatedUser);
        }
      } else {
        setError(response.message || "Failed to update profile picture.");
      }
    } catch (err) {
      console.error('Profile picture upload error:', err);
      setError(err.message || "Failed to update profile picture.");
    } finally {
      setUpdating(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (profilePicturePreview) {
      return profilePicturePreview;
    }
    
    if (user?.profile_picture) {
      if (user.profile_picture.startsWith('http')) {
        return user.profile_picture;
      }
      const cleanPath = user.profile_picture.replace(/^src\//, '').replace(/^uploads\//, 'uploads/');
      const origin = getBackendOrigin();
      return `${origin}/${cleanPath}`;
    }
    
    return null;
  };

  const getAnalysisImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.replace(/^src\//, '').replace(/^uploads\//, 'uploads/');
    const origin = getBackendOrigin();
    return `${origin}/${cleanPath}`;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Custom helper to style the Face Shape badges nicely (matching professional light aesthetic)
  const getFaceShapeBadgeStyles = (shape) => {
    const s = shape?.toLowerCase() || '';
    if (s.includes('oval')) {
      return "bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold";
    } else if (s.includes('round')) {
      return "bg-sky-50 border border-sky-150 text-sky-700 font-bold";
    } else if (s.includes('square')) {
      return "bg-emerald-50 border border-emerald-150 text-emerald-700 font-bold";
    } else if (s.includes('heart')) {
      return "bg-rose-50 border border-rose-150 text-rose-700 font-bold";
    } else {
      return "bg-amber-50 border border-amber-150 text-amber-700 font-bold";
    }
  };

  if (loading) {
    return <PageLoader message="Loading your premium dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans pt-20 relative overflow-hidden">
      {/* Subtle light mesh background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-50/50 rounded-full blur-[100px] pointer-events-none -z-10" />

      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>

      {/* HEADER BANNER */}
      <div className="relative h-60 bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-50/60 border-b border-slate-200/60 overflow-hidden">
        {/* Subtle grid layout overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
        
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end">
          <div className="relative w-full pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 z-10">
            {/* Avatar Container */}
            <div className="relative group">
              <div className={`w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 bg-white shadow-xl relative transition-all duration-300 group-hover:scale-102 ${
                user?.is_premium 
                  ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-2 ring-amber-400/20" 
                  : "border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-2 ring-sky-400/20"
              }`}>
                {getProfilePictureUrl() ? (
                  <img
                    src={getProfilePictureUrl()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const defaultAvatar = e.target.parentElement?.querySelector('.default-avatar');
                      if (defaultAvatar) defaultAvatar.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`default-avatar w-full h-full flex items-center justify-center absolute inset-0 ${getProfilePictureUrl() ? 'hidden' : ''} bg-slate-100`}>
                  <User className="w-14 h-14 text-slate-400" />
                </div>
              </div>
              
              <label className="absolute bottom-0 right-0 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 p-2.5 rounded-full cursor-pointer shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white">
                <Camera size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </label>
            </div>

            {/* Profile Quick Info */}
            <div className="text-center md:text-left flex-1 md:pb-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {user?.full_name || user?.username || "Guest User"}
                </h1>
                <div className="flex justify-center md:justify-start">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                    user?.is_premium 
                      ? "bg-amber-100/50 text-amber-700 border-amber-300/40" 
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {user?.is_premium ? (
                      <>
                        <Crown size={12} className="text-amber-500 animate-pulse" />
                        Premium Member
                      </>
                    ) : (
                      "Starter Plan"
                    )}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-2.5 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                <Mail size={14} className="text-slate-400" />
                {user?.email}
              </p>
            </div>
            
            {/* Save profile picture triggers */}
            {profilePictureFile && (
              <div className="flex gap-2 shrink-0 md:mb-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xl backdrop-blur-md">
                <button
                  onClick={handleUpdateProfilePictureOnly}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 text-xs font-bold hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {updating ? <LoadingSpinner size="sm" /> : <Check size={14} />}
                  <span>Save Avatar</span>
                </button>
                <button
                  onClick={() => {
                    setProfilePictureFile(null);
                    setProfilePicturePreview(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative">
        {/* ALERTS */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-800 shadow-sm animate-slideDown">
            <AlertCircle size={20} className="text-rose-500 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800 shadow-sm animate-slideDown">
            <CheckCheck size={20} className="text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* MAIN TAB CONTROL + TAB CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-200/50 p-6 sm:p-8">
              
              {/* TAB SELECTOR */}
              <div className="flex bg-slate-100/80 p-1.5 rounded-2xl space-x-1 mb-8 overflow-x-auto scrollbar-none border border-slate-200/50 backdrop-blur-xs w-fit max-w-full">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all duration-300 whitespace-nowrap ${
                    activeTab === "profile" 
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/20 scale-[1.01]" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  <Settings size={16} />
                  Profile Details
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all duration-300 whitespace-nowrap ${
                    activeTab === "history" 
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/20 scale-[1.01]" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  <History size={16} />
                  Analysis History
                  {analyses.length > 0 && (
                    <span className="bg-slate-200/80 text-slate-655 px-2.5 py-0.5 rounded-full text-xs font-black">
                      {analyses.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all duration-300 whitespace-nowrap ${
                    activeTab === "notifications" 
                      ? "bg-white text-slate-900 shadow-md border border-slate-200/20 scale-[1.01]" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  <Bell size={16} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* TABS CONTAINER */}
              {activeTab === "profile" && (
                <ScrollReveal className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username || ""}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition rounded-xl font-semibold text-sm text-slate-800"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Your unique public identifier</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={profileData.full_name || ""}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition rounded-xl font-semibold text-sm text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Optional - your display name</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-3 pl-11 bg-slate-100 text-slate-400 border border-slate-200 font-semibold rounded-xl cursor-not-allowed outline-none text-sm animate-none"
                      />
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Email address cannot be changed</p>
                  </div>

                  <button
                    onClick={handleUpdateProfileFields}
                    disabled={updating}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30"
                  >
                    {updating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Updating profile...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </ScrollReveal>
              )}

              {activeTab === "history" && (
                <ScrollReveal className="space-y-6">
                  {analyses.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200/60 text-slate-400">
                        <ImageIcon size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">No Analyses Found</h3>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1 leading-relaxed">
                        Analyze your face structure using our AI tool to get personalized beard & hairstyle recommendations.
                      </p>
                      <button
                        onClick={() => navigate("/face-analyzer")}
                        className="mt-6 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 font-bold text-sm shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Sparkle size={16} className="animate-spin-slow" />
                        <span>Analyze Face Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {analyses.map((analysis) => (
                        <div
                          key={analysis.id}
                          onClick={() => handleOpenAnalysisModal(analysis)}
                          className="flex items-center gap-4 p-4 bg-white border border-slate-200/65 hover:border-slate-350 hover:bg-slate-50/40 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-0.5 group"
                        >
                          {/* Face image thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200 shadow-inner relative">
                            {analysis.image_path ? (
                              <img 
                                src={getAnalysisImageUrl(analysis.image_path)}
                                alt="Face Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="hidden absolute inset-0 bg-slate-100 flex items-center justify-center">
                              <User size={16} className="text-slate-400" />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 ${getFaceShapeBadgeStyles(analysis.face_shape)}`}>
                              {analysis.face_shape} Shape
                            </span>
                            
                            {/* Confidence mini progress */}
                            <div className="flex items-center gap-2">
                              <p className="text-slate-600 font-bold text-xs shrink-0">
                                Match: {analysis.confidence_score}%
                              </p>
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className="bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${analysis.confidence_score}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                              {new Date(analysis.analysis_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                          
                          <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-650 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollReveal>
              )}

              {activeTab === "notifications" && (
                <ScrollReveal className="space-y-6">
                  {notifications.length > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Inbox Notifications
                      </h4>
                      {notifications.some((n) => !n.is_read) && (
                        <button
                          onClick={async () => {
                            try {
                              await markAllNotificationsAsRead();
                              setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck size={14} />
                          Mark all read
                        </button>
                      )}
                    </div>
                  )}

                  {notificationsLoading ? (
                    <div className="text-center py-12 text-slate-400">
                      <LoadingSpinner size="md" />
                      <p className="text-sm mt-2 font-medium">Refreshing notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200/60 text-slate-400">
                        <Bell size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">All Caught Up</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1 leading-relaxed">
                        You don't have any notifications right now. System events and analysis updates will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 hover-lift ${
                            n.is_read
                              ? "border-slate-200/60 bg-white hover:border-slate-300"
                              : "border-indigo-150 bg-indigo-50/10 hover:border-indigo-200"
                          }`}
                        >
                          <Link
                            to={n.link || "#"}
                            onClick={async () => {
                              if (!n.is_read) {
                                try {
                                  await markNotificationAsRead(n.id);
                                  setNotifications((prev) =>
                                    prev.map((item) => (item.id === n.id ? { ...item, is_read: 1 } : item))
                                  );
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                            className="flex-1 flex gap-3 min-w-0"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              n.is_read ? "bg-slate-50 text-slate-450 border-slate-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }`}>
                              <Sparkles size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold truncate ${n.is_read ? "text-slate-655" : "text-slate-900"}`}>
                                  {n.title}
                                </p>
                                {!n.is_read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-semibold">{n.message}</p>
                              <span className="text-[10px] text-slate-400 font-bold block mt-2">
                                {new Date(n.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </Link>
                          
                          <button
                            onClick={async () => {
                              try {
                                await deleteNotification(n.id);
                                setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-405 hover:text-rose-500 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shrink-0"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollReveal>
              )}

            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            
            {/* MEMBERSHIP STATUS CARD */}
            <ScrollReveal delay={0.1} className={`rounded-3xl p-6 border shadow-xl relative overflow-hidden group transition-all duration-300 ${
              user?.is_premium 
                ? "bg-gradient-to-br from-amber-50 via-amber-50/80 to-amber-100/30 border-amber-200/80 text-slate-900 shadow-amber-500/5 hover:border-amber-300" 
                : "bg-white border-slate-200/50 text-slate-800 shadow-slate-100/50"
            }`}>
              {user?.is_premium && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl -mr-12 -mt-12 group-hover:bg-amber-400/10 transition-all duration-700 pointer-events-none"></div>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  user?.is_premium ? "text-amber-600" : "text-slate-400"
                }`}>
                  <Crown size={16} className={user?.is_premium ? "text-amber-500 fill-amber-500/10" : ""} />
                  Plan & Status
                </h3>
                
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                  user?.is_premium 
                    ? "bg-amber-100 text-amber-700 border-amber-300/40" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {user?.is_premium ? "Lifetime" : "Free"}
                </span>
              </div>

              <div className={`p-5 rounded-2xl mb-6 border ${
                user?.is_premium 
                  ? "bg-white/80 border-amber-200/60" 
                  : "bg-slate-50 border-slate-200/60"
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-widest block mb-1.5 text-slate-400">
                  Current subscription
                </span>
                <p className="text-xl font-black tracking-tight leading-tight text-slate-900">
                  {user?.is_premium ? "FaceCraft Premium" : "Starter Pack"}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Coins size={14} className={user?.is_premium ? "text-amber-500" : "text-indigo-600"} />
                  <span className="text-xs font-semibold text-slate-600">
                    {user?.is_premium ? "Unlimited access to all AI models" : `${user?.credits || 0} Credits remaining`}
                  </span>
                </div>
              </div>

              {!user?.is_premium ? (
                <div className="space-y-2">
                  <Link 
                    to="/pricing"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 transition-all"
                  >
                    <span>Get More Credits</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link 
                    to="/pricing"
                    className="w-full py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Crown size={12} className="text-amber-500" />
                    <span>Unlock Premium</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 font-semibold text-slate-655">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Check size={14} className="text-amber-500" />
                    <span>Unlimited Hairstyle try-ons</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <Check size={14} className="text-amber-500" />
                    <span>Unlimited Beard try-ons</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <Check size={14} className="text-amber-500" />
                    <span>Unlimited Virtual Makeup Try</span>
                  </div>
                </div>
              )}
            </ScrollReveal>

            {/* QUICK AI NAV */}
            <ScrollReveal delay={0.2} className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-650" />
                Quick AI Tools
              </h3>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/face-analyzer")}
                  className="w-full p-3.5 bg-white border border-slate-200/70 hover:border-slate-350 hover:bg-slate-50/40 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 group hover-lift shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/40">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Face Shape Scan</p>
                    <p className="text-[10px] text-slate-400 truncate font-semibold">Analyze structural proportions</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-650 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  onClick={() => navigate("/hair-virtual-try")}
                  className="w-full p-3.5 bg-white border border-slate-200/70 hover:border-slate-350 hover:bg-slate-50/40 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 group hover-lift shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/40">
                    <Scissors size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Hairstyle Try-On</p>
                    <p className="text-[10px] text-slate-400 truncate font-semibold">Test hairstyles & beard types</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-655 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                <button
                  onClick={() => navigate("/makeup-virtual-try")}
                  className="w-full p-3.5 bg-white border border-slate-200/70 hover:border-slate-350 hover:bg-slate-50/40 rounded-2xl text-left transition-all duration-300 flex items-center gap-3 group hover-lift shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/40">
                    <Sparkle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">Makeup virtual filter</p>
                    <p className="text-[10px] text-slate-400 truncate font-semibold">Apply dynamic beauty effects</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-650 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              </div>
            </ScrollReveal>

            {/* SECURITY */}
            <ScrollReveal delay={0.3} className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
              <h3 className="text-[10px] font-black text-slate-405 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={16} className="text-slate-400" />
                Account Security
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold">
                    Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="w-full py-3 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 hover:scale-[1.01] hover:text-rose-700 active:scale-95 text-xs font-bold transition-all duration-300"
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </div>

      {/* DETAILED SCAN MODAL */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] animate-scaleIn text-slate-800">
            
            {/* Close */}
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-655 hover:text-slate-900 transition-all z-20"
            >
              <X size={18} />
            </button>

            {/* AI Image Scan */}
            <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center relative overflow-hidden h-64 md:h-auto shrink-0 animate-none">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>
              {selectedAnalysis.image_path ? (
                <img
                  src={getAnalysisImageUrl(selectedAnalysis.image_path)}
                  alt="Scanned Face"
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <User className="w-20 h-20 text-slate-700 z-10" />
              )}
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none z-20"></div>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-400/80 shadow-[0_0_12px_#38bdf8] animate-scanline z-20"></div>
            </div>

            {/* Details Panel */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar bg-white">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-650 block mb-1">
                AI Landmark Scan
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {selectedAnalysis.face_shape} Face Shape
              </h3>
              
              {/* Score bar */}
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-500">Match Confidence</span>
                  <span className="text-sm font-black text-indigo-655">{selectedAnalysis.confidence_score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 h-full rounded-full"
                    style={{ width: `${selectedAnalysis.confidence_score}%` }}
                  ></div>
                </div>
              </div>

              {/* Information lists */}
              <div className="mt-6 flex-1 space-y-5">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-550 animate-pulse" />
                    Shape Description
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {faceShapeDetails[selectedAnalysis.face_shape.toLowerCase()]?.description || 
                     "Your shape features custom balance proportions suited for styled haircuts and details."}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                    <Scissors size={12} className="text-sky-550" />
                    Hairstyling Advice
                  </h4>
                  <ul className="space-y-2">
                    {(faceShapeDetails[selectedAnalysis.face_shape.toLowerCase()]?.tips || [
                      "Select hairstyles that match your facial structure guidelines.",
                      "Choose hair length details to soften jawlines and cheekbones.",
                      "Consult the AI chatbot for specific daily grooming advice."
                    ]).map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-655 flex items-start gap-2 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2.5">
                <button
                  onClick={() => {
                    setSelectedAnalysis(null);
                    navigate("/hair-virtual-try");
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-900 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 active:scale-95"
                >
                  <span>Launch Virtual Try-On</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
