import React, { useState } from "react";
import { Project, UserRole } from "../types";
import { Search, Edit2, Trash2, Calendar, Lock, FileSpreadsheet, Plus, X, RotateCcw, Filter, Download, Globe, Check, Clock } from "lucide-react";
import GoogleSheetsSync from "./GoogleSheetsSync";
import KanbanBoard from "./KanbanBoard";

interface ProjectTableProps {
  projects: Project[];
  role: UserRole;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onSave?: (project: Project) => void;
  // Lifted state props
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  officeFilter: string;
  setOfficeFilter: (value: string) => void;
  quarterFilter: string;
  setQuarterFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
}

export default function ProjectTable({
  projects,
  role,
  onEdit,
  onDelete,
  onAddNew,
  onSave,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  officeFilter,
  setOfficeFilter,
  quarterFilter,
  setQuarterFilter,
  yearFilter,
  setYearFilter,
}: ProjectTableProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSheetsSync, setShowSheetsSync] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const isC_PSTO = role === "C/PSTO";
  const isAdmin = role === "Admin";

  // Filter projects by search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.cityProvincialOffice && project.cityProvincialOffice.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || project.projectStatus === statusFilter;
    const matchesOffice = officeFilter === "All" || project.cityProvincialOffice === officeFilter;
    const matchesQuarter = quarterFilter === "All" || project.quarter === quarterFilter;
    const matchesYear = yearFilter === "All" || project.year === yearFilter;

    return matchesSearch && matchesStatus && matchesOffice && matchesQuarter && matchesYear;
  });

  const calculateWorkingDays = (startStr: string, endStr: string): number => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start > end) return 0;
    
    let count = 0;
    const current = new Date(start);
    while (current < end) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
        count++;
      }
    }
    return count;
  };

  const calculateDueDate = (receivedDateStr: string): string => {
    if (!receivedDateStr) return "";
    const date = new Date(receivedDateStr);
    if (isNaN(date.getTime())) return "";
    
    let workingDaysAdded = 0;
    const tempDate = new Date(date);
    while (workingDaysAdded < 30) {
      tempDate.setDate(tempDate.getDate() + 1);
      const day = tempDate.getDay();
      if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
        workingDaysAdded++;
      }
    }
    return tempDate.toISOString().split("T")[0];
  };

  const calculateDeviation = (project: Project): string => {
    if (!project.dateCompletedBriefReceived || !project.release1stDraft) return "-";
    const dueDateStr = calculateDueDate(project.dateCompletedBriefReceived);
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

  // 1. Export standard 10-column P&L Monitoring Report aligned exactly with DOST DAVAO REGION template
  const exportToPLReportCSV = () => {
    const escapeCSVCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Calculate dynamic aggregates
    let totalDev = 0;
    let countDev = 0;
    filteredProjects.forEach(p => {
      const devStr = calculateDeviation(p);
      if (devStr) {
        const num = parseInt(devStr);
        if (!isNaN(num)) {
          totalDev += num;
          countDev++;
        }
      }
    });

    const avgDeviation = countDev > 0 ? (Math.round((totalDev / countDev) * 10) / 10).toString() : "#DIV/0!";
    
    // Average elapsed time
    const totalElapsed = filteredProjects.reduce((sum, p) => sum + p.daysElapsed, 0);
    const avgElapsed = filteredProjects.length > 0 ? (Math.round((totalElapsed / filteredProjects.length) * 10) / 10).toString() : "0";
    
    // Completion metrics
    const completedCount = filteredProjects.filter(p => p.projectStatus === "Completed").length;
    const completionPercentage = filteredProjects.length > 0 ? Math.round((completedCount / filteredProjects.length) * 100) : 0;

    let csv = "";
    
    const displayQuarter = quarterFilter === "All" ? "1st-4th Quarter" : quarterFilter;
    const displayYear = yearFilter === "All" ? "2026" : yearFilter;
    const displayPeriod = `${displayQuarter} ${displayYear}`;

    // Header section of DOST template matching the provided HTML layout exactly
    csv += "PACKAGING AND LABELING MONITORING REPORT,,,,,,,,,\n";
    csv += `F.O.: 30 working days after submission of complete requirements,,,,,,,,Quarter/Year: ${displayPeriod}\n`;
    csv += "\n";
    
    // Column Headers
    csv += "NO.,DATE RECEIVED,NAME OF CLIENT (COMPANY),PRODUCT,DUE DATE,RELEASE DATE (1ST DRAFT),RELEASE DATE (2ND DRAFT),RELEASE DATE (FINAL DESIGN),DEVIATION FROM F.O.,REMARKS\n";
    
    // Rows
    filteredProjects.forEach((p, idx) => {
      const no = idx + 1;
      const dateReceived = p.datePlBriefReceived || "";
      const company = p.companyName || "";
      const product = p.product || "";
      const dueDate = calculateDueDate(p.dateCompletedBriefReceived);
      const draft1 = p.release1stDraft || "";
      const draft2 = p.release2ndDraft || "";
      const finalDesign = p.releaseFinalDesign || "";
      const deviation = calculateDeviation(p);
      const remarks = p.remarks || "";

      const row = [
        escapeCSVCell(no),
        escapeCSVCell(dateReceived),
        escapeCSVCell(company),
        escapeCSVCell(product),
        escapeCSVCell(dueDate),
        escapeCSVCell(draft1),
        escapeCSVCell(draft2),
        escapeCSVCell(finalDesign),
        escapeCSVCell(deviation),
        escapeCSVCell(remarks)
      ].join(",");
      csv += row + "\n";
    });

    // Space rows
    csv += ",,,,,,,,,\n";
    csv += ",,,,,,,,,\n";

    // Summary Section
    csv += `,,,,,,,Ave # of Days,${escapeCSVCell(avgDeviation)},${escapeCSVCell(avgElapsed + " days active")}\n`;
    csv += `,,,,,,,# of requests,${escapeCSVCell(filteredProjects.length)},${escapeCSVCell(completionPercentage + "%")}\n`;
    
    csv += ",,,,,,,,,\n";
    csv += ",,,,,,,,,\n";

    // Signatures
    csv += "Prepared by:,,,Reviewed by:,,,Noted by:,,,\n";
    csv += ",,,,,,,,,\n";
    csv += "Cesar John T. Catuburan,,,Donna Rose D. Ching,,,Elsie Mae A. Solidum,,,\n";
    csv += "P&L Design Staff,,,P&L Design Coordinator,,,Division Head,,,\n";
    
    csv += ",,,,,,,,,\n";
    csv += ",,,,,,,,,\n";

    // Footer Codes
    csv += `,,,,,,,,PM-TSD-08-014-F2,\n`;
    csv += `,,,,,,,,Revision No. 10,\n`;
    csv += `,,,,,,,,16 March 2026,\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DOST_DAVAO_PL_Monitoring_Report_${displayQuarter.replace(/\s+/g, '_')}_${displayYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // 2. Export raw 23-column DB format for database backup & spreadsheet synchronization
  const exportToCSV = () => {
    const escapeCSVCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csv = "";
    
    // Column Headers exactly matching database requirements
    csv += "Project ID,Company Name,Product,Client Name,Year,Quarter,City and Provincial Office,Address,Contact Person,Contact Number,Date PL Brief Received,Date Completed Brief Received,Date Response Sent,Completed Documents,Document Remarks,Released 1st Draft,Released 2nd Draft,Released Final Design,Signed Acceptance Sheet,Signed CSF,Design Forwarded,Remarks,Project Status,Days Elapsed\n";
    
    // Rows
    filteredProjects.forEach((p) => {
      const row = [
        escapeCSVCell(p.projectId),
        escapeCSVCell(p.companyName),
        escapeCSVCell(p.product),
        escapeCSVCell(p.clientName),
        escapeCSVCell(p.year || "2026"),
        escapeCSVCell(p.quarter || "1st Quarter"),
        escapeCSVCell(p.cityProvincialOffice || "Davao City"),
        escapeCSVCell(p.address),
        escapeCSVCell(p.contactPerson),
        escapeCSVCell(p.contactNumber),
        escapeCSVCell(p.datePlBriefReceived),
        escapeCSVCell(p.dateCompletedBriefReceived || ""),
        escapeCSVCell(p.dateResponseSent),
        escapeCSVCell(p.completedDocuments),
        escapeCSVCell(p.documentRemarks),
        escapeCSVCell(p.release1stDraft),
        escapeCSVCell(p.release2ndDraft),
        escapeCSVCell(p.releaseFinalDesign),
        escapeCSVCell(p.signedAcceptance),
        escapeCSVCell(p.signedCsf),
        escapeCSVCell(p.designForwarded),
        escapeCSVCell(p.remarks),
        escapeCSVCell(p.projectStatus),
        escapeCSVCell(p.daysElapsed)
      ].join(",");
      csv += row + "\n";
    });

    // Trigger Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DOST_DAVAO_PL_Database_Export_${new Date().getFullYear()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setOfficeFilter("All");
    setQuarterFilter("All");
    setYearFilter("All");
    setStatusFilter("All");
  };

  const isAnyFilterActive = 
    searchTerm !== "" || 
    officeFilter !== "All" || 
    quarterFilter !== "All" || 
    yearFilter !== "All" || 
    statusFilter !== "All";

  return (
    <div className="bg-[#0a0a0c] rounded-2xl border border-white/5 shadow-2xl overflow-hidden" id="project-table-container">
      
      {/* Table Action Controls */}
      <div className="p-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex-1 w-full xl:max-w-xs relative shrink-0">
          <input
            type="text"
            placeholder="Search by ID, company, office, product, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121214] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50"
          />
          <Search className="absolute left-3.5 top-3 text-slate-500" size={14} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* View Mode Component Toggle */}
          <div className="flex items-center bg-[#121214] border border-white/5 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Kanban Board
            </button>
          </div>
          {/* Office Filter */}
          <select
            value={officeFilter}
            onChange={(e) => setOfficeFilter(e.target.value)}
            className="bg-[#121214] border border-white/5 text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer min-w-[130px]"
          >
            <option value="All">All Offices</option>
            <option value="Davao City">Davao City</option>
            <option value="Davao Oriental">Davao Oriental</option>
            <option value="Davao de Oro">Davao de Oro</option>
            <option value="Davao del Norte">Davao del Norte</option>
            <option value="Davao Occidental">Davao Occidental</option>
            <option value="Davao del Sur">Davao del Sur</option>
          </select>

          {/* Quarter Filter */}
          <select
            value={quarterFilter}
            onChange={(e) => setQuarterFilter(e.target.value)}
            className="bg-[#121214] border border-white/5 text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="All">All Quarters</option>
            <option value="1st Quarter">1st Quarter</option>
            <option value="2nd Quarter">2nd Quarter</option>
            <option value="3rd Quarter">3rd Quarter</option>
            <option value="4th Quarter">4th Quarter</option>
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-[#121214] border border-white/5 text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="All">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121214] border border-white/5 text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending PL Brief</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Unified Export Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs text-indigo-400 font-bold py-2.5 px-3.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
              title="Download monitoring records"
              id="export-csv-btn"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-white/5">
                  <button
                    onClick={() => {
                      setShowSheetsSync(true);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left p-4 hover:bg-white/5 bg-emerald-950/10 flex flex-col gap-1 transition-all cursor-pointer group border-b border-emerald-500/10"
                  >
                    <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center gap-1.5">
                      <Globe size={14} className="text-emerald-400 animate-pulse" />
                      Sync with Google Sheets Online
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans leading-normal">
                      Export design records directly to online Google Sheet starting at Row 10!
                    </span>
                  </button>
                  <button
                    onClick={exportToPLReportCSV}
                    className="w-full text-left p-4 hover:bg-white/[0.02] flex flex-col gap-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-indigo-400" />
                      DOST DAVAO Regional Monitoring Report
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans leading-normal">
                      Official 10-column spreadsheet featuring target compliance, working days dev calculations, and signature blocks.
                    </span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full text-left p-4 hover:bg-white/[0.02] flex flex-col gap-1 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                      <FileSpreadsheet size={14} className="text-emerald-400" />
                      Backup Database Spreadsheet
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans leading-normal">
                      Full 23-column layout containing structural contact lists, system attributes, and sync values.
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Add project button - only shown if Admin */}
          {isAdmin ? (
            <button
              onClick={onAddNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15 uppercase tracking-wider"
              id="add-new-project-btn"
            >
              <Plus size={14} />
              New Brief
            </button>
          ) : (
            <div className="text-[10px] bg-white/5 text-slate-400 py-2.5 px-4 border border-white/5 rounded-xl font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              CREATE_LOCKED
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display & Stats summary */}
      {isAnyFilterActive && (
        <div className="px-6 py-3 bg-[#0e0e10]/60 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter size={10} className="text-indigo-400" /> Active Filters:
            </span>
            
            {officeFilter !== "All" && (
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 font-sans">
                Office: {officeFilter}
                <button onClick={() => setOfficeFilter("All")} className="hover:text-white cursor-pointer"><X size={10} /></button>
              </span>
            )}

            {quarterFilter !== "All" && (
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 font-sans">
                Quarter: {quarterFilter}
                <button onClick={() => setQuarterFilter("All")} className="hover:text-white cursor-pointer"><X size={10} /></button>
              </span>
            )}

            {yearFilter !== "All" && (
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 font-sans">
                Year: {yearFilter}
                <button onClick={() => setYearFilter("All")} className="hover:text-white cursor-pointer"><X size={10} /></button>
              </span>
            )}

            {statusFilter !== "All" && (
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 font-sans">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("All")} className="hover:text-white cursor-pointer"><X size={10} /></button>
              </span>
            )}

            {searchTerm !== "" && (
              <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5 font-sans">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-white cursor-pointer"><X size={10} /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-indigo-400 hover:text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 cursor-pointer ml-1"
            >
              <RotateCcw size={10} />
              Clear All
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-2 self-end sm:self-auto">
            <span>FILES: <span className="text-white text-xs">{filteredProjects.length}</span> / {projects.length}</span>
            <span className="text-slate-600">|</span>
            <span>AVG CYCLE: <span className="text-white text-xs">
              {filteredProjects.length > 0 
                ? (Math.round((filteredProjects.reduce((sum, p) => sum + p.daysElapsed, 0) / filteredProjects.length) * 10) / 10)
                : 0}
            </span> Days</span>
          </div>
        </div>
      )}

      {/* Projects Table */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0e0e10] border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-6">ID &amp; Registered Date</th>
              <th className="py-4 px-4">Company &amp; Lead product</th>
              <th className="py-4 px-4">Client Representative</th>
              <th className="py-4 px-4">Milestone Progress</th>
              <th className="py-4 px-4 text-center">Deviation from F.O.</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Design Directories</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans text-xs text-slate-300">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <FileSpreadsheet className="mx-auto text-slate-600" size={32} />
                    <p className="font-bold text-slate-300 uppercase tracking-wider">No Project Match</p>
                    <p className="text-[11px] text-slate-500">Adjust the active status drop-down filter or search characters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                
                // Determine CSS for status badges
                let statusBadgeStyle = "bg-slate-800 text-slate-300 border border-white/5";
                if (project.projectStatus === "Completed") {
                  statusBadgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                } else if (project.projectStatus === "In Progress") {
                  statusBadgeStyle = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
                } else if (project.projectStatus === "Pending") {
                  statusBadgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                } else if (project.projectStatus === "On Hold") {
                  statusBadgeStyle = "bg-red-500/10 text-red-400 border border-red-500/20";
                }

                // Masking for C/PSTO Views
                const maskedLabel = (
                  <span className="inline-flex items-center gap-1 bg-white/5 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold tracking-wider">
                    <Lock size={9} className="text-slate-500" />
                    RESTRICTED
                  </span>
                ).props;

                return (
                  <tr key={project.projectId} className="hover:bg-white/[0.01] transition-colors">
                    
                    {/* ID & Details */}
                    <td className="py-4 px-6 font-mono text-slate-400 font-semibold align-middle">
                      <span className="block text-indigo-300 font-bold">{project.projectId}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-sans">
                        <Calendar size={10} className="text-slate-500" /> Received: {project.datePlBriefReceived || "N/A"}
                      </span>
                      {project.dateCompletedBriefReceived ? (
                        <span className="text-[10px] text-rose-450 flex items-center gap-1 mt-1 font-sans font-semibold">
                          <Clock size={10} className="text-rose-450" /> Due Date: {calculateDueDate(project.dateCompletedBriefReceived)}
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-500 flex items-center gap-1 mt-1 font-sans font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20 rounded inline-block max-w-fit" title="Calculated exclusively on completed briefs">
                          Pending Compl. Brief
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold block mt-1.5 font-sans uppercase">
                        [{project.year || "2026"} • {project.quarter || "1st Quarter"}]
                      </span>
                    </td>

                    {/* Company & Product */}
                    <td className="py-4 px-4 align-middle">
                      <div className="max-w-xs">
                        <h5 className="font-bold text-white break-words">{project.companyName}</h5>
                        <p className="text-[11px] text-slate-400 break-all mt-0.5">{project.product}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-widest leading-none">
                          {project.cityProvincialOffice || "Davao City"}
                        </span>
                      </div>
                    </td>

                    {/* Client Masked Fields */}
                    <td className="py-4 px-4 text-xs text-slate-300 align-middle">
                      {isC_PSTO ? (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-200">{project.clientName}</p>
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 bg-white/5 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold tracking-wider">
                              <Lock size={9} className="text-slate-500" />
                              REDACTED
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-[180px] space-y-1 text-slate-400 text-[11px]">
                          <p className="font-bold text-white text-xs">{project.clientName}</p>
                          <p className="truncate" title={project.address}>{project.address}</p>
                          <p className="font-semibold text-slate-400 font-mono text-[10px]">
                            {project.contactPerson} • {project.contactNumber}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Milestones status */}
                    <td className="py-4 px-4 text-[11px] align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${project.release1stDraft ? "bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,1)]" : "bg-slate-700"}`}></span>
                          <span className="text-[11px] text-slate-400">1st Draft Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${project.releaseFinalDesign ? "bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,1)]" : "bg-slate-700"}`}></span>
                          <span className="text-[11px] text-slate-400">Final Template Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${project.signedAcceptance === "Yes" ? "bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,1)]" : "bg-slate-700"}`}></span>
                          <span className="text-[11px] text-slate-400">CSF Sign-off Received</span>
                        </div>
                      </div>
                    </td>

                    {/* Deviation from F.O. */}
                    <td className="py-4 px-4 text-center align-middle">
                      {(() => {
                        const dev = calculateDeviation(project);
                        const isLate = dev.startsWith("+");
                        const isEarly = dev.startsWith("-");
                        
                        return (
                          <>
                            <span className={`font-mono font-bold text-sm ${
                              isLate ? "text-red-400 font-extrabold shadow-[0_0_8px_rgba(239,68,68,0.2)]" : isEarly ? "text-emerald-400 font-bold" : "text-slate-205"
                            }`}>
                              {dev}
                            </span>
                            {project.release1stDraft ? (
                              <span className="block text-[9px] text-slate-550 font-mono mt-0.5">
                                {isEarly ? "DAYS EARLY" : isLate ? "DAYS LATE" : "ON TIME"}
                              </span>
                            ) : (
                              <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                                PENDING DRAFT
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 align-middle">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeStyle}`}>
                        {project.projectStatus}
                      </span>
                    </td>

                    {/* Design Directories TD */}
                    <td className="py-4 px-4 align-middle">
                      {isAdmin ? (
                        <div className="flex flex-col gap-1.5 max-w-[150px]">
                          <div className="flex gap-1.5">
                            <a 
                              href={project.partALink || `https://drive.google.com/drive/folders/mock_part_a_${project.projectId}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center shrink-0 flex-1 transition-all ${
                                project.partALink 
                                  ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/25" 
                                  : "bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border-indigo-500/10"
                              }`}
                              title={project.partALink ? "View Part A Drive Folder" : "Part A Folder"}
                            >
                              Part A
                            </a>
                            <a 
                              href={project.partBLink || `https://drive.google.com/drive/folders/mock_part_b_${project.projectId}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center shrink-0 flex-1 transition-all ${
                                project.partBLink 
                                  ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/25" 
                                  : "bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border-indigo-500/10"
                              }`}
                              title={project.partBLink ? "View Part B Drive Folder" : "Part B Folder"}
                            >
                              Part B
                            </a>
                          </div>
                          <a 
                            href={project.acceptanceLink || `https://docs.google.com/spreadsheets/d/mock_acceptance_${project.projectId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center block transition-all ${
                              project.acceptanceLink 
                                ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/25" 
                                : "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/10"
                            }`}
                            title={project.acceptanceLink ? "View Acceptance Link" : "Acceptance Link"}
                          >
                            Acceptance Link
                          </a>

                          <a 
                            href={project.finalDesignLink || `https://drive.google.com/drive/folders/mock_final_designs_${project.projectId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center block transition-all ${
                              project.finalDesignLink 
                                ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/25" 
                                : "bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 hover:text-amber-300 border-amber-500/10"
                            }`}
                            title={project.finalDesignLink ? "View Final Designs Link" : "Final Designs Link"}
                          >
                            Final Designs Link
                          </a>
                          
                          {/* Notify C/PSTO Button */}
                          <button
                            onClick={() => {
                              alert(`Notification sent to C/PSTO regarding status of design for Project ID ${project.projectId}: "${project.projectStatus}"`);
                              if (typeof window !== "undefined") {
                                const customToast = document.createElement("div");
                                customToast.className = "fixed bottom-5 right-5 bg-[#0a0a0c] border-l-4 border-indigo-500 p-4 rounded-xl shadow-2xl z-[9999] text-white flex flex-col gap-1 max-w-sm border border-white/5 animate-slide-in";
                                customToast.innerHTML = `
                                  <div class="flex justify-between items-center">
                                    <span class="text-xs font-black uppercase tracking-widest text-indigo-400 font-mono">PSTO Alert Issued</span>
                                    <button class="text-slate-500 hover:text-white font-bold" onclick="this.parentElement.parentElement.remove()">&times;</button>
                                  </div>
                                  <p class="text-[11px] text-slate-350 leading-normal mt-1">Notification sent to PSTO designer: <strong>${project.projectId} design status updated. State remains: "${project.projectStatus}"</strong></p>
                                `;
                                document.body.appendChild(customToast);
                                setTimeout(() => customToast.remove(), 6000);
                              }
                            }}
                            className="px-2 py-1 bg-[#121214] hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 rounded border border-white/5 font-extrabold text-[9px] uppercase tracking-wider text-center cursor-pointer transition-all mt-1 shadow-md"
                          >
                            Notify C/PSTO
                          </button>
                        </div>
                      ) : (
                        // C/PSTO Role
                        <div className="flex flex-col gap-1.5 max-w-[150px]">
                          <div className="flex gap-1.5 font-mono">
                            <a 
                              href={project.partALink || `https://drive.google.com/drive/folders/mock_design_${project.projectId}_a`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center shrink-0 flex-1 transition-all ${
                                project.partALink 
                                  ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/25" 
                                  : "bg-[#121214]/65 hover:bg-white/5 text-slate-500 border-white/5"
                              }`}
                              title={project.partALink ? "View Part A Design Folder" : "Part A Folder (Not configured)"}
                            >
                              Part A
                            </a>
                            <a 
                              href={project.partBLink || `https://drive.google.com/drive/folders/mock_design_${project.projectId}_b`} 
                              target="_blank" 
                              rel="noreferrer"
                              className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center shrink-0 flex-1 transition-all ${
                                project.partBLink 
                                  ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/25" 
                                  : "bg-[#121214]/65 hover:bg-white/5 text-slate-500 border-white/5"
                              }`}
                              title={project.partBLink ? "View Part B Design Folder" : "Part B Folder (Not configured)"}
                            >
                              Part B
                            </a>
                          </div>
                          <a 
                            href={project.acceptanceLink || `https://docs.google.com/spreadsheets/d/mock_acceptance_${project.projectId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center block transition-all ${
                              project.acceptanceLink 
                                ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/25" 
                                : "bg-[#121214]/65 hover:bg-white/5 text-slate-500 border-white/5"
                            }`}
                            title={project.acceptanceLink ? "View Acceptance Sheet" : "Acceptance Sheet"}
                          >
                            Acceptance Sheet
                          </a>
                          <a 
                            href={project.finalDesignLink || `https://drive.google.com/drive/folders/mock_final_designs_${project.projectId}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={`px-2 py-1 rounded border font-bold text-[10px] tracking-wide text-center block transition-all ${
                              project.finalDesignLink 
                                ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/25" 
                                : "bg-[#121214]/65 hover:bg-white/5 text-slate-500 border-white/5"
                            }`}
                            title={project.finalDesignLink ? "View Final Designs" : "Final Designs"}
                          >
                            Final Designs
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit(project)}
                          className="p-2 rounded-lg border border-white/5 bg-white/5 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all cursor-pointer"
                          title="Open folder editor"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Delete Button - Admin ONLY */}
                        {isAdmin && (
                          confirmDeleteId === project.projectId ? (
                            <div className="flex items-center gap-1.5 p-1 bg-red-950/25 border border-red-500/30 rounded-lg animate-fade-in select-none">
                              <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest px-1 font-mono">Confirm?</span>
                              <button
                                onClick={() => {
                                  onDelete(project.projectId);
                                  setConfirmDeleteId(null);
                                }}
                                className="p-1 rounded bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer flex items-center justify-center"
                                title="Yes, delete brief"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 rounded bg-white/5 text-slate-400 hover:text-slate-200 transition-all cursor-pointer flex items-center justify-center"
                                title="Cancel"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(project.projectId)}
                              className="p-2 rounded-lg border border-white/5 bg-white/5 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all cursor-pointer"
                              title="Delete file metadata"
                            >
                              <Trash2 size={12} />
                            </button>
                          )
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="p-6 border-t border-white/5 bg-[#050507]">
          <KanbanBoard
            projects={filteredProjects}
            role={role}
            onSave={onSave}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}

      {showSheetsSync && (
        <GoogleSheetsSync 
          projects={filteredProjects} 
          onClose={() => setShowSheetsSync(false)} 
        />
      )}

    </div>
  );
}
