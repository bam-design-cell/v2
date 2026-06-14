import React, { useState } from "react";
import { User, UserRole } from "../types";
import { Plus, Trash2, ShieldCheck, Mail, ShieldAlert, Info, Key } from "lucide-react";

interface UserManagementProps {
  users: User[];
  onAddUser: (email: string, role: UserRole, password?: string) => void;
  onRemoveUser: (email: string) => void;
  currentUserEmail: string;
}

export default function UserManagement({
  users,
  onAddUser,
  onRemoveUser,
  currentUserEmail,
}: UserManagementProps) {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("C/PSTO");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check if duplicate
    const exists = users.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      setError(`User with email "${trimmedEmail}" already exists.`);
      return;
    }

    const passwordToUse = newPassword.trim() || "dost123";
    onAddUser(trimmedEmail, newRole, passwordToUse);
    setNewEmail("");
    setNewPassword("");
    setSuccess(`Successfully added ${trimmedEmail} with password "${passwordToUse}" as ${newRole}.`);
    
    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  return (
    <div className="bg-[#0a0a0c] p-8 rounded-2xl border border-white/5 shadow-2xl" id="user-management-panel">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck className="text-indigo-400" size={18} />
            User Access Control List
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Maintain the Role-Based Access Control database. Only registered emails can sign in to view project folders or configure design briefs.
          </p>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest font-mono">
          STRICT_RBAC_ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* User Registration Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assign New Authorized Email</h4>
          <form onSubmit={handleSubmit} className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-4">
            
            {/* Input Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Google Email Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. workspace@region11.dost.gov.ph"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-600"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account Password (Defaults to "dost123")</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Password for this account"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-600 font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
              </div>
            </div>

            {/* Select Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security Role Profile</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setNewRole("C/PSTO")}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer block ${
                    newRole === "C/PSTO"
                      ? "bg-[#1d1d21] border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                      : "bg-[#0a0a0c] border-white/5 text-slate-400 hover:bg-white/[0.02]"
                  }`}
                >
                  C/PSTO Role
                  <span className="block text-[9px] font-medium text-slate-500 mt-1">Dashboard &amp; Projects Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("Supervisor")}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer block ${
                    newRole === "Supervisor"
                      ? "bg-[#1d1d21] border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                      : "bg-[#0a0a0c] border-white/5 text-slate-400 hover:bg-white/[0.02]"
                  }`}
                >
                  Supervisor Role
                  <span className="block text-[9px] font-medium text-slate-500 mt-1">Dashboard &amp; Showcase Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("Admin")}
                  className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer block ${
                    newRole === "Admin"
                      ? "bg-[#1d1d21] border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                      : "bg-[#0a0a0c] border-white/5 text-slate-400 hover:bg-white/[0.02]"
                  }`}
                >
                  Admin Role
                  <span className="block text-[9px] font-medium text-slate-500 mt-1">Full override read/write</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <p className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 bg-red-950/10 p-2.5 rounded-lg border border-red-500/20">
                <ShieldAlert size={13} />
                {error}
              </p>
            )}
            {success && (
              <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-500/20">
                <ShieldCheck size={13} />
                {success}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/15 uppercase tracking-wider"
            >
              <Plus size={14} />
              PROVISION_AUTHENTICATION
            </button>
          </form>

          {/* RBAC Info Card */}
          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-[11px] text-amber-300 space-y-1">
            <p className="font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
              <Info size={12} className="text-amber-400" />
              Apps Script Synced Database
            </p>
            <p className="text-slate-400 leading-relaxed">
              In live deployment, user identities are resolved via active Google authentication sessions. Appending emails here registers them instantly into the synced Google Sheets backend 'Users' segment.
            </p>
          </div>
        </div>

        {/* Access Control List */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-4 flex justify-between items-center uppercase tracking-wider">
            <span>Authorized Accounts</span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">{users.length} ATTESTED_CREDENTIALS</span>
          </h4>

          <div className="border border-white/5 bg-[#121214]/30 rounded-2xl overflow-hidden divide-y divide-white/5">
            {users.map((user) => {
              const isSelf = user.email.toLowerCase() === currentUserEmail.toLowerCase();
              return (
                <div key={user.email} className={`flex items-center justify-between p-4 ${isSelf ? "bg-indigo-500/[0.03]" : "bg-[#0c0c0e] hover:bg-white/[0.01]"} transition-colors`}>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                      {user.email}
                      {isSelf && (
                        <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                          SELF
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      CREDENTIAL_MAPPING: {user.role} | PWD: <span className="text-indigo-400 font-bold">{user.password || "dost123"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                      user.role === "Admin"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : user.role === "Supervisor"
                        ? "bg-[#1d143c] text-violet-400 border-violet-500/20"
                        : "bg-white/5 text-slate-350 border-white/5"
                    }`}>
                      {user.role}
                    </span>

                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => onRemoveUser(user.email)}
                      className={`p-1.5 rounded-lg border border-white/5 bg-white/5 transition-all ${
                        isSelf
                          ? "opacity-25 cursor-not-allowed text-slate-600"
                          : "text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 cursor-pointer"
                      }`}
                      title={isSelf ? "You cannot revoke your active sessions" : `REVOKE_ACCESS: ${user.email}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
