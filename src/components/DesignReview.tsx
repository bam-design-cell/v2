import React from "react";
import { Project, User, ProjectComment, ProjectCommentReply } from "../types";
import { 
  Layers, 
  FolderOpen, 
  ExternalLink, 
  BellRing, 
  CheckCircle2, 
  Search,
  Clock,
  MessageSquare,
  Send,
  CornerDownRight,
  Trash2,
  History
} from "lucide-react";

interface DesignReviewProps {
  projects: Project[];
  currentUser?: User;
  onUpdateProject?: (project: Project) => void;
}

export default function DesignReview({ projects, currentUser, onUpdateProject }: DesignReviewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  // Interaction States
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});
  const [replyInput, setReplyInput] = React.useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = React.useState<Record<string, "thread" | "logs">>({});

  const filtered = projects.filter((p) => {
    const matchesSearch = 
      p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || p.projectStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNotifySupervisor = (p: Project) => {
    alert(`Notification sent to Supervisor regarding the Design Review Status of ${p.projectId}`);
    
    // Simulate interactive screen alert/toast
    if (typeof window !== "undefined") {
      const customToast = document.createElement("div");
      customToast.className = "fixed bottom-5 right-5 bg-[#0a0a0c] border-l-4 border-emerald-500 p-4 rounded-xl shadow-2xl z-[9999] text-white flex flex-col gap-1 max-w-sm border border-white/5 animate-slide-in";
      customToast.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-xs font-black uppercase tracking-widest text-emerald-400">Supervisor Dispatch</span>
          <button class="text-slate-500 hover:text-white font-bold" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
        <p class="text-[11px] text-slate-350 leading-normal mt-1">Review ledger transmission complete. Notification dispatched to DOST Supervisor regarding draft progress of project <strong>${p.projectId}</strong> (${p.companyName}).</p>
      `;
      document.body.appendChild(customToast);
      setTimeout(() => customToast.remove(), 6000);
    }
  };

  const handleAddComment = (projectId: string, content: string) => {
    if (!content.trim() || !currentUser || !onUpdateProject) return;

    const proj = projects.find((p) => p.projectId === projectId);
    if (!proj) return;

    const newComment: ProjectComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      authorEmail: currentUser.email,
      authorRole: currentUser.role,
      content: content.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      replies: [],
    };

    const updatedComments = [...(proj.comments || []), newComment];
    onUpdateProject({
      ...proj,
      comments: updatedComments,
    });
  };

  const handleAddReply = (projectId: string, commentId: string, content: string) => {
    if (!content.trim() || !currentUser || !onUpdateProject) return;

    const proj = projects.find((p) => p.projectId === projectId);
    if (!proj) return;

    const newReply: ProjectCommentReply = {
      id: `reply-${Date.now()}-${Math.random()}`,
      authorEmail: currentUser.email,
      authorRole: currentUser.role,
      content: content.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedComments = (proj.comments || []).map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply],
        };
      }
      return c;
    });

    onUpdateProject({
      ...proj,
      comments: updatedComments,
    });
  };

  return (
    <div className="space-y-6" id="design-review-dashboard">
      
      {/* Title Panel */}
      <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" />
            Design Development &amp; Review Panel
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            Track package layouts, submit technical revisions, and notify division supervisors
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-black">Design Review Sync</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-[#0a0a0c] p-4 rounded-xl border border-white/5">
        <div className="relative w-full md:max-w-xs shrink-0">
          <input
            type="text"
            placeholder="Search active review items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121214] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-250 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121214] border border-white/5 text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="All">All Stages</option>
            <option value="Pending">Pending PL Brief</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid of Design reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-[#0a0a0c] border border-white/5 p-12 rounded-2xl text-center text-slate-500">
            <Clock className="mx-auto text-slate-600 mb-2.5" size={28} />
            <h4 className="font-bold text-slate-300 uppercase text-xs tracking-wider">No Items Found</h4>
            <p className="text-[11px] text-slate-500 mt-1">There are no design developmental briefs match your current filter selection.</p>
          </div>
        ) : (
          filtered.map((project) => {
            let statusColor = "border-slate-500/20 text-slate-400 bg-slate-500/5";
            if (project.projectStatus === "Completed") statusColor = "border-emerald-500/20 text-emerald-400 bg-emerald-500/5";
            if (project.projectStatus === "In Progress") statusColor = "border-sky-500/20 text-sky-400 bg-sky-500/5";
            if (project.projectStatus === "Pending") statusColor = "border-amber-500/20 text-amber-400 bg-amber-500/5";
            if (project.projectStatus === "On Hold") statusColor = "border-rose-500/20 text-rose-400 bg-rose-500/5";

            const commentsCount = project.comments?.length || 0;

            return (
              <div 
                key={project.projectId} 
                className="bg-[#0a0a0c] rounded-3xl border border-white/5 p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-all shadow-xl group hover:-translate-y-0.5 duration-300 relative overflow-hidden"
              >
                {/* Visual Status Strip */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 group-hover:bg-indigo-500/30 transition-colors" />

                <div className="space-y-4">
                  {/* Top identifier */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-xs font-black text-indigo-300 uppercase tracking-wide">
                        {project.projectId}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                        {project.year} • {project.quarter}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${statusColor}`}>
                      {project.projectStatus}
                    </span>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-150 line-clamp-1 group-hover:text-white transition-colors">
                      {project.companyName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {project.product}
                    </p>
                    <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[9px] bg-white/5 border border-white/5 text-slate-400 font-mono leading-none">
                      {project.cityProvincialOffice}
                    </span>
                  </div>

                  {/* Status checklist progress indicator */}
                  <div className="space-y-2 pt-3 border-t border-white/[0.04]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono block">Review Checklist</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className={project.release1stDraft ? "text-indigo-400" : "text-slate-700"} />
                        <span>Part A Completed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className={project.release2ndDraft ? "text-indigo-400" : "text-slate-700"} />
                        <span>Part B Uploaded</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className={project.releaseFinalDesign ? "text-indigo-400" : "text-slate-700"} />
                        <span>Final Approved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={11} className={project.signedAcceptance === "Yes" ? "text-indigo-400" : "text-slate-700"} />
                        <span>Sign-off Handed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File links and buttons */}
                <div className="pt-5 mt-5 border-t border-white/[0.04] space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono block">Review Folders &amp; Delivery Links</span>
                  <div className="flex flex-col gap-2">
                    {project.partALink && (
                      <a 
                        href={project.partALink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-lg border transition-colors flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase text-center tracking-wide bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30 shadow-inner"
                        title="Open customized Part A Drive Folder"
                      >
                        <FolderOpen size={11} />
                        Part A Folder
                      </a>
                    )}

                    {project.partBLink && (
                      <a 
                        href={project.partBLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-lg border transition-colors flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase text-center tracking-wide bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30 shadow-inner"
                        title="Open customized Part B Drive Folder"
                      >
                        <FolderOpen size={11} />
                        Part B Folder
                      </a>
                    )}
                    
                    {project.acceptanceLink && (
                      <a 
                        href={project.acceptanceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-lg border transition-colors flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase text-center tracking-wide bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30 shadow-inner"
                        title="Open customized Acceptance Sign-off Link"
                      >
                        <ExternalLink size={11} />
                        Acceptance Sheet
                      </a>
                    )}

                    {project.finalDesignLink && (
                      <a 
                        href={project.finalDesignLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-lg border transition-colors flex items-center justify-center gap-1.5 font-bold text-[10px] uppercase text-center tracking-wide bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30 shadow-inner"
                        title="Open customized Final Designs Folder"
                      >
                        <FolderOpen size={11} />
                        Final Designs
                      </a>
                    )}

                    {!project.partALink && !project.partBLink && !project.acceptanceLink && !project.finalDesignLink && (
                      <div className="py-3 px-4 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
                        No directories or sheets linked
                      </div>
                    )}
                  </div>

                  {/* Comments Toggle & Notify row */}
                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => setExpandedComments(prev => ({ ...prev, [project.projectId]: !prev[project.projectId] }))}
                      className={`flex-1 py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                        expandedComments[project.projectId]
                          ? "bg-violet-650 text-white bg-violet-600 border-violet-500 shadow-violet-600/20"
                          : "bg-violet-500/10 hover:bg-violet-600/20 text-violet-400 border-violet-500/20 hover:border-violet-500/40 shadow-violet-600/5 animate-pulse"
                      }`}
                    >
                      <MessageSquare size={12} />
                      Thread ({commentsCount})
                    </button>

                    <button
                      onClick={() => handleNotifySupervisor(project)}
                      className="flex-1 py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest bg-[#141416] hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl border border-white/5 hover:border-indigo-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <BellRing size={12} />
                      Dispatch Alert
                    </button>
                  </div>

                  {/* Collapsible Comment Thread section */}
                  {expandedComments[project.projectId] && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in text-left">
                      {/* Dual panel Sub-navigation menu */}
                      <div className="flex border-b border-white/5 pb-2.5 gap-4">
                        <button 
                          onClick={() => setActiveSubTab(prev => ({ ...prev, [project.projectId]: "thread" }))}
                          className={`pb-1 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                            (activeSubTab[project.projectId] || "thread") === "thread" 
                              ? "border-indigo-500 text-indigo-400 font-bold" 
                              : "border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <MessageSquare size={11} />
                          Review Thread ({commentsCount})
                        </button>
                        <button 
                          onClick={() => setActiveSubTab(prev => ({ ...prev, [project.projectId]: "logs" }))}
                          className={`pb-1 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                            activeSubTab[project.projectId] === "logs" 
                              ? "border-emerald-500 text-emerald-400 font-bold" 
                              : "border-transparent text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <History size={11} className={activeSubTab[project.projectId] === "logs" ? "text-emerald-400" : "text-slate-500"} />
                          Activity Logs ({(project.activityLogs || []).length})
                        </button>
                      </div>

                      {(activeSubTab[project.projectId] || "thread") === "thread" ? (
                        <>
                          <div className="flex justify-between items-center bg-[#111113] px-3 py-1.5 rounded-lg border border-white/[0.02]">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">
                              Developmental Log Thread
                            </span>
                            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {currentUser?.role || "GUEST"}
                            </span>
                          </div>

                          {/* Comments list */}
                          <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                            {(!project.comments || project.comments.length === 0) ? (
                              <div className="py-8 text-center text-slate-600 text-[10px] font-mono uppercase tracking-widest font-bold">
                                No log notes posted yet
                              </div>
                            ) : (
                              project.comments.map((comment) => (
                                <div key={comment.id} className="space-y-2 bg-[#09090b] p-3 rounded-2xl border border-white/[0.03] group/cmt relative">
                                  <div className="flex items-start justify-between text-[10px]">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-200 block truncate max-w-[170px]" title={comment.authorEmail}>
                                        {comment.authorEmail}
                                      </span>
                                      <span className="text-[8px] uppercase font-black text-indigo-400 tracking-widest">
                                        {comment.authorRole}
                                      </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-500">
                                      {comment.timestamp}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-300 leading-normal whitespace-pre-wrap mt-1">
                                    {comment.content}
                                  </p>

                                  {/* Nested replies */}
                                  {comment.replies && comment.replies.map((rep) => (
                                    <div key={rep.id} className="ml-3.5 mt-2.5 p-2.5 bg-white/[0.02] border-l border-indigo-500/35 rounded-r-xl flex gap-2 items-start">
                                      <CornerDownRight size={10} className="text-indigo-400 shrink-0 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-[8px] text-slate-500 leading-none">
                                          <span className="font-bold text-slate-300">{rep.authorEmail} ({rep.authorRole})</span>
                                          <span className="font-mono">{rep.timestamp}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                                          {rep.content}
                                        </p>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Comment footer actions */}
                                  <div className="flex justify-between items-center pt-1 mt-2.5">
                                    <button
                                      onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                      className="text-[9px] font-extrabold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest cursor-pointer flex items-center gap-1 transition-colors"
                                    >
                                      Reply
                                    </button>
                                    {comment.authorEmail === currentUser?.email && (
                                      <button
                                        onClick={() => {
                                          const updatedC = project.comments?.filter(c => c.id !== comment.id) || [];
                                          onUpdateProject?.({ ...project, comments: updatedC });
                                        }}
                                        className="text-[9px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest cursor-pointer opacity-0 group-hover/cmt:opacity-100 transition-opacity"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>

                                  {/* Form to submit reply */}
                                  {activeReplyId === comment.id && (
                                    <div className="mt-2.5 flex gap-2 items-center">
                                      <input
                                        type="text"
                                        placeholder="Type nested reply..."
                                        value={replyInput[comment.id] || ""}
                                        onChange={(e) => setReplyInput(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleAddReply(project.projectId, comment.id, replyInput[comment.id] || "");
                                            setReplyInput(prev => ({ ...prev, [comment.id]: "" }));
                                            setActiveReplyId(null);
                                          }
                                        }}
                                        className="flex-1 bg-[#121214] border border-white/5 rounded-xl py-1.5 px-3 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                      />
                                      <button
                                        onClick={() => {
                                          handleAddReply(project.projectId, comment.id, replyInput[comment.id] || "");
                                          setReplyInput(prev => ({ ...prev, [comment.id]: "" }));
                                          setActiveReplyId(null);
                                        }}
                                        className="p-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider cursor-pointer"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>

                          {/* Post Comment Input */}
                          <div className="flex gap-2 items-center pt-2.5 border-t border-white/5">
                            <input
                              type="text"
                              placeholder="Type communication message..."
                              value={commentInput[project.projectId] || ""}
                              onChange={(e) => setCommentInput(prev => ({ ...prev, [project.projectId]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddComment(project.projectId, commentInput[project.projectId] || "");
                                  setCommentInput(prev => ({ ...prev, [project.projectId]: "" }));
                                }
                              }}
                              className="flex-1 bg-[#121214] border border-white/5 rounded-xl py-2 px-3.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                            <button
                              onClick={() => {
                                handleAddComment(project.projectId, commentInput[project.projectId] || "");
                                setCommentInput(prev => ({ ...prev, [project.projectId]: "" }));
                              }}
                              className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1 shrink-0 shadow-lg shadow-indigo-600/15"
                            >
                              <Send size={10} />
                              Post
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 pt-1">
                          <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pb-1 border-b border-white/[0.03]">
                            <span>CHRONOLOGICAL AUDIT HISTORY</span>
                            <span>TOTAL: {(project.activityLogs || []).length} RECORDS</span>
                          </div>
                          
                          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                            {(!project.activityLogs || project.activityLogs.length === 0) ? (
                              <div className="py-8 text-center text-slate-600 text-[10px] font-mono uppercase tracking-widest font-bold">
                                No historical activities logged for this project
                              </div>
                            ) : (
                              project.activityLogs.map((log) => {
                                let badgeColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                                let dotColor = "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]";
                                
                                if (log.type === "status_change") {
                                  badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                                  dotColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                                } else if (log.type === "comment") {
                                  badgeColor = "text-violet-400 bg-violet-500/10 border-violet-500/20";
                                  dotColor = "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]";
                                } else if (log.type === "reply") {
                                  badgeColor = "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20";
                                  dotColor = "bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]";
                                } else if (log.type === "link_added") {
                                  badgeColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
                                  dotColor = "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]";
                                } else if (log.type === "checklist_change") {
                                  badgeColor = "text-teal-400 bg-teal-500/10 border-teal-500/20";
                                  dotColor = "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]";
                                } else if (log.type === "system") {
                                  badgeColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";
                                  dotColor = "bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]";
                                }

                                return (
                                  <div key={log.id} className="relative pl-5 pb-3.5 last:pb-0 border-l border-white/5 last:border-transparent ml-1.5 text-left">
                                    {/* Timeline glowing dot */}
                                    <div className={`absolute -left-[3.5px] top-[4px] w-[7px] h-[7px] rounded-full ${dotColor}`} />
                                    
                                    <div className="flex items-center justify-between gap-2.5 text-[9px]">
                                      <span className={`text-[8px] font-black uppercase tracking-wider ${badgeColor} px-1.5 py-0.2 rounded border`}>
                                        {log.type.replace("_", " ")}
                                      </span>
                                      <span className="text-[8px] font-mono text-slate-500 font-bold">
                                        {log.timestamp}
                                      </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed font-medium">
                                      {log.message}
                                    </p>
                                    
                                    <div className="flex items-center gap-1.5 mt-1 text-[8px] text-slate-550 font-mono">
                                      <span className="font-bold text-slate-400 truncate max-w-[190px]" title={log.userEmail}>{log.userEmail}</span>
                                      <span>•</span>
                                      <span className="uppercase text-[7px] bg-white/5 px-1 rounded font-black tracking-widest">{log.userRole}</span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
