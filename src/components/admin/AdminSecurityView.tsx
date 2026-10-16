import React, { useState } from 'react';
import { AdminProfile } from '../../types/portfolio.js';
import { Shield, KeyRound, CheckCircle2, AlertCircle, Loader2, Save, UserCheck } from 'lucide-react';
import { authFetch, safeJsonResponse, extractErrorMessage } from '../../utils/api.js';

interface AdminSecurityViewProps {
  profile: AdminProfile;
  onUpdateProfile: (profile: Partial<AdminProfile>) => Promise<void>;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({ profile, onUpdateProfile }) => {
  const [profileData, setProfileData] = useState<AdminProfile>(profile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      await onUpdateProfile(profileData);
      setProfileFeedback({ type: 'success', message: 'Admin profile updated successfully.' });
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err: any) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPassFeedback({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setChangingPass(true);
    setPassFeedback(null);

    try {
      const res = await authFetch('/api/admin/security/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const parsed = await safeJsonResponse<{ success?: boolean; error?: any; message?: string }>(res);
      if (!parsed.ok || !parsed.data?.success) {
        throw new Error(parsed.error || 'Failed to update password');
      }

      setPassFeedback({ type: 'success', message: 'Password changed successfully! Keep your new password safe.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassFeedback(null), 5000);
    } catch (err: unknown) {
      setPassFeedback({ type: 'error', message: extractErrorMessage(err, 'Password update failed.') });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Admin Profile Form */}
      <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Administrator Account Profile</h3>
            <p className="text-xs text-slate-400">Authenticated administrator identity and contact details</p>
          </div>
        </div>

        {profileFeedback && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              profileFeedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {profileFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{profileFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Admin Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Admin Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-500 font-mono">
            Last authenticated login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Active Session'}
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handlePasswordSubmit} className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Update Master Password</h3>
            <p className="text-xs text-slate-400">
              Ensure you choose a strong password with at least 6 characters.
            </p>
          </div>
        </div>

        {passFeedback && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
              passFeedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {passFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{passFeedback.message}</span>
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">New Password *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Confirm New Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={changingPass}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {changingPass ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
