import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();
  
  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Profile</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-600 mb-4">Welcome to your admin profile.</p>
        {user && (
          <div>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p className="mt-4 text-sm text-sky-600 font-semibold">Additional admin settings will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
