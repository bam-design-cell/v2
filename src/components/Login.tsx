import React, { useState } from "react";
import { User } from "../types";
import { Lock, Mail, Key, ShieldAlert, ArrowRight, FolderHeart, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function Login({ users, onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const inputName = username.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputName || !inputPass) {
      setError("Please fill in both fields.");
      return;
    }

    // Dynamic resolution of username or email to match users in system
    const matchedUser = users.find((user) => {
      const emailLower = user.email.toLowerCase();
      
      // Match 1: Exact email match
      if (emailLower === inputName) return true;
      
      // Match 2: Prefix/alias matches (e.g., "admin", "packaging", "davaodelsur", "davaodeoro" or generic prefixes)
      const prefix = emailLower.split("@")[0];
      if (prefix === inputName) return true;

      // Special alias helpers
      if (inputName === "davaodelsur" && emailLower.includes("davao.del.sur")) return true;
      if (inputName === "davaodeoro" && emailLower.includes("davao.de.oro")) return true;

      return false;
    });

    if (!matchedUser) {
      setError("No entry found matching this account name in authorized database.");
      return;
    }

    // Verify Password (fallback to default "dost123" if user password isn't explicitly defined)
    const expectedPassword = matchedUser.password || "dost123";
    if (expectedPassword !== inputPass) {
      setError("Invalid security credential key (Incorrect password).");
      return;
    }

    // Success
    onLoginSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-8 font-sans select-none relative overflow-hidden">
      {/* Decorative gradient glowing orb in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[20rem] h-[20rem] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-sm z-10 relative">
        <div className="bg-[#0a0a0c] p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <FolderHeart size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-black tracking-[0.15em] text-white uppercase block leading-none">DOST DAVAO</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">P&amp;L Project Management</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">GATEWAY SIGN IN</h2>
            <p className="text-[11px] text-slate-500 mt-1">Provide your verified system account or choice credentials below.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username or Google Email</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or packaging"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold transition-colors cursor-pointer uppercase tracking-widest flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all font-mono"
                />
                <Key className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div id="login-error-alert" className="p-3.5 bg-white border border-red-500/20 text-[11px] text-red-400 rounded-xl flex items-center gap-2 font-medium">
                <ShieldAlert size={14} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 uppercase tracking-wider mt-2 group"
            >
              Enter Gateway Workspace
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
