import React from "react";
import { ShieldAlert, HelpCircle, Lock, Mail } from "lucide-react";

interface AccessDeniedProps {
  email: string;
  onResetSession: () => void;
}

export default function AccessDenied({ email, onResetSession }: AccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" id="access-denied-panel">
      <div className="p-4 bg-red-950/20 text-red-400 rounded-full border border-red-500/30 mb-6 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
        <ShieldAlert size={40} />
      </div>

      <h1 className="text-xl font-bold text-white uppercase tracking-[0.15em]">Access Denied</h1>
      <p className="text-slate-400 font-medium text-xs max-w-md mt-3 leading-relaxed">
        Your email <strong className="text-indigo-300 font-mono text-[11px] bg-white/5 border border-white/5 px-2 py-0.5 rounded">{email}</strong> is unregistered in the 'Users' authentication registry of our system.
      </p>

      {/* Access explanation */}
      <div className="mt-8 bg-[#0a0a0b] border border-white/5 p-6 rounded-2xl text-left max-w-lg w-full divide-y divide-white/5">
        <div className="pb-4 flex gap-3.5 items-start">
          <Lock className="text-red-400 mt-0.5 shrink-0" size={15} />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Role-Based Access Control</h4>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Our active brief databases are protected by secure role profiles preventing external accounts from reading directories.
            </p>
          </div>
        </div>

        <div className="pt-4 flex gap-3.5 items-start">
          <HelpCircle className="text-slate-400 mt-0.5 shrink-0" size={15} />
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Request Registration</h4>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              If this is your official work credential, please ask the Packaging &amp; Labeling Admin to register your email with either <span className="font-semibold text-slate-300">Admin</span> or <span className="font-semibold text-slate-300">C/PSTO</span> privileges.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onResetSession}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <span>Restore Default Session</span>
          <Mail size={13} />
        </button>
      </div>

    </div>
  );
}
