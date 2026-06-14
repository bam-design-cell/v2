import React from "react";
import { Project } from "../types";
import { CheckCircle, Clock, AlertTriangle, Briefcase, FileCheck, Layers, ExternalLink, FolderOpen } from "lucide-react";
import OfficeChart from "./OfficeChart";
import DavaoMapSummary from "./DavaoMapSummary";

interface DashboardProps {
  projects: Project[];
  role?: string;
  yearFilter?: string;
  setYearFilter?: (value: string) => void;
  quarterFilter?: string;
  setQuarterFilter?: (value: string) => void;
}

export default function Dashboard({ 
  projects, 
  role,
  yearFilter, 
  setYearFilter, 
  quarterFilter, 
  setQuarterFilter 
}: DashboardProps) {
  const total = projects.length;
  const completed = projects.filter((p) => p.projectStatus === "Completed").length;
  const inProgress = projects.filter((p) => p.projectStatus === "In Progress").length;
  const pending = projects.filter((p) => p.projectStatus === "Pending").length;
  const onHold = projects.filter((p) => p.projectStatus === "On Hold").length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Let's count delayed projects: Not completed, and days elapsed > 30 days
  const delayedProjects = projects.filter(
    (p) => p.projectStatus !== "Completed" && p.daysElapsed > 30
  );
  
  const totalDelayedCount = delayedProjects.length;

  // Average days elapsed for non-completed projects
  const activeProjects = projects.filter((p) => p.projectStatus !== "Completed");
  const avgDaysActive = activeProjects.length > 0
    ? Math.round(activeProjects.reduce((sum, p) => sum + p.daysElapsed, 0) / activeProjects.length)
    : 0;

  // Documents completion percentage
  const docsCompletedCount = projects.filter((p) => p.completedDocuments === "Yes").length;
  const docsCompletedRate = total > 0 ? Math.round((docsCompletedCount / total) * 100) : 0;

  const statsKey = `${yearFilter || "All"}-${quarterFilter || "All"}-${total}`;

  return (
    <div className="space-y-8" id="dashboard-section">
      {/* Dashboard Filter Hub */}
      {setYearFilter && setQuarterFilter && (
        <div className="bg-[#0a0a0c] p-5 rounded-2xl border border-white/5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10">
              <Layers size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider leading-none">Dashboard Filters</h4>
              <span className="text-[10px] text-slate-500 font-mono">Segment telemetry by calendar timelines</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Year Selector */}
            <div className="flex-1 sm:flex-initial">
              <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black block mb-1">Calendar Year</label>
              <select
                value={yearFilter || "All"}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-[#121214] border border-[#222225] hover:border-white/10 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer transition-colors"
              >
                <option value="All">All Years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            {/* Quarter Selector */}
            <div className="flex-1 sm:flex-initial">
              <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest font-black block mb-1">Fiscal Quarter</label>
              <select
                value={quarterFilter || "All"}
                onChange={(e) => setQuarterFilter(e.target.value)}
                className="w-full bg-[#121214] border border-[#222225] hover:border-white/10 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer transition-colors"
              >
                <option value="All">All Quarters</option>
                <option value="1st Quarter">1st Quarter</option>
                <option value="2nd Quarter">2nd Quarter</option>
                <option value="3rd Quarter">3rd Quarter</option>
                <option value="4th Quarter">4th Quarter</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects Card */}
        <div key={`${statsKey}-total`} className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between animate-fade-in-card delay-75" id="kpi-total-projects">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Total Registry</span>
            <span className="text-3xl font-extrabold text-white mt-1.5 block tracking-tight">{total}</span>
            <span className="text-[11px] text-slate-400 mt-2 block">
              <strong className="text-indigo-400 font-semibold">{inProgress}</strong> in layout phase
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-indigo-400 rounded-xl">
            <Briefcase size={20} />
          </div>
        </div>

        {/* Completion Rate Card */}
        <div key={`${statsKey}-rate`} className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between animate-fade-in-card delay-150" id="kpi-completion-rate">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Acceptance Rate</span>
            <span className="text-3xl font-extrabold text-white mt-1.5 block tracking-tight">{completionRate}%</span>
            {/* Elegant mini bar */}
            <div className="w-28 bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-indigo-400 rounded-xl">
            <CheckCircle size={20} />
          </div>
        </div>

        {/* Delay Tracker Card */}
        <div key={`${statsKey}-delay`} className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between animate-fade-in-card delay-225" id="kpi-delay-tracker">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Lag Warn &gt; 30 Days</span>
            <span className="text-3xl font-extrabold text-white mt-1.5 block tracking-tight">{totalDelayedCount}</span>
            <span className="text-[11px] text-slate-400 mt-2 block">
              <strong className={totalDelayedCount > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400 font-semibold'}>
                {totalDelayedCount} files
              </strong> delayed limit
            </span>
          </div>
          <div className={`p-3 border rounded-xl ${totalDelayedCount > 0 ? 'bg-amber-950/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/5 text-slate-400'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Avg Cycles Card */}
        <div key={`${statsKey}-avg`} className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center justify-between animate-fade-in-card delay-300" id="kpi-avg-days">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Avg Portfolio Age</span>
            <span className="text-3xl font-extrabold text-white mt-1.5 block tracking-tight">
              {avgDaysActive} <span className="text-xs font-normal text-slate-400">days</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Outstanding delivery time
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-indigo-400 rounded-xl">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Visual Regional Load Chart */}
      <div id="office-load-analytical-section">
        <OfficeChart projects={projects} />
      </div>

      {/* Interactive Davao Region Map Cluster Analysis */}
      <div id="davao-regional-map-analysis">
        <DavaoMapSummary projects={projects} />
      </div>

      {/* Visual Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Breakdown Slider/List */}
        <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl lg:col-span-1 flex flex-col justify-between" id="stat-status-breakdown">
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Layers size={14} className="text-slate-400" />
              Status Allocation
            </h4>
            <div className="space-y-5">
              
              {/* Completed */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                    Completed
                  </span>
                  <span className="font-mono">{completed} ({total > 0 ? Math.round((completed/total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#141416] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${total > 0 ? (completed/total)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-500 inline-block shadow-[0_0_5px_rgba(14,165,233,0.8)]"></span>
                    In Progress
                  </span>
                  <span className="font-mono">{inProgress} ({total > 0 ? Math.round((inProgress/total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#141416] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${total > 0 ? (inProgress/total)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>
                    Pending PL Brief
                  </span>
                  <span className="font-mono">{pending} ({total > 0 ? Math.round((pending/total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#141416] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${total > 0 ? (pending/total)*100 : 0}%` }}></div>
                </div>
              </div>

              {/* On Hold */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
                    On Hold
                  </span>
                  <span className="font-mono">{onHold} ({total > 0 ? Math.round((onHold/total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-[#141416] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: `${total > 0 ? (onHold/total)*100 : 0}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>DB_TYPE: LOCAL_SIMULATOR</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SYNC_OK
            </span>
          </div>
        </div>

        {/* Delay Tracker List */}
        <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl lg:col-span-2 flex flex-col justify-between" id="stat-delay-tracker-list">
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-6 flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="text-amber-500" size={14} />
              Service Delivery Efficiency Warnings
            </h4>
            
            {delayedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <CheckCircle className="text-indigo-400 mb-2.5" size={28} />
                <p className="text-sm font-semibold text-slate-200">All packages are active or resolved</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">There are no project design briefs active above the 30-day DOST DAVAO milestone timeline.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {delayedProjects.map((proj) => (
                  <div key={proj.projectId} className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl border border-white/[0.04] transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300">{proj.projectId}</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">{proj.projectStatus}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate mt-1.5">{proj.companyName}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{proj.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-400">{proj.daysElapsed} days</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">ELAPSED_TIME</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 mt-6">
            <span className="flex items-center gap-1.5">
              <FileCheck size={13} className="text-indigo-400" />
              Document Compliance: <strong className="text-slate-300 font-semibold">{docsCompletedRate}% Verified Complete</strong>
            </span>
            <span className="font-mono bg-white/5 text-slate-400 px-2.5 py-0.5 rounded border border-white/5">
              LIMIT: 30 DAYS
            </span>
          </div>
        </div>

      </div>

      {role === "C/PSTO" && (
        <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl space-y-6" id="dashboard-deliverables-table">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <FileCheck className="text-indigo-400" size={16} />
                Deliverables &amp; Design Artifacts Directory
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Your profile is restricted to checking project validation states, signing off Acceptance Sheets, or downloading published Final Designs.
              </p>
            </div>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-3 py-1 rounded-full font-mono uppercase tracking-widest shrink-0">
              C/PSTO VIEW-ONLY ACCESS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 px-3">Project Brief ID</th>
                  <th className="pb-3 px-3">Company / Product</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Acceptance Sheet Action</th>
                  <th className="pb-3 px-3 text-right">Final Design Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-305">
                {projects.map((project) => (
                  <tr key={project.projectId} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-3 font-mono text-indigo-300 font-bold align-middle">
                      {project.projectId}
                    </td>
                    <td className="py-4 px-3 align-middle">
                      <p className="font-bold text-white leading-normal">{project.companyName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{project.product}</p>
                    </td>
                    <td className="py-4 px-3 text-center align-middle">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                        project.projectStatus === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}>
                        {project.projectStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right align-middle">
                      <a
                        href={project.acceptanceLink || `https://docs.google.com/spreadsheets/d/mock_acceptance_${project.projectId}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider font-bold border transition-colors ${
                          project.acceptanceLink
                            ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/25 shadow-inner"
                            : "bg-[#141416] hover:bg-emerald-600/10 text-slate-500 hover:text-emerald-400 border-white/5"
                        }`}
                        title={project.acceptanceLink ? "View official Acceptance Sheet" : "Default sheet (Mock)"}
                      >
                        <ExternalLink size={10} />
                        Acceptance Sheet
                      </a>
                    </td>
                    <td className="py-4 px-3 text-right align-middle">
                      <a
                        href={project.finalDesignLink || `https://drive.google.com/drive/folders/mock_final_designs_${project.projectId}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider font-bold border transition-colors ${
                          project.finalDesignLink
                            ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/25 shadow-inner"
                            : "bg-[#141416] hover:bg-amber-600/10 text-slate-500 hover:text-amber-350 border-white/5"
                        }`}
                        title={project.finalDesignLink ? "View official Final Designs" : "Default Folder (Mock)"}
                      >
                        <FolderOpen size={10} />
                        Final Designs
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
