import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { googleLogin, instagramLogin, githubLogin, discordLogin } from "../utils/api";

export default function OAuthButtons({ onSuccess, onError }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  // Google OAuth - SIMPLIFIED redirect flow (like GitHub/Discord)
  const handleGoogleLogin = async () => {
    try {
      setLoading('google');
      setError("");

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!clientId) {
        setError("Google OAuth not configured. Please add VITE_GOOGLE_CLIENT_ID to .env");
        setLoading(null);
        onError && onError("Google OAuth not configured");
        return;
      }

      // Get base backend URL (remove /api if present)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendUrl = apiUrl.replace('/api', '') || 'http://localhost:5000';
      const redirectUri = `${backendUrl}/auth/google/callback`;
      
      // Validate redirect URI
      if (!redirectUri || !redirectUri.startsWith('http')) {
        setError("Invalid backend URL configuration");
        setLoading(null);
        onError && onError("Invalid backend URL");
        return;
      }

      // Google OAuth 2.0 redirect flow
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
      
      // Redirect to Google OAuth (backend will handle callback)
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error('Google OAuth error:', err);
      setError(err.message || "Google OAuth failed. Please try again.");
      setLoading(null);
      onError && onError(err.message || "Google OAuth not available");
    }
  };

  // Instagram OAuth - FREE & EASY
  const handleInstagramLogin = async () => {
    try {
      setLoading('instagram');
      setError("");

      const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '';
      if (!clientId) {
        setError("Instagram OAuth not configured. Please add VITE_INSTAGRAM_CLIENT_ID to .env");
        setLoading(null);
        onError && onError("Instagram OAuth not configured");
        return;
      }

      // Get base backend URL (remove /api if present)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendUrl = apiUrl.replace('/api', '') || 'http://localhost:5000';
      const redirectUri = `${backendUrl}/auth/instagram/callback`;
      
      // Validate redirect URI
      if (!redirectUri || !redirectUri.startsWith('http')) {
        setError("Invalid backend URL configuration");
        setLoading(null);
        onError && onError("Invalid backend URL");
        return;
      }

      // Instagram OAuth 2.0 (Basic Display API)
      const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
      
      // Redirect to Instagram OAuth (backend will handle callback)
      window.location.href = instagramAuthUrl;
    } catch (err) {
      console.error('Instagram OAuth error:', err);
      setError(err.message || "Instagram OAuth failed. Please try again.");
      setLoading(null);
      onError && onError(err.message || "Instagram OAuth not available");
    }
  };

  // GitHub OAuth - FREE & EASY
  const handleGitHubLogin = async () => {
    try {
      setLoading('github');
      setError("");

      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
      if (!clientId) {
        setError("GitHub OAuth not configured. Please add VITE_GITHUB_CLIENT_ID to .env");
        setLoading(null);
        onError && onError("GitHub OAuth not configured");
        return;
      }

      // Get base backend URL (remove /api if present)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendUrl = apiUrl.replace('/api', '') || 'http://localhost:5000';
      const redirectUri = `${backendUrl}/auth/github/callback`;
      
      // Validate redirect URI
      if (!redirectUri || !redirectUri.startsWith('http')) {
        setError("Invalid backend URL configuration");
        setLoading(null);
        onError && onError("Invalid backend URL");
        return;
      }

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
      
      // Redirect to GitHub OAuth (backend will handle callback)
      window.location.href = githubAuthUrl;
    } catch (err) {
      console.error('GitHub OAuth error:', err);
      setError(err.message || "GitHub OAuth failed. Please try again.");
      setLoading(null);
      onError && onError(err.message || "GitHub OAuth not available");
    }
  };

  // Discord OAuth - FREE & EASY
  const handleDiscordLogin = async () => {
    try {
      setLoading('discord');
      setError("");

      const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || '';
      if (!clientId) {
        setError("Discord OAuth not configured. Please add VITE_DISCORD_CLIENT_ID to .env");
        setLoading(null);
        onError && onError("Discord OAuth not configured");
        return;
      }

      // Get base backend URL (remove /api if present)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const backendUrl = apiUrl.replace('/api', '') || 'http://localhost:5000';
      const redirectUri = `${backendUrl}/auth/discord/callback`;
      
      // Validate redirect URI
      if (!redirectUri || !redirectUri.startsWith('http')) {
        setError("Invalid backend URL configuration");
        setLoading(null);
        onError && onError("Invalid backend URL");
        return;
      }

      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
      
      // Redirect to Discord OAuth (backend will handle callback)
      window.location.href = discordAuthUrl;
    } catch (err) {
      console.error('Discord OAuth error:', err);
      setError(err.message || "Discord OAuth failed. Please try again.");
      setLoading(null);
      onError && onError(err.message || "Discord OAuth not available");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-yellow-400 text-xs backdrop-blur-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
      

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading === 'google'}
          className="py-3 rounded-xl border-2 border-slate-700/50 bg-slate-950/50 text-slate-200 font-semibold hover:bg-slate-900/80 hover:border-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
        >
          {loading === 'google' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </>
          )}
        </button>

         {/* GitHub - FREE & EASY */}
        

        {/* Discord - FREE & EASY */}
        <button
          type="button"
          onClick={handleDiscordLogin}
          disabled={loading === 'discord'}
          className="py-3 rounded-xl border-2 border-slate-700/50 bg-slate-950/50 text-slate-200 font-semibold hover:bg-slate-900/80 hover:border-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
        >
          {loading === 'discord' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent"></div>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord</span>
            </>
          )}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700/50"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-slate-900/90 text-slate-500">Or continue with email</span>
        </div>
      </div>
    </div>
  );
}
