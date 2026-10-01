import React, { useState, useEffect } from 'react';
import { Coins, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreditsDisplay() {
  const [membership, setMembership] = useState({ credits: 0, is_premium: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${getBackendOrigin()}/api/membership/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembership(data.membership);
      }
    } catch (err) {
      console.error('Error fetching membership:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get backend URL
  function getBackendOrigin() {
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  }

  if (loading) return null;

  return (
    <Link 
      to="/pricing" 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
    >
      {membership.is_premium ? (
        <>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium</span>
        </>
      ) : (
        <>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
            <Coins size={12} className="text-white" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Credits</span>
            <span className="text-xs font-black text-white">{membership.credits}</span>
          </div>
          <Zap size={12} className="text-sky-400 animate-pulse ml-1" />
        </>
      )}
    </Link>
  );
}
