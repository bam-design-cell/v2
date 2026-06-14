import React, { useState } from "react";
import { Project, UserRole } from "../types";
import { 
  Calendar, 
  Trash2, 
  Edit2, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  SlidersHorizontal,
  Move,
  Lock,
  Compass,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "motion/react";

interface KanbanBoardProps {
  projects: Project[];
  role: UserRole;
  onSave?: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const COLUMNS = [
  { id: "Pending", title: "Pending", accent: "bg-amber-500", border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/5" },
  { id: "In Progress", title: "In Progress", accent: "bg-sky-500", border: "border-sky-500/20", text: "text-sky-400", bg: "bg-sky-500/5" },
  { id: "On Hold", title: "On Hold", accent: "bg-rose-500", border: "border-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/5" },
  { id: "Completed", title: "Completed", accent: "bg-emerald-500", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/5" }
];

const calculateDueDateInKanban = (receivedDateStr: string): string => {
  if (!receivedDateStr) return "";
  const date = new Date(receivedDateStr);
  if (isNaN(date.getTime())) return "";
  
  let workingDaysAdded = 0;
  const tempDate = new Date(date);
  while (workingDaysAdded < 30) {
    tempDate.setDate(tempDate.getDate() + 1);
    const day = tempDate.getDay();
    if (day !== 0 && day !== 6) {
      workingDaysAdded++;
    }
  }
  return tempDate.toISOString().split("T")[0];
};

const calculateDeviationInKanban = (project: Project): string => {
  if (!project.dateCompletedBriefReceived || !project.release1stDraft) return "-";
  const dueDateStr = calculateDueDateInKanban(project.dateCompletedBriefReceived);
  if (!dueDateStr) return "-";
  
  const start = new Date(project.release1stDraft);
  const end = new Date(dueDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
  
  const isLate = start > end;
  let d1 = new Date(isLate ? end : start);
  const d2 = new Date(isLate ? start : end);
  
  let count = 0;
  while (d1 < d2) {
    d1.setDate(d1.getDate() + 1);
    const day = d1.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  
  if (count === 0) return "0";
  return isLate ? `+${count}` : `-${count}`;
};

export default function KanbanBoard({
  projects,
  role,
  onSave,
  onEdit,
  onDelete
}: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [highlightedCol, setHighlightedCol] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isAdmin = role === "Admin";
  const isSupervisor = role === "Supervisor";
  const isC_PSTO = role === "C/PSTO";

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setHighlightedCol(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    if (!isAdmin) return;
    e.preventDefault();
    setHighlightedCol(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const projectId = e.dataTransfer.getData("text/plain") || draggedId;
    if (!projectId) return;

    const project = projects.find(p => p.projectId === projectId);
    if (project && project.projectStatus !== targetStatus) {
      if (onSave) {
        onSave({
          ...project,
          projectStatus: targetStatus
        });
      }
    }
    
    setDraggedId(null);
    setHighlightedCol(null);
  };

  const handleMoveStatus = (project: Project, targetStatus: string) => {
    if (!isAdmin) return;
    if (onSave) {
      onSave({
        ...project,
        projectStatus: targetStatus
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-1 min-h-[600px]" id="kanban-board-canvas">
      {COLUMNS.map((column) => {
        const columnProjects = projects.filter(p => p.projectStatus === column.id);
        const isOver = highlightedCol === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={() => setHighlightedCol(null)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`rounded-2xl border transition-all duration-200 flex flex-col p-4 ${
              isOver 
                ? "border-indigo-500 bg-[#0e0e12]/80 shadow-[0_0_20px_rgba(79,70,229,0.1)] scale-[1.01]" 
                : `${column.border} bg-[#08080a]/50`
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.accent} shadow-md`} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                  {column.title}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${column.bg} ${column.text}`}>
                {columnProjects.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[700px] pr-1 min-h-[150px]">
              {columnProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl text-slate-600 text-center select-none min-h-[120px]">
                  <Compass size={18} className="mb-1.5 opacity-40 text-slate-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Empty Stage</span>
                  <span className="text-[9px] mt-0.5 max-w-[120px] leading-snug">Drag and release briefs into this column.</span>
                </div>
              ) : (
                columnProjects.map((project) => (
                  <motion.div
                    key={project.projectId}
                    draggable={isAdmin}
                    onDragStart={(e) => handleDragStart(e, project.projectId)}
                    onDragEnd={handleDragEnd}
                    layoutId={`project-card-${project.projectId}`}
                    className={`p-4 rounded-xl border bg-[#0b0b0e] hover:bg-[#101014] transition-all group ${
                      draggedId === project.projectId 
                        ? "opacity-40 border-indigo-550/55" 
                        : "border-white/[0.04] hover:border-white/10 shadow-lg"
                    } ${isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                  >
                    {/* ID & Source Office info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-mono font-black tracking-widest text-[#4f46e5] uppercase">
                        {project.projectId}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-slate-400">
                        {project.cityProvincialOffice || "DOST Region XI"}
                      </span>
                    </div>

                    {/* Company and Product */}
                    <h4 className="text-xs font-black text-slate-150 uppercase tracking-wide group-hover:text-indigo-400 transition-colors line-clamp-1 text-slate-200">
                      {project.companyName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium italic mt-0.5 line-clamp-1">
                      {project.product}
                    </p>

                    {/* Due Date & Deviation Area */}
                    <div className="mt-3.5 pt-3 border-t border-white/5 space-y-1.5 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-slate-500" />
                          <span>Brief Received:</span>
                        </span>
                        <span className="text-slate-300 font-bold">{project.datePlBriefReceived || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-indigo-400" />
                          <span>Due Date:</span>
                        </span>
                        {project.dateCompletedBriefReceived ? (
                          <span className="text-rose-450 font-bold">{calculateDueDateInKanban(project.dateCompletedBriefReceived)}</span>
                        ) : (
                          <span className="text-amber-500 font-bold italic text-[9px]">Pending Completed Brief</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-indigo-400" />
                          <span>Deviation:</span>
                        </span>
                        {(() => {
                          const dev = calculateDeviationInKanban(project);
                          const isLate = dev.startsWith("+");
                          const isEarly = dev.startsWith("-");
                          
                          if (!project.dateCompletedBriefReceived) {
                            return <span className="text-slate-500 italic">Pending Compl. Brief</span>;
                          }
                          
                          return (
                            <span className={isLate ? "text-red-400 font-bold" : isEarly ? "text-emerald-400 font-bold" : "text-slate-200 font-bold"}>
                              {dev === "-" ? "Pending Draft 1" : `${dev} ${isEarly ? "early" : isLate ? "late" : "on time"}`}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Links Embedded - Crucial for Supervisor / reads */}
                    <div className="mt-3 bg-[#07070a]/80 p-2 border border-white/[0.03] rounded-lg space-y-1.5 flex flex-col font-sans">
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-600 block mb-0.5 font-mono">
                        Embedded Design Links
                      </span>
                      
                      <div className="grid grid-cols-2 gap-1 font-mono">
                        <a 
                          href={project.partALink || `https://drive.google.com/drive/folders/mock_design_${project.projectId}_a`}
                          target="_blank" 
                          rel="noreferrer"
                          className={`px-1.5 py-0.5 rounded text-[9px] border text-center transition-all ${
                            project.partALink 
                              ? "bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/20" 
                              : "bg-[#141416]/55 text-slate-600 border-white/5"
                          }`}
                          title="Part A Link"
                        >
                          Part A
                        </a>
                        <a 
                          href={project.partBLink || `https://drive.google.com/drive/folders/mock_design_${project.projectId}_b`}
                          target="_blank" 
                          rel="noreferrer"
                          className={`px-1.5 py-0.5 rounded text-[9px] border text-center transition-all ${
                            project.partBLink 
                              ? "bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/20" 
                              : "bg-[#141416]/55 text-slate-600 border-white/5"
                          }`}
                          title="Part B Link"
                        >
                          Part B
                        </a>
                      </div>

                      <a 
                        href={project.acceptanceLink || `https://docs.google.com/spreadsheets/d/mock_acceptance_${project.projectId}`}
                        target="_blank" 
                        rel="noreferrer"
                        className={`text-[9px] border font-bold p-1 rounded block text-center transition-all ${
                          project.acceptanceLink 
                            ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border-emerald-500/20" 
                            : "bg-[#141416]/55 text-slate-600 border-white/5"
                        }`}
                      >
                        Acceptance Link
                      </a>

                      <a 
                        href={project.finalDesignLink || `https://drive.google.com/drive/folders/mock_final_designs_${project.projectId}`}
                        target="_blank" 
                        rel="noreferrer"
                        className={`text-[9px] border font-bold p-1 rounded block text-center transition-all ${
                          project.finalDesignLink 
                            ? "bg-amber-600/10 hover:bg-amber-600/20 text-amber-300 border-amber-500/20" 
                            : "bg-[#141416]/55 text-slate-600 border-white/5"
                        }`}
                      >
                        Final Designs Link
                      </a>
                    </div>

                    {/* Drag-Handle and Move Dropdown - Mobile Accessible */}
                    <div className="mt-3.5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2 shrink-0">
                      {isAdmin ? (
                        <>
                          {/* Left: Mobile status switcher */}
                          <div className="relative inline-block text-left">
                            <select
                              value={project.projectStatus}
                              onChange={(e) => handleMoveStatus(project, e.target.value)}
                              className="bg-[#121214] border border-white/5 hover:border-white/10 text-[9px] font-black uppercase text-slate-400 hover:text-slate-200 rounded py-1 px-1.5 focus:outline-none cursor-pointer font-mono"
                              title="Re-assign phase status"
                            >
                              <option value="Pending">Move to Pending</option>
                              <option value="In Progress">Move to In Progress</option>
                              <option value="On Hold">Move to On Hold</option>
                              <option value="Completed">Move to Completed</option>
                            </select>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEdit(project)}
                              className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-650 transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={10} />
                            </button>

                            {confirmDeleteId === project.projectId ? (
                              <button
                                onClick={() => {
                                  onDelete(project.projectId);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1.5 py-1 text-[8px] font-black uppercase text-white bg-red-600 rounded animate-pulse"
                                title="Confirm removal"
                              >
                                YES
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(project.projectId)}
                                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          <span className="flex items-center gap-1 leading-none">
                            <Lock size={9} />
                            READ_ONLY
                          </span>
                          <span className="text-[8px] text-indigo-400/80 bg-indigo-400/5 px-1.5 py-0.5 rounded font-black border border-indigo-400/10">
                            {role} ACCESS
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
