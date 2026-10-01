import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Trash2, Mail, Calendar, Shield, LogOut, AlertCircle, CheckCircle, RefreshCw, MessageSquare, Bot, User, TrendingUp, Clock, ChevronDown, ChevronUp, Sparkles, ScanFace, Megaphone, Share2, ExternalLink, Scissors, Coins, Gift, Crown, Key, Search, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, getUserStats, deleteUser, logout, getChatbotConversations, getChatbotStats, adminDeleteChatbotConversation, getAllFaceAnalyses, adminDeleteFaceAnalysis, getAllMakeupTryOns, getMakeupTryOnStats, adminDeleteMakeupTryOn, broadcastNotification, sendNotificationToUser, getBackendOrigin, getShareStats, getGroomingTryOnStats, getAllHairstyleTryOns, getAllBeardTryOns, adminDeleteHairstyleTryOn, adminDeleteBeardTryOn, getManualPayments, approveManualPayment, rejectManualPayment, giftCreditsToAll, updateUserCredits, updateUserPremium, makeAllUsersFree, updateUserPassword } from "../utils/api";
import PageLoader from "../components/PageLoader";
import GroomingTryOnPanel from "../components/admin/GroomingTryOnPanel";
import { confirmAction, alertAction } from "../utils/swal";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [chatbotStats, setChatbotStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [makeupTryOnStats, setMakeupTryOnStats] = useState(null);
  const [makeupTryOns, setMakeupTryOns] = useState([]);
  const [groomingStats, setGroomingStats] = useState(null);
  const [hairstyleTryOns, setHairstyleTryOns] = useState([]);
  const [beardTryOns, setBeardTryOns] = useState([]);
  const [faceAnalyses, setFaceAnalyses] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [expandedRows, setExpandedRows] = useState({});
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLink, setBroadcastLink] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcastSuccessPopup, setShowBroadcastSuccessPopup] = useState(false);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all"); // "all" | "user"
  const [broadcastTargetUserId, setBroadcastTargetUserId] = useState("");

  // Bulk Gift Modal States
  const [showBulkGiftModal, setShowBulkGiftModal] = useState(false);
  const [bulkGiftAmount, setBulkGiftAmount] = useState(10);
  const [bulkGiftDescription, setBulkGiftDescription] = useState("Bonus credits from Administrator");
  const [bulkGifting, setBulkGifting] = useState(false);

  // Single User Gift Modal States
  const [showUserGiftModal, setShowUserGiftModal] = useState(false);
  const [selectedUserForCredits, setSelectedUserForCredits] = useState(null);
  const [userGiftAmount, setUserGiftAmount] = useState(10);
  const [userGiftAction, setUserGiftAction] = useState("add"); // "add" | "subtract" | "set"
  const [userGiftDescription, setUserGiftDescription] = useState("Bonus credits from Administrator");
  const [userGifting, setUserGifting] = useState(false);
  const [togglingPremiumId, setTogglingPremiumId] = useState(null);

  // Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSearchQuery, setPasswordSearchQuery] = useState("");
  const [passwordsDict, setPasswordsDict] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/admin-login', { replace: true });
      return;
    }
    loadData();
  }, [user, authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const handleFocus = () => {
      if (user && user.role === 'admin' && !authLoading) {
        loadData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, authLoading]);

  const [shareStats, setShareStatsData] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const [usersRes, statsRes, chatbotStatsRes, conversationsRes, faceAnalysesRes, makeupTryOnStatsRes, makeupTryOnsRes, groomingStatsRes, hairstyleTryOnsRes, beardTryOnsRes, shareStatsRes, manualPaymentsRes] = await Promise.all([
        getAllUsers(),
        getUserStats(),
        getChatbotStats().catch((err) => {
          console.warn('Chatbot stats error:', err);
          return { success: false };
        }),
        getChatbotConversations({ limit: 50 }).catch((err) => {
          console.error('Chatbot conversations API error:', err);
          return { success: false, data: [], error: err.message };
        }),
        getAllFaceAnalyses({ limit: 50 }).catch((err) => {
          console.warn('Face analyses API error:', err);
          return { success: false, data: [], error: err.message };
        }),
        getMakeupTryOnStats().catch((err) => {
          console.warn('Makeup try-on stats error:', err);
          return { success: false };
        }),
        getAllMakeupTryOns({ limit: 50 }).catch((err) => {
          console.error('Makeup try-on API error:', err);
          return { success: false, data: [], error: err.message };
        }),
        getGroomingTryOnStats().catch(() => ({ success: false })),
        getAllHairstyleTryOns({ limit: 50 }).catch(() => ({ success: false, data: [] })),
        getAllBeardTryOns({ limit: 50 }).catch(() => ({ success: false, data: [] })),
        getShareStats().catch((err) => {
          console.warn('Share stats error:', err);
          return { success: false };
        }),
        getManualPayments().catch((err) => {
          console.warn('Manual payments error:', err);
          return { success: false, data: [] };
        })
      ]);

      if (usersRes.success) setUsers(usersRes.data || []);
      else if (usersRes.status !== 401) setError(usersRes.message || "Failed to load users");

      if (statsRes.success) setStats(statsRes.stats);
      else if (statsRes.status !== 401) setError(statsRes.message || "Failed to load statistics");

      if (chatbotStatsRes.success) setChatbotStats(chatbotStatsRes.stats);
      else console.warn('Chatbot stats failed:', chatbotStatsRes);

      if (conversationsRes.success) {
        setConversations(conversationsRes.data || []);
      } else {
        console.warn('❌ Chatbot conversations failed:', conversationsRes);
        setConversations([]);
      }

      if (faceAnalysesRes.success) {
        setFaceAnalyses(faceAnalysesRes.data || []);
      } else {
        setFaceAnalyses([]);
      }

      if (makeupTryOnStatsRes.success) {
        setMakeupTryOnStats(makeupTryOnStatsRes.stats);
      }

      if (makeupTryOnsRes.success) {
        setMakeupTryOns(makeupTryOnsRes.data || []);
      } else {
        setMakeupTryOns([]);
      }

      if (groomingStatsRes.success) {
        setGroomingStats(groomingStatsRes.stats);
      }
      if (hairstyleTryOnsRes.success) {
        setHairstyleTryOns(hairstyleTryOnsRes.data || []);
      } else {
        setHairstyleTryOns([]);
      }
      if (beardTryOnsRes.success) {
        setBeardTryOns(beardTryOnsRes.data || []);
      } else {
        setBeardTryOns([]);
      }

      if (shareStatsRes.success) {
        setShareStatsData(shareStatsRes.data);
      }

      if (manualPaymentsRes.success) {
        setManualPayments(manualPaymentsRes.data || []);
      }
    } catch (err) {
      if (err.message && !err.message.includes('401') && !err.message.includes('Unauthorized')) {
        setError(err.message || "Failed to load admin data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    
    const confirmed = await confirmAction({
      title: 'Delete User?',
      text: userToDelete 
        ? `Are you sure you want to delete user "${userToDelete.username || userToDelete.email}"? This action cannot be undone.`
        : 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmButtonText: 'Yes, delete',
      isDelete: true
    });
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      setError("");
      setSuccess("");
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u.id !== userId));
        setSuccess(`User deleted successfully`);
        if (stats) {
          setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to delete user");
      }
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePremium = async (userId, currentPremiumStatus) => {
    const actionText = currentPremiumStatus ? "remove Premium membership from" : "grant Premium membership to";
    const userToUpdate = users.find(u => u.id === userId);
    const displayName = userToUpdate ? (userToUpdate.username || userToUpdate.email) : `User #${userId}`;
    
    const confirmed = await confirmAction({
      title: currentPremiumStatus ? 'Remove Premium?' : 'Grant Premium?',
      text: `Are you sure you want to ${actionText} user "${displayName}"?`,
      confirmButtonText: currentPremiumStatus ? 'Remove' : 'Grant',
      isDelete: currentPremiumStatus
    });
    if (!confirmed) return;

    try {
      setTogglingPremiumId(userId);
      setError("");
      setSuccess("");
      
      const newStatus = !currentPremiumStatus;
      const response = await updateUserPremium(userId, newStatus);
      
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_premium: newStatus } : u));
        setSuccess(`Successfully ${newStatus ? 'granted Premium to' : 'removed Premium from'} ${displayName}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.message || "Failed to update premium status");
      }
    } catch (err) {
      setError(err.message || "Error updating premium status");
    } finally {
      setTogglingPremiumId(null);
    }
  };

  const [resettingAllFree, setResettingAllFree] = useState(false);

  const handleMakeAllUsersFree = async () => {
    const confirmed = await confirmAction({
      title: 'Revoke All Premium?',
      text: 'Are you sure you want to revoke Premium memberships from ALL users? All non-admin accounts will be set to Free membership status. This cannot be undone.',
      confirmButtonText: 'Revoke All',
      isDelete: true
    });
    if (!confirmed) return;

    try {
      setResettingAllFree(true);
      setError("");
      setSuccess("");
      
      const response = await makeAllUsersFree();
      
      if (response.success) {
        setUsers(users.map(u => u.role === 'admin' ? u : { ...u, is_premium: false }));
        setSuccess(response.message || "All users are now on the Free membership plan.");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(response.message || "Failed to reset premium status for users");
      }
    } catch (err) {
      setError(err.message || "Error resetting premium status for users");
    } finally {
      setResettingAllFree(false);
    }
  };

  const handleBulkGiftCredits = async (e) => {
    e.preventDefault();
    if (!bulkGiftAmount || bulkGiftAmount <= 0) {
      await alertAction({
        title: 'Invalid Amount',
        text: 'Please enter a valid credit amount.',
        icon: 'error'
      });
      return;
    }
    try {
      setBulkGifting(true);
      setError("");
      setSuccess("");
      const response = await giftCreditsToAll(bulkGiftAmount, bulkGiftDescription);
      if (response.success) {
        setSuccess(response.message || "Credits gifted to all users successfully!");
        setShowBulkGiftModal(false);
        // Reset inputs
        setBulkGiftAmount(10);
        setBulkGiftDescription("Bonus credits from Administrator");
        // Reload dashboard data
        loadData();
      } else {
        setError(response.message || "Failed to gift credits.");
      }
    } catch (err) {
      setError(err.message || "Error gifting credits.");
    } finally {
      setBulkGifting(false);
    }
  };

  const handleUpdateUserCreditsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForCredits) return;
    if (userGiftAmount === "" || userGiftAmount < 0) {
      await alertAction({
        title: 'Invalid Amount',
        text: 'Please enter a valid credit amount.',
        icon: 'error'
      });
      return;
    }
    try {
      setUserGifting(true);
      setError("");
      setSuccess("");
      const response = await updateUserCredits(selectedUserForCredits.id, {
        amount: userGiftAmount,
        action: userGiftAction,
        description: userGiftDescription,
      });
      if (response.success) {
        setSuccess(response.message || "User credits updated successfully!");
        setShowUserGiftModal(false);
        // Reset selected user
        setSelectedUserForCredits(null);
        setUserGiftAmount(10);
        setUserGiftAction("add");
        setUserGiftDescription("Bonus credits from Administrator");
        // Reload dashboard data
        loadData();
      } else {
        setError(response.message || "Failed to update credits.");
      }
    } catch (err) {
      setError(err.message || "Error updating user credits.");
    } finally {
      setUserGifting(false);
    }
  };

  const handleUpdateUserPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;
    if (!newUserPassword || newUserPassword.trim().length < 6) {
      await alertAction({
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long.',
        icon: 'error'
      });
      return;
    }
    try {
      setUpdatingPassword(true);
      setError("");
      setSuccess("");
      const response = await updateUserPassword(selectedUserForPassword.id, newUserPassword);
      if (response.success) {
        setSuccess(response.message || "User password updated successfully!");
        setShowPasswordModal(false);
        setSelectedUserForPassword(null);
        setNewUserPassword("");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(response.message || "Failed to update password.");
      }
    } catch (err) {
      setError(err.message || "Error updating user password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDirectPasswordReset = async (userId, username) => {
    const pwd = passwordsDict[userId];
    if (!pwd || pwd.trim().length < 6) {
      await alertAction({
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long.',
        icon: 'error'
      });
      return;
    }
    
    const confirmed = await confirmAction({
      title: 'Reset Password?',
      text: `Are you sure you want to change the password for user "${username}"?`,
      confirmButtonText: 'Yes, change it',
      isDelete: false
    });
    if (!confirmed) return;

    try {
      setUpdatingPassword(true);
      setError("");
      setSuccess("");
      const response = await updateUserPassword(userId, pwd);
      if (response.success) {
        setSuccess(response.message || "User password updated successfully!");
        setPasswordsDict({ ...passwordsDict, [userId]: "" });
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(response.message || "Failed to update password.");
      }
    } catch (err) {
      setError(err.message || "Error updating password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Helper function to get feature badge class
  const getFeatureBadgeClass = (color) => {
    const colorMap = {
      pink: 'bg-pink-500/20 text-pink-300',
      purple: 'bg-purple-500/20 text-purple-300',
      sky: 'bg-sky-500/20 text-sky-300',
      indigo: 'bg-indigo-500/20 text-indigo-300',
      rose: 'bg-rose-500/20 text-rose-300',
      amber: 'bg-amber-500/20 text-amber-300',
      violet: 'bg-violet-500/20 text-violet-300',
      cyan: 'bg-cyan-500/20 text-cyan-300',
      emerald: 'bg-emerald-500/20 text-emerald-300',
      yellow: 'bg-yellow-500/20 text-yellow-300',
      blue: 'bg-blue-500/20 text-blue-300',
      teal: 'bg-teal-500/20 text-teal-300',
      orange: 'bg-orange-500/20 text-orange-300',
      slate: 'bg-slate-500/20 text-slate-300',
    };
    return colorMap[color] || 'bg-slate-500/20 text-slate-300';
  };

  // Helper function to extract all features from presetData
  const extractFeatures = (presetData) => {
    if (!presetData) return [];
    const features = [];
    
    // Look
    if (presetData.look?.texture) {
      features.push({ name: presetData.look.title || 'Look', type: 'look', color: 'pink' });
    }
    
    // LUT
    if (presetData.lut?.texture) {
      features.push({ name: presetData.lut.title || 'LUT', type: 'lut', color: 'purple' });
    }
    
    // Face Makeup
    if (presetData.faceMakeup) {
      Object.values(presetData.faceMakeup).forEach(f => {
        if (f?.enabled) {
          features.push({ name: f.title || 'Face Makeup', type: 'faceMakeup', color: 'sky' });
        }
      });
    }
    
    // Eyes Makeup
    if (presetData.eyesMakeup) {
      Object.values(presetData.eyesMakeup).forEach(f => {
        if (f?.enabled) {
          features.push({ name: f.title || 'Eyes Makeup', type: 'eyesMakeup', color: 'indigo' });
        }
      });
    }
    
    // Lipstick
    if (presetData.lipstick?.enabled) {
      features.push({ name: 'Lipstick', type: 'lipstick', color: 'rose' });
    }
    
    // Brows
    if (presetData.brows?.enabled) {
      features.push({ name: presetData.brows.title || 'Brows', type: 'brows', color: 'amber' });
    }
    
    // Eyelashes
    if (presetData.eyelashes?.enabled) {
      features.push({ name: presetData.eyelashes.title || 'Eyelashes', type: 'eyelashes', color: 'violet' });
    }
    
    // Eyes Color
    if (presetData.eyes?.color?.enabled) {
      features.push({ name: 'Eyes Color', type: 'eyes', color: 'cyan' });
    }
    
    // Skin
    if (presetData.skin?.softening?.strength > 0) {
      features.push({ name: presetData.skin.softening.title || 'Skin Softening', type: 'skin', color: 'emerald' });
    }
    if (presetData.skin?.color?.enabled) {
      features.push({ name: 'Skin Color', type: 'skin', color: 'emerald' });
    }
    
    // Softlight
    if (presetData.softlight?.strength > 0) {
      features.push({ name: presetData.softlight.title || 'Softlight', type: 'softlight', color: 'yellow' });
    }
    
    // Teeth Whitening
    if (presetData.teethWhitening?.strength > 0) {
      features.push({ name: presetData.teethWhitening.title || 'Teeth Whitening', type: 'teeth', color: 'blue' });
    }
    
    // Morphs (Retouch)
    if (presetData.morphs) {
      Object.values(presetData.morphs).forEach(m => {
        if (m?.strength > 0) {
          features.push({ name: m.title || 'Retouch', type: 'morph', color: 'teal' });
        }
      });
    }
    
    // Hair
    if (presetData.hair?.enabled) {
      features.push({ name: 'Hair Color', type: 'hair', color: 'orange' });
    }
    
    // Background
    if (presetData.background?.texture) {
      features.push({ name: 'Background', type: 'background', color: 'slate' });
    }
    
    return features;
  };

  const handleDeleteChatbotConversation = async (conversationId) => {
    const conversationToDelete = conversations.find(c => c.id === conversationId);
    const textMessage = conversationToDelete 
      ? `Are you sure you want to delete this chatbot conversation?\n\nMessage: "${conversationToDelete.message?.substring(0, 50)}${conversationToDelete.message?.length > 50 ? '...' : ''}"? This action cannot be undone.`
      : 'Are you sure you want to delete this chatbot conversation? This action cannot be undone.';
    
    const confirmed = await confirmAction({
      title: 'Delete Chat?',
      text: textMessage,
      confirmButtonText: 'Delete',
      isDelete: true
    });
    if (!confirmed) return;

    try {
      setDeletingId(conversationId);
      setError("");
      setSuccess("");
      console.log('🗑️ Admin deleting chatbot conversation:', conversationId);
      const response = await adminDeleteChatbotConversation(conversationId);
      console.log('📥 Delete response:', response);
      if (response && response.success) {
        setConversations(conversations.filter(c => c.id !== conversationId));
        setSuccess(`Chatbot conversation deleted successfully`);
        if (chatbotStats) {
          setChatbotStats({ ...chatbotStats, total: (chatbotStats.total || conversations.length) - 1 });
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Failed to delete chatbot conversation");
        console.error('❌ Delete failed:', response);
      }
    } catch (err) {
      setError(err.message || "Failed to delete chatbot conversation");
      console.error('❌ Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteHairstyleTryOn = async (id) => {
    const confirmed = await confirmAction({
      title: 'Delete Hairstyle Record?',
      text: 'Are you sure you want to delete this hairstyle try-on record? This cannot be undone.',
      confirmButtonText: 'Delete',
      isDelete: true
    });
    if (!confirmed) return;
    try {
      setDeletingId(id);
      const res = await adminDeleteHairstyleTryOn(id);
      if (res.success) {
        setHairstyleTryOns(hairstyleTryOns.filter((r) => r.id !== id));
        setSuccess("Hairstyle record deleted");
      } else {
        setError(res.message || "Delete failed");
      }
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBeardTryOn = async (id) => {
    const confirmed = await confirmAction({
      title: 'Delete Beard Record?',
      text: 'Are you sure you want to delete this beard try-on record? This cannot be undone.',
      confirmButtonText: 'Delete',
      isDelete: true
    });
    if (!confirmed) return;
    try {
      setDeletingId(id);
      const res = await adminDeleteBeardTryOn(id);
      if (res.success) {
        setBeardTryOns(beardTryOns.filter((r) => r.id !== id));
        setSuccess("Beard record deleted");
      } else {
        setError(res.message || "Delete failed");
      }
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMakeupTryOn = async (sessionId) => {
    const sessionToDelete = makeupTryOns.find(s => s.id === sessionId);
    const textMessage = sessionToDelete 
      ? `Are you sure you want to delete makeup session "${sessionToDelete.sessionName || `#${sessionId}`}"? This action cannot be undone.`
      : 'Are you sure you want to delete this makeup session? This action cannot be undone.';
    
    const confirmed = await confirmAction({
      title: 'Delete Makeup Session?',
      text: textMessage,
      confirmButtonText: 'Delete',
      isDelete: true
    });
    if (!confirmed) return;

    try {
      setDeletingId(sessionId);
      setError("");
      setSuccess("");
      console.log('🗑️ Admin deleting makeup session:', sessionId);
      const response = await adminDeleteMakeupTryOn(sessionId);
      console.log('📥 Delete response:', response);
      if (response && response.success) {
        setMakeupTryOns(makeupTryOns.filter(s => s.id !== sessionId));
        setSuccess(`Makeup session deleted successfully`);
        if (makeupTryOnStats) {
          setMakeupTryOnStats({ ...makeupTryOnStats, total: (makeupTryOnStats.total || makeupTryOns.length) - 1 });
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Failed to delete makeup session");
        console.error('❌ Delete failed:', response);
      }
    } catch (err) {
      setError(err.message || "Failed to delete makeup session");
      console.error('❌ Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteFaceAnalysis = async (analysisId) => {
    const confirmed = await confirmAction({
      title: 'Delete Face Analysis?',
      text: 'Are you sure you want to delete this face analysis record? This action cannot be undone.',
      confirmButtonText: 'Delete',
      isDelete: true
    });
    if (!confirmed) return;
    try {
      setDeletingId(analysisId);
      setError("");
      setSuccess("");
      const response = await adminDeleteFaceAnalysis(analysisId);
      if (response?.success) {
        setFaceAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
        setSuccess('Face analysis deleted successfully');
        if (stats) setStats({ ...stats, totalAnalyses: (stats.totalAnalyses || 0) - 1 });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Failed to delete face analysis");
      }
    } catch (err) {
      setError(err.message || "Failed to delete face analysis");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprovePayment = async (id) => {
    const confirmed = await confirmAction({
      title: 'Approve Payment?',
      text: 'Are you sure you want to approve this payment and grant user credits/premium?',
      confirmButtonText: 'Approve',
      icon: 'question'
    });
    if (!confirmed) return;
    try {
      setError("");
      setSuccess("");
      const response = await approveManualPayment(id);
      if (response?.success) {
        setSuccess('Payment approved successfully');
        loadData();
      } else {
        setError(response?.message || "Failed to approve payment");
      }
    } catch (err) {
      setError(err.message || "Failed to approve payment");
    }
  };

  const handleRejectPayment = async (id) => {
    const confirmed = await confirmAction({
      title: 'Reject Payment?',
      text: 'Are you sure you want to reject this payment? The user will not receive credits/premium.',
      confirmButtonText: 'Reject',
      isDelete: true
    });
    if (!confirmed) return;
    try {
      setError("");
      setSuccess("");
      const response = await rejectManualPayment(id);
      if (response?.success) {
        setSuccess('Payment rejected successfully');
        loadData();
      } else {
        setError(response?.message || "Failed to reject payment");
      }
    } catch (err) {
      setError(err.message || "Failed to reject payment");
    }
  };

  if (authLoading || loading) {
    return <PageLoader message={authLoading ? 'Verifying authentication...' : 'Loading dashboard...'} />;
  }

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[140px] rounded-full animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 shadow-purple-500/10 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Shield className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent animate-fade-in-up">
                  Admin Dashboard
                </h1>
                <p className="text-slate-400 mt-1 text-xs sm:text-sm animate-fade-in-up animate-delay-200">System Administration & Analytics</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="text-sm font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-none">{user?.email || 'Admin'}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/admin-login');
                }}
                className="px-4 sm:px-5 py-2.5 rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-semibold text-sm w-full sm:w-auto justify-center"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 shadow-lg backdrop-blur-sm animate-slideDown">
            <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
            <span className="font-semibold flex-1 text-sm sm:text-base">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 font-bold text-xl leading-none">×</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 shadow-lg backdrop-blur-sm animate-slideDown">
            <CheckCircle size={22} className="flex-shrink-0 mt-0.5" />
            <span className="font-semibold flex-1 text-sm sm:text-base">{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-emerald-300 font-bold text-xl leading-none">×</button>
          </div>
        )}

        {/* STATS CARDS */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Users className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-purple-400 opacity-60" size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Users</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{stats.totalUsers}</p>
                <p className="text-xs text-slate-500">Registered accounts</p>
              </div>
            </div>

            <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Shield className="text-white" size={24} />
                  </div>
                  <Shield className="text-indigo-400 opacity-60" size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admins</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{stats.totalAdmins}</p>
                <p className="text-xs text-slate-500">Admin accounts</p>
              </div>
            </div>

            <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-emerald-400 opacity-60" size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Analyses</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{stats.totalAnalyses}</p>
                <p className="text-xs text-slate-500">Face analyses</p>
              </div>
            </div>

            <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-pink-400 opacity-60" size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Makeup Try-Ons</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{stats.totalMakeupTryOns || 0}</p>
                <p className="text-xs text-slate-500">Makeup sessions</p>
              </div>
            </div>

            <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <Clock className="text-orange-400 opacity-60" size={20} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Users (7d)</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{stats.recentUsers}</p>
                <p className="text-xs text-slate-500">This week</p>
              </div>
            </div>

            {chatbotStats && (
              <div className="group bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <MessageSquare className="text-white" size={24} />
                    </div>
                    <Bot className="text-purple-400 opacity-60" size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chatbot Chats</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 mb-1">{chatbotStats.totalConversations || 0}</p>
                  <p className="text-xs text-slate-500">{chatbotStats.recentConversations || 0} today</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TABS */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2 shadow-xl border border-slate-800/80 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Users size={16} className="w-4 h-4" />
                <span>Users</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'users' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{users.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'chatbot'
                  ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <MessageSquare size={16} className="w-4 h-4" />
                <span>Chatbot</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'chatbot' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{conversations.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('face-analysis')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'face-analysis'
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <ScanFace size={16} className="w-4 h-4" />
                <span>Face Analysis</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'face-analysis' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{faceAnalyses.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('makeup')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'makeup'
                  ? 'bg-gradient-to-r from-pink-500 via-rose-600 to-pink-500 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Sparkles size={16} className="w-4 h-4" />
                <span>Makeup</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'makeup' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{makeupTryOns.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('grooming')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'grooming'
                  ? 'bg-gradient-to-r from-sky-500 via-cyan-600 to-sky-500 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Scissors size={16} className="w-4 h-4" />
                <span>Hair & Beard</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'grooming' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{hairstyleTryOns.length + beardTryOns.length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'shares'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 text-white shadow-lg shadow-sky-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Share2 size={16} className="w-4 h-4" />
                <span>Shares</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'shares' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{shareStats?.recentShares?.length || 0}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'broadcast'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Megaphone size={16} className="w-4 h-4" />
                <span>Broadcast</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('manual-payments')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'manual-payments'
                  ? 'bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Coins size={16} className="w-4 h-4" />
                <span>Payments</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  activeTab === 'manual-payments' ? 'bg-white/20' : 'bg-slate-700 text-slate-300'
                }`}>{manualPayments.filter(p => p.status === 'pending').length}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('passwords')}
              className={`w-full whitespace-nowrap px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'passwords'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs xl:text-sm">
                <Key size={16} className="w-4 h-4" />
                <span>Passwords</span>
              </div>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <>
          {/* USERS TABLE - RESPONSIVE */}
          {activeTab === 'users' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Users size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <span>User Management</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-11 sm:ml-14">Total: {users.length} registered users</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowBulkGiftModal(true)}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 flex items-center gap-2 text-sm font-semibold w-full sm:w-auto justify-center"
                  >
                    <Gift size={18} />
                    <span>Gift Credits to All</span>
                  </button>
                  <button
                    onClick={handleMakeAllUsersFree}
                    disabled={resettingAllFree}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    {resettingAllFree ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block"></span>
                    ) : (
                      <Crown size={18} />
                    )}
                    <span>Make All Users Free</span>
                  </button>
                  <button
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      loadData();
                    }}
                    disabled={loading}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
          
              {users.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700">
                    <Users size={32} className="text-slate-500 sm:w-10 sm:h-10" />
                  </div>
                  <p className="text-slate-200 font-semibold text-base sm:text-lg">No users found</p>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2">Users will appear here once they register</p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-slate-800">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Profile</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                          {users.map((u, index) => (
                            <tr key={u.id} className={`hover:bg-slate-800/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200">{u.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    {u.profile_picture ? (
                                      <img
                                        src={u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:5000/${u.profile_picture.replace(/^src\//, '')}`}
                                        alt={u.username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-md ring-2 ring-purple-500/20"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          const fallback = e.target.nextElementSibling;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md border-2 border-slate-700 ${u.profile_picture ? 'hidden' : 'flex'}`}>
                                      <span className="text-white text-sm font-bold">
                                        {u.username?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-200 font-semibold">{u.username || '-'}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-slate-500 flex-shrink-0" />
                                  <span className="text-sm text-slate-300">{u.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-300">{u.full_name || '-'}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleTogglePremium(u.id, u.is_premium)}
                                  disabled={togglingPremiumId === u.id}
                                  className="transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                  title={u.is_premium ? "Remove premium status" : "Make user premium"}
                                >
                                  {u.is_premium ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                                      {togglingPremiumId === u.id ? (
                                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-amber-300 border-t-transparent inline-block"></span>
                                      ) : (
                                        <Sparkles size={12} />
                                      )}
                                      Premium
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700 hover:border-amber-500/50 hover:text-amber-400">
                                      {togglingPremiumId === u.id ? (
                                        <span className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent inline-block"></span>
                                      ) : (
                                        <Crown size={12} />
                                      )}
                                      Free
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-sky-400">{u.credits ?? 0}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedUserForCredits(u);
                                      setUserGiftAmount(10);
                                      setUserGiftAction("add");
                                      setUserGiftDescription("Bonus credits from Administrator");
                                      setShowUserGiftModal(true);
                                    }}
                                    className="p-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all"
                                    title="Update credits"
                                  >
                                    <Coins size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                  u.role === 'admin' 
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                                    : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-500 flex-shrink-0" />
                                  <span className="text-sm text-slate-300">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    }) : '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {u.id !== user.id ? (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={deletingId === u.id}
                                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/50"
                                    title="Delete user"
                                  >
                                    {deletingId === u.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                                    ) : (
                                      <Trash2 size={18} />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500 italic px-2">Current</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE/TABLET CARD VIEW */}
                  <div className="lg:hidden space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="bg-slate-800/50 rounded-2xl p-5 shadow-lg border border-slate-700/50 hover:shadow-xl hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative">
                              {u.profile_picture ? (
                                <img
                                  src={u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:5000/${u.profile_picture.replace(/^src\//, '')}`}
                                  alt={u.username}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 shadow-md ring-2 ring-purple-500/20"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md border-2 border-slate-700 ${u.profile_picture ? 'hidden' : 'flex'}`}>
                                <span className="text-white text-base font-bold">
                                  {u.username?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-slate-100 truncate">{u.username || '-'}</h3>
                                <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  u.role === 'admin' 
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                                    : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {u.role || 'user'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 truncate flex items-center gap-1">
                                <Mail size={12} className="text-slate-500" />
                                {u.email}
                              </p>
                               <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => handleTogglePremium(u.id, u.is_premium)}
                                  disabled={togglingPremiumId === u.id}
                                  className="transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                  title={u.is_premium ? "Remove premium status" : "Make user premium"}
                                >
                                  {u.is_premium ? (
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                                      {togglingPremiumId === u.id ? (
                                        <span className="animate-spin rounded-full h-2.5 w-2.5 border-2 border-amber-400 border-t-transparent inline-block"></span>
                                      ) : (
                                        <Sparkles size={10} />
                                      )}
                                      Premium
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-amber-400">
                                      {togglingPremiumId === u.id ? (
                                        <span className="animate-spin rounded-full h-2.5 w-2.5 border-2 border-slate-500 border-t-transparent inline-block"></span>
                                      ) : (
                                        <Crown size={10} />
                                      )}
                                      Free User
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUserForCredits(u);
                                    setUserGiftAmount(10);
                                    setUserGiftAction("add");
                                    setUserGiftDescription("Bonus credits from Administrator");
                                    setShowUserGiftModal(true);
                                  }}
                                  className="text-[10px] font-black uppercase tracking-wider text-sky-400 border-l border-slate-700 pl-3 flex items-center gap-1 hover:text-sky-300 transition-all"
                                  title="Update credits"
                                >
                                  <Coins size={10} />
                                  {u.credits ?? 0} Credits
                                </button>
                              </div>
                            </div>
                          </div>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                              title="Delete user"
                            >
                              {deletingId === u.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Full Name</p>
                            <p className="text-sm font-semibold text-slate-200">{u.full_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Joined</p>
                            <p className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                              <Calendar size={12} className="text-slate-500" />
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              }) : '-'}
                            </p>
                          </div>
                        </div>
                        {u.id === user.id && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <span className="text-xs text-slate-500 italic">Current logged-in user</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHATBOT CONVERSATIONS - RESPONSIVE */}
          {activeTab === 'chatbot' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <MessageSquare size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <span>Chatbot Conversations</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-11 sm:ml-14">
                    Total: {conversations.length} conversations
                    {chatbotStats && ` • ${chatbotStats.totalUsers || 0} users • ${chatbotStats.recentConversations || 0} today`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    loadData();
                  }}
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            
              {conversations.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700">
                    <MessageSquare size={32} className="text-slate-500 sm:w-10 sm:h-10" />
                  </div>
                  <p className="text-slate-200 font-semibold text-base sm:text-lg">No chatbot conversations found</p>
                  <p className="text-slate-400 text-xs sm:text-sm mt-2">
                    {loading ? "Loading conversations..." : "Conversations will appear here once users start chatting"}
                  </p>
                  {!loading && conversations.length === 0 && (
                    <div className="mt-4 p-3 sm:p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl max-w-md mx-auto backdrop-blur-sm">
                      <p className="text-xs sm:text-sm text-purple-300">
                        <strong>Tip:</strong> Open the chatbot and send a test message to create your first conversation.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden lg:block">
                    <div className="w-full">
                      <table className="w-full divide-y divide-slate-800">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-[60px]">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-[140px]">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-[180px]">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Message</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">AI Response</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-[140px]">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider w-[80px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                          {conversations.map((conv, index) => (
                            <tr key={conv.id} className={`hover:bg-slate-800/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'}`}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-200">{conv.id}</td>
                              <td className="px-4 py-3">
                                {conv.user_id ? (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Bot size={14} className="text-purple-400 flex-shrink-0" />
                                      <span className="text-sm font-semibold text-slate-200 truncate">{conv.username || 'N/A'}</span>
                                    </div>
                                    {conv.full_name && (
                                      <span className="text-xs text-slate-400 block mt-1 truncate">{conv.full_name}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Bot size={14} className="text-slate-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-400 italic font-medium">Anonymous</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-200 truncate" title={conv.user_id ? (conv.email || 'N/A') : 'N/A'}>
                                  {conv.user_id ? (conv.email || 'N/A') : 'N/A'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="max-w-md">
                                  <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{conv.message}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="max-w-lg">
                                  <p className="text-sm text-slate-300 whitespace-normal break-words leading-relaxed line-clamp-3">{conv.response}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-500 flex-shrink-0" />
                                  <span className="text-sm text-slate-300">
                                    {conv.created_at ? new Date(conv.created_at).toLocaleString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteChatbotConversation(conv.id)}
                                  disabled={deletingId === conv.id}
                                  className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/50"
                                  title="Delete conversation"
                                >
                                  {deletingId === conv.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE/TABLET CARD VIEW */}
                  <div className="lg:hidden space-y-4">
                    {conversations.map((conv) => (
                      <div key={conv.id} className="bg-slate-800/50 rounded-2xl p-5 shadow-lg border border-slate-700/50 hover:shadow-xl hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-400">ID: {conv.id}</span>
                            </div>
                            <div className="space-y-1 mb-2">
                              <div className="flex items-center gap-1.5">
                                <Bot size={12} className="text-purple-400" />
                                <span className="text-xs text-slate-400">Username:</span>
                                <span className="text-xs font-semibold text-slate-200">
                                  {conv.user_id ? (conv.username || 'N/A') : 'Anonymous'}
                                </span>
                              </div>
                              {conv.user_id && (
                                <div className="flex items-center gap-1.5">
                                  <Mail size={12} className="text-slate-500" />
                                  <span className="text-xs text-slate-400">Email:</span>
                                  <span className="text-xs font-semibold text-slate-200">{conv.email || 'N/A'}</span>
                                </div>
                              )}
                              {conv.user_id && conv.full_name && (
                                <p className="text-xs text-slate-400">{conv.full_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRowExpansion(conv.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
                            >
                              {expandedRows[conv.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteChatbotConversation(conv.id)}
                              disabled={deletingId === conv.id}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/50"
                              title="Delete conversation"
                            >
                              {deletingId === conv.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20 backdrop-blur-sm">
                            <p className="text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1">
                              <User size={12} className="text-purple-400" />
                              User Message
                            </p>
                            <p className="text-sm text-slate-200">{conv.message}</p>
                          </div>
                          
                          {expandedRows[conv.id] && (
                            <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20 backdrop-blur-sm">
                              <p className="text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                                <Bot size={12} className="text-indigo-400" />
                                AI Response
                              </p>
                              <p className="text-sm text-slate-300">{conv.response}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-slate-500" />
                              <span className="text-xs text-slate-400">
                                {conv.created_at ? new Date(conv.created_at).toLocaleString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* FACE ANALYSIS TABLE */}
          {activeTab === 'face-analysis' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <ScanFace size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <span>Face Analysis Records</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-11 sm:ml-14">
                    Total: {faceAnalyses.length} analyses
                    {stats && ` • ${stats.totalAnalyses ?? 0} total in system`}
                  </p>
                </div>
                <button
                  onClick={() => { setError(""); setSuccess(""); loadData(); }}
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md shadow-emerald-500/30 hover:shadow-lg flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {faceAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <ScanFace className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400 text-lg font-medium">No face analyses yet</p>
                  <p className="text-slate-500 text-sm mt-2">Records will appear here when users run the face shape detector</p>
                </div>
              ) : (
                <>
                  <div className="lg:hidden space-y-4">
                    {faceAnalyses.map((a) => {
                      const annotatedUrl = `${getBackendOrigin()}/uploads/face-analysis/annotated/${a.id}.jpg`;
                      return (
                        <div key={a.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-100 mb-1">{a.username || a.email || `User #${a.user_id}`}</h3>
                              <p className="text-xs text-slate-400">{a.email || 'N/A'}</p>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300">{a.face_shape}</span>
                                <span className="text-xs text-slate-400">{a.confidence_score != null ? `${Number(a.confidence_score).toFixed(0)}%` : '-'}</span>
                              </div>
                            </div>
                            <a href={annotatedUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-slate-600 bg-slate-700">
                              <img src={annotatedUrl} alt="Annotated" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </a>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <span className="text-xs text-slate-500">
                              {a.analysis_date ? new Date(a.analysis_date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                            <button
                              onClick={() => handleDeleteFaceAnalysis(a.id)}
                              disabled={deletingId === a.id}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === a.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-slate-800">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Face Shape</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Confidence</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                          {faceAnalyses.map((a) => {
                            const annotatedUrl = `${getBackendOrigin()}/uploads/face-analysis/annotated/${a.id}.jpg`;
                            return (
                              <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">#{a.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-200">{a.username || a.email || `User #${a.user_id}`}</div>
                                  {a.email && <div className="text-xs text-slate-400">{a.email}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300">{a.face_shape}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                  {a.confidence_score != null ? `${Number(a.confidence_score).toFixed(0)}%` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                  {a.analysis_date ? new Date(a.analysis_date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <a href={annotatedUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-12 h-12 rounded-lg overflow-hidden border border-slate-600 bg-slate-700 hover:ring-2 hover:ring-emerald-500/50 transition-all">
                                    <img src={annotatedUrl} alt="Annotated" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleDeleteFaceAnalysis(a.id)}
                                    disabled={deletingId === a.id}
                                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50"
                                    title="Delete"
                                  >
                                    {deletingId === a.id ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> : <Trash2 size={18} />}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MAKEUP TRY-ON TABLE */}
          {activeTab === 'grooming' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <GroomingTryOnPanel
                hairstyleTryOns={hairstyleTryOns}
                beardTryOns={beardTryOns}
                groomingStats={groomingStats}
                loading={loading}
                deletingId={deletingId}
                onRefresh={loadData}
                onDeleteHairstyle={handleDeleteHairstyleTryOn}
                onDeleteBeard={handleDeleteBeardTryOn}
              />
            </div>
          )}

          {activeTab === 'makeup' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <Sparkles size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <span>Makeup Try-On Sessions</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-11 sm:ml-14">
                    Total: {makeupTryOns.length} sessions
                    {makeupTryOnStats && ` • ${makeupTryOnStats.uniqueUsers || 0} unique users`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    loadData();
                  }}
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-600 to-pink-500 text-white hover:from-pink-600 hover:to-rose-700 transition-all shadow-md shadow-pink-500/30 hover:shadow-lg hover:shadow-pink-500/40 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {makeupTryOns.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400 text-lg font-medium">No makeup try-on sessions yet</p>
                  <p className="text-slate-500 text-sm mt-2">Sessions will appear here when users save their makeup configurations</p>
                </div>
              ) : (
                <>
                  {/* MOBILE CARD VIEW */}
                  <div className="lg:hidden space-y-4">
                    {makeupTryOns.map((session) => {
                      const features = extractFeatures(session.presetData);
                      return (
                        <div
                          key={session.id}
                          className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-100 mb-1">
                                {session.sessionName || `Session #${session.id}`}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-300">
                                  <span className="text-slate-400">Username:</span> {session.username || 'N/A'}
                                </p>
                                <p className="text-xs text-slate-300">
                                  <span className="text-slate-400">Email:</span> {session.email || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMakeupTryOn(session.id)}
                              disabled={deletingId === session.id}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/50"
                              title="Delete session"
                            >
                              {deletingId === session.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-2">Features ({features.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {features.length > 0 ? (
                                features.map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 rounded text-xs ${getFeatureBadgeClass(feature.color)}`}
                                  >
                                    {feature.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500 italic">No features</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <span className="text-xs text-slate-500">
                              {session.createdAt ? new Date(session.createdAt).toLocaleString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden lg:block overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-slate-800">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Features</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                          {makeupTryOns.map((session) => {
                            const features = extractFeatures(session.presetData);
                            return (
                              <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                                  #{session.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-200">
                                    {session.username || 'N/A'}
                                  </div>
                                  {session.fullName && (
                                    <div className="text-xs text-slate-400">{session.fullName}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-slate-200">
                                    {session.email || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1 max-w-md">
                                    {features.length > 0 ? (
                                      features.map((feature, idx) => (
                                        <span
                                          key={idx}
                                          className={`px-2 py-1 rounded text-xs ${getFeatureBadgeClass(feature.color)}`}
                                        >
                                          {feature.name}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs text-slate-500 italic">No features</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                  {session.createdAt ? new Date(session.createdAt).toLocaleString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleDeleteMakeupTryOn(session.id)}
                                    disabled={deletingId === session.id}
                                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30 hover:border-red-500/50"
                                    title="Delete session"
                                  >
                                    {deletingId === session.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                                    ) : (
                                      <Trash2 size={18} />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'shares' && (
            <div className="space-y-6">
              {/* Platform Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-sky-400" size={20} />
                    Engagement by Platform
                  </h3>
                  <div className="space-y-4">
                    {shareStats?.stats?.length > 0 ? (
                      shareStats.stats.map((s) => (
                        <div key={s.platform} className="flex items-center justify-between">
                          <span className="text-slate-400 capitalize">{s.platform}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500" 
                                style={{ width: `${(s.count / Math.max(...shareStats.stats.map(st => st.count))) * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-200 font-bold">{s.count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm italic">No engagement data yet</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Clock className="text-indigo-400" size={20} />
                    Recent Social Activity
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                          <th className="pb-3 px-2">User</th>
                          <th className="pb-3 px-2">Platform</th>
                          <th className="pb-3 px-2">Resource</th>
                          <th className="pb-3 px-2">Date</th>
                          <th className="pb-3 px-2 text-right">Preview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {shareStats?.recentShares?.length > 0 ? (
                          shareStats.recentShares.map((s) => (
                            <tr key={s.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-2">
                                <div className="flex flex-col">
                                  <span className="text-slate-200 text-sm font-semibold">{s.username || 'Guest'}</span>
                                  <span className="text-slate-500 text-[10px]">{s.email || 'Anonymous'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                  s.platform === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' :
                                  s.platform === 'facebook' ? 'bg-blue-600/10 text-blue-400' :
                                  s.platform === 'twitter' ? 'bg-slate-800 text-slate-300' :
                                  'bg-sky-500/10 text-sky-400'
                                }`}>
                                  {s.platform}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-slate-400 text-xs">{s.resource_type?.replace('_', ' ')}</span>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                {s.image_url && (
                                  <a href={s.image_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors">
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-10 text-center text-slate-500 italic">No shares recorded yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="max-w-xl">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Megaphone size={20} className="text-white" />
                  </div>
                  Broadcast Notification
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Send a notification to all users or to a specific registered user.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
                      setError("Title and message are required");
                      return;
                    }
                    if (broadcastTarget === "user" && !broadcastTargetUserId) {
                      setError("Please select a user");
                      return;
                    }
                    setBroadcasting(true);
                    setError("");
                    setSuccess("");
                    try {
                      if (broadcastTarget === "all") {
                        const res = await broadcastNotification({
                          title: broadcastTitle.trim(),
                          message: broadcastMessage.trim(),
                          link: broadcastLink.trim() || null,
                          type: "new_feature",
                        });
                        if (res.success) {
                          setBroadcastSuccessMessage("Notifications have been sent to all users.");
                          setShowBroadcastSuccessPopup(true);
                          setBroadcastTitle("");
                          setBroadcastMessage("");
                          setBroadcastLink("");
                          setTimeout(() => setShowBroadcastSuccessPopup(false), 5000);
                        } else {
                          setError(res.message || "Failed to broadcast");
                        }
                      } else {
                        const res = await sendNotificationToUser({
                          userId: Number(broadcastTargetUserId),
                          title: broadcastTitle.trim(),
                          message: broadcastMessage.trim(),
                          link: broadcastLink.trim() || null,
                          type: "new_feature",
                        });
                        if (res.success) {
                          setBroadcastSuccessMessage(`Notification sent to ${res.username || "user"}.`);
                          setShowBroadcastSuccessPopup(true);
                          setBroadcastTitle("");
                          setBroadcastMessage("");
                          setBroadcastLink("");
                          setBroadcastTargetUserId("");
                          setTimeout(() => setShowBroadcastSuccessPopup(false), 5000);
                        } else {
                          setError(res.message || "Failed to send notification");
                        }
                      }
                    } catch (err) {
                      setError(err.message || "Failed to send notification");
                    } finally {
                      setBroadcasting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Send to</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="broadcastTarget"
                          value="all"
                          checked={broadcastTarget === "all"}
                          onChange={() => { setBroadcastTarget("all"); setBroadcastTargetUserId(""); }}
                          className="w-4 h-4 text-amber-500 border-slate-600 bg-slate-800 focus:ring-amber-500/50"
                        />
                        <span className="text-slate-200">All users</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="broadcastTarget"
                          value="user"
                          checked={broadcastTarget === "user"}
                          onChange={() => setBroadcastTarget("user")}
                          className="w-4 h-4 text-amber-500 border-slate-600 bg-slate-800 focus:ring-amber-500/50"
                        />
                        <span className="text-slate-200">Specific user</span>
                      </label>
                    </div>
                  </div>
                  {broadcastTarget === "user" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Select user</label>
                      <select
                        value={broadcastTargetUserId}
                        onChange={(e) => setBroadcastTargetUserId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                        required={broadcastTarget === "user"}
                      >
                        <option value="">Choose a user...</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username || u.email || `User #${u.id}`} {u.email ? `(${u.email})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. A new feature is live!"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                    <textarea
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="e.g. Try the Glasses Virtual Try-On now."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Link (optional)</label>
                    <input
                      type="text"
                      value={broadcastLink}
                      onChange={(e) => setBroadcastLink(e.target.value)}
                      placeholder="e.g. /makeup-virtual-try"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {broadcasting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : broadcastTarget === "user" ? (
                      <>
                        <Megaphone size={18} />
                        Send
                      </>
                    ) : (
                      <>
                        <Megaphone size={18} />
                        Send to all users
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
            {/* MANUAL PAYMENTS TAB */}
          {activeTab === 'manual-payments' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Shield size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <span>Manual Payments</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 ml-11 sm:ml-14">Verify and approve crypto transfers</p>
                </div>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 text-slate-900 hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md shadow-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/40 flex items-center gap-2 text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {manualPayments.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700">
                    <Shield size={32} className="text-slate-500 sm:w-10 sm:h-10" />
                  </div>
                  <p className="text-slate-200 font-semibold text-base sm:text-lg">No pending payments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-800/50 to-slate-800/30">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Plan</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">TxID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                      {manualPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition-all">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-200">{p.username || p.email}</div>
                            <div className="text-xs text-slate-500">ID: {p.user_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold capitalize">{p.plan_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-300">{p.tx_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              p.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                              p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded border border-emerald-500/30 font-bold text-xs transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(p.id)}
                                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30 font-bold text-xs transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PASSWORD RESET TAB */}
          {activeTab === 'passwords' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/5 via-transparent to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-yellow-500/5 via-transparent to-transparent rounded-tr-full pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/60">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 ring-2 ring-amber-500/20">
                      <ShieldCheck size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">Password Manager</span>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Securely reset user credentials</p>
                    </div>
                  </h2>
                </div>

                {/* Search bar */}
                <div className="w-full sm:w-72 relative group">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={passwordSearchQuery}
                    onChange={(e) => setPasswordSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-sm focus:outline-none transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* User cards */}
              {(() => {
                const filteredUsers = users.filter(u => u.role !== 'admin' && (
                  !passwordSearchQuery ||
                  (u.username && u.username.toLowerCase().includes(passwordSearchQuery.toLowerCase())) ||
                  (u.email && u.email.toLowerCase().includes(passwordSearchQuery.toLowerCase())) ||
                  (u.full_name && u.full_name.toLowerCase().includes(passwordSearchQuery.toLowerCase()))
                ));
                return filteredUsers.length === 0 ? (
                  <div className="text-center py-16 relative">
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700/50">
                      <Search size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-300 font-semibold text-lg">No users found</p>
                    <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="relative space-y-3">
                    {/* Stats bar */}
                    <div className="flex items-center gap-4 mb-6 px-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Users size={14} className="text-amber-400" />
                        <span><span className="font-bold text-slate-200">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? 's' : ''} shown</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-slate-800 via-amber-900/20 to-slate-800" />
                    </div>

                    {filteredUsers.map((u, index) => (
                      <div
                        key={u.id}
                        className="group relative bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-700/40 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          {/* User info */}
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              {u.profile_picture ? (
                                <img
                                  src={u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:5000/${u.profile_picture.replace(/^src\//, '')}`}
                                  alt={u.username}
                                  className="w-11 h-11 rounded-xl object-cover border-2 border-slate-700/50 shadow-md ring-2 ring-amber-500/10 group-hover:ring-amber-500/30 transition-all"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/80 to-orange-600/80 flex items-center justify-center shadow-md border-2 border-slate-700/50 ${u.profile_picture ? 'hidden' : 'flex'}`}>
                                <span className="text-white text-sm font-bold">
                                  {u.username?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-800" />
                            </div>

                            {/* Name & email */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-100 truncate">{u.username || u.full_name || 'No Username'}</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md">ID:{u.id}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Mail size={11} className="text-slate-500 flex-shrink-0" />
                                <p className="text-xs text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Password input + action */}
                          <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-56">
                              <input
                                type={showPasswordFields[u.id] ? "text" : "password"}
                                value={passwordsDict[u.id] || ""}
                                onChange={(e) => setPasswordsDict({ ...passwordsDict, [u.id]: e.target.value })}
                                placeholder="New password..."
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 text-slate-200 text-sm focus:outline-none transition-all placeholder-slate-600"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswordFields({ ...showPasswordFields, [u.id]: !showPasswordFields[u.id] })}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                                title={showPasswordFields[u.id] ? 'Hide password' : 'Show password'}
                              >
                                {showPasswordFields[u.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleDirectPasswordReset(u.id, u.username || u.email)}
                              disabled={updatingPassword || !(passwordsDict[u.id] && passwordsDict[u.id].trim().length >= 6)}
                              className="relative px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 hover:from-amber-400 hover:to-amber-400 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 whitespace-nowrap overflow-hidden group/btn"
                            >
                              <Key size={14} className="relative z-10" />
                              <span className="relative z-10">Reset Password</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                            </button>
                          </div>
                        </div>

                        {/* Password strength indicator */}
                        {passwordsDict[u.id] && (
                          <div className="mt-3 pt-3 border-t border-slate-700/30">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1 flex-1">
                                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordsDict[u.id].length >= 1 ? (passwordsDict[u.id].length >= 10 ? 'bg-emerald-500' : passwordsDict[u.id].length >= 6 ? 'bg-amber-500' : 'bg-red-500') : 'bg-slate-800'}`} />
                                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordsDict[u.id].length >= 6 ? (passwordsDict[u.id].length >= 10 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-800'}`} />
                                <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordsDict[u.id].length >= 10 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                passwordsDict[u.id].length >= 10 ? 'text-emerald-400' : passwordsDict[u.id].length >= 6 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {passwordsDict[u.id].length >= 10 ? 'Strong' : passwordsDict[u.id].length >= 6 ? 'Good' : 'Weak'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      </div>

      {/* Broadcast success popup */}
      {showBroadcastSuccessPopup && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl bg-emerald-500/95 text-white font-semibold shadow-2xl border border-emerald-400/50 flex items-center gap-3 animate-slideDown"
          role="alert"
        >
          <CheckCircle size={24} className="shrink-0" />
          <span>{broadcastSuccessMessage || "Notification sent."}</span>
        </div>
      )}

      {/* Bulk Gift Credits Modal */}
      {showBulkGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-slideDown animate-delay-75">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                <Gift className="text-amber-400" size={24} />
                <span>Gift Credits to All Users</span>
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                This will add the specified number of credits to all registered regular users. Each user will receive a transaction entry and notification.
              </p>

              <form onSubmit={handleBulkGiftCredits} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Credit Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bulkGiftAmount}
                    onChange={(e) => setBulkGiftAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-200 focus:outline-none font-semibold"
                    placeholder="Enter amount (e.g. 10)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Description / Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkGiftDescription}
                    onChange={(e) => setBulkGiftDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-200 focus:outline-none text-sm"
                    placeholder="e.g. Weekly bonus, system maintenance refund"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkGiftModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkGifting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl shadow-md shadow-amber-500/30 hover:shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bulkGifting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Gifting...</span>
                      </>
                    ) : (
                      <>
                        <Gift size={16} />
                        <span>Send Credits</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Individual User Credits Modal */}
      {showUserGiftModal && selectedUserForCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-slideDown animate-delay-75">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-bl-full pointer-events-none"></div>
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
                <Coins className="text-sky-400" size={24} />
                <span>Update User Credits</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Updating credits for <span className="font-bold text-slate-200">{selectedUserForCredits.username || selectedUserForCredits.email}</span>. Current credits: <span className="font-bold text-sky-400">{selectedUserForCredits.credits ?? 0}</span>
              </p>

              <form onSubmit={handleUpdateUserCreditsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Action Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserGiftAction("add")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        userGiftAction === "add"
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                          : "bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      Add (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserGiftAction("subtract")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        userGiftAction === "subtract"
                          ? "bg-red-500/20 text-red-300 border-red-500/50"
                          : "bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      Deduct (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserGiftAction("set")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        userGiftAction === "set"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      Set Exact (=)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Credit Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={userGiftAmount}
                    onChange={(e) => setUserGiftAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-slate-200 focus:outline-none font-semibold"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Description / Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={userGiftDescription}
                    onChange={(e) => setUserGiftDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-slate-200 focus:outline-none text-sm"
                    placeholder="e.g. Manual correction by Admin"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserGiftModal(false);
                      setSelectedUserForCredits(null);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={userGifting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-sky-500/30 hover:shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {userGifting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Coins size={16} />
                        <span>Update Credits</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Individual User Password Modal */}
      {showPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden animate-slideDown animate-delay-75">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
            <div className="relative">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-1">
                <Key className="text-amber-400" size={24} />
                <span>Change User Password</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Setting new password for <span className="font-bold text-slate-200">{selectedUserForPassword.username || selectedUserForPassword.email}</span>.
              </p>

              <form onSubmit={handleUpdateUserPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="text"
                    required
                    minLength="6"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-200 focus:outline-none font-semibold text-sm"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedUserForPassword(null);
                      setNewUserPassword("");
                    }}
                    className="flex-1 px-4 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl shadow-md shadow-amber-500/30 hover:shadow-lg transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updatingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Key size={16} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
