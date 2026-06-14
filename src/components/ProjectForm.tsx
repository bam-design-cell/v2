import React, { useState, useEffect } from "react";
import { Project, UserRole } from "../types";
import { Shield, ShieldAlert, Save, X, Lock, CheckCircle, Clock, Calendar } from "lucide-react";

interface ProjectFormProps {
  project?: Project; // If undefined, we are in Add mode (Admin only)
  role: UserRole;
  onSave: (project: Project) => void;
  onClose: () => void;
}

export default function ProjectForm({
  project,
  role,
  onSave,
  onClose,
}: ProjectFormProps) {
  const isEditMode = !!project;
  const isC_PSTO = role === "C/PSTO";

  // Initial state setup
  const [formData, setFormData] = useState<Project>({
    projectId: "",
    companyName: "",
    product: "",
    clientName: "",
    year: "",
    quarter: "",
    cityProvincialOffice: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    datePlBriefReceived: "",
    dateCompletedBriefReceived: "",
    dateResponseSent: "",
    completedDocuments: "No",
    documentRemarks: "",
    release1stDraft: "",
    release2ndDraft: "",
    releaseFinalDesign: "",
    signedAcceptance: "No",
    signedCsf: "No",
    designForwarded: "No",
    remarks: "",
    projectStatus: "Pending",
    daysElapsed: 0,
    partALink: "",
    partBLink: "",
    acceptanceLink: "",
    finalDesignLink: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        year: project.year || new Date().getFullYear().toString(),
        quarter: project.quarter || "1st Quarter",
        cityProvincialOffice: project.cityProvincialOffice || "Davao City",
      });
    } else {
      // Auto-generate project ID for new ones
      const randomId = `PROJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        projectId: randomId,
        companyName: "",
        product: "",
        clientName: "",
        year: new Date().getFullYear().toString(),
        quarter: "1st Quarter",
        cityProvincialOffice: "Davao City",
        address: "",
        contactPerson: "",
        contactNumber: "",
        datePlBriefReceived: new Date().toISOString().split("T")[0],
        dateCompletedBriefReceived: "",
        dateResponseSent: "",
        completedDocuments: "No",
        documentRemarks: "",
        release1stDraft: "",
        release2ndDraft: "",
        releaseFinalDesign: "",
        signedAcceptance: "No",
        signedCsf: "No",
        designForwarded: "No",
        remarks: "",
        projectStatus: "Pending",
        daysElapsed: 1,
        partALink: "",
        partBLink: "",
        acceptanceLink: "",
        finalDesignLink: "",
      });
    }
  }, [project]);

  // Handle recalculation of Days Elapsed when plBriefReceived changes
  useEffect(() => {
    if (formData.datePlBriefReceived) {
      const briefDate = new Date(formData.datePlBriefReceived);
      const today = new Date();
      
      // Calculate diff in days
      const diffTime = Math.abs(today.getTime() - briefDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (formData.projectStatus === "Completed" && project) {
        // Keep the old stored elapsed time if completed unless they change something
      } else {
        setFormData(prev => ({
          ...prev,
          daysElapsed: isNaN(diffDays) ? 0 : diffDays
        }));
      }
    }
  }, [formData.datePlBriefReceived, formData.projectStatus]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Double-check safeguards: C/PSTO should not change admin fields
    if (isC_PSTO) {
      // Admin fields
      const isClientField = [
        "projectId", "companyName", "product", "clientName", "address", 
        "contactPerson", "contactNumber", "year", "quarter", "cityProvincialOffice"
      ].includes(name);

      const isDocField = [
        "datePlBriefReceived", "dateCompletedBriefReceived", "dateResponseSent", "completedDocuments", 
        "documentRemarks"
      ].includes(name);

      if (isClientField || isDocField) {
        setError("Security Restriction: You do not have permission to alter client details or brief receipt headers.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "daysElapsed" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.companyName.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (!formData.product.trim()) {
      setError("Product Name/Description is required.");
      return;
    }

    // Call save
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0a0a0c] rounded-3xl max-w-4xl w-full border border-white/5 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#0e0e10] px-8 py-5 border-b border-white/5 flex items-center justify-between text-white shrink-0">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 font-mono block">
              {role === "Admin" ? "SYSTEM_ADMIN_OVERRIDE" : "C/PSTO_DESIGNER_RESTRICTED"}
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 mt-1">
              {isEditMode ? `Edit Project File // ${formData.projectId}` : "Register New Project Brief"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 text-left">
          
          {error && (
            <div className="bg-red-500/10 text-red-400 text-xs font-semibold p-4 rounded-xl border border-red-500/25 flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isC_PSTO && (
            <div className="bg-amber-500/5 text-amber-300 text-[11px] p-4 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
              <Lock className="text-amber-500 mt-0.5 shrink-0" size={13} />
              <p className="leading-relaxed">
                <span className="font-bold">Role Restrictions Apply</span>: As a C/PSTO practitioner, client identities and Brief reception metadata are locked down under database RBAC directives. You can view them but can only edit properties inside the <span className="font-bold text-slate-200">Design Action &amp; Delivery Milestones</span> panel below.
              </p>
            </div>
          )}

          {/* Section 1: Client Information */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-white/5 pb-2">
              {isC_PSTO && <Lock size={12} className="text-indigo-400" />}
              Client Details Registry
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Project ID */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">PROJECT_ID</label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  disabled
                  className="w-full bg-[#121214] border border-white/5 text-indigo-400 text-xs font-mono rounded-xl py-2.5 px-4 focus:outline-none opacity-80"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">PROJECT_STATUS</label>
                <select
                  name="projectStatus"
                  value={formData.projectStatus}
                  onChange={handleChange}
                  className="w-full bg-[#121214] border border-white/5 text-slate-200 text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-bold uppercase tracking-wider"
                >
                  <option value="Pending">Pending PL Brief</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">COMPANY_NAME *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="e.g. Davao Fruit Pack Corp."
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5 font-semibold"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                />
              </div>

              {/* Product */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">LEAD_PRODUCT *</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="e.g. Banana Crisps 120g Stand Up Pouch"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5 font-semibold"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                />
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">CLIENT_OWNER</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="e.g. Elena R. Corpuz"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5 font-semibold"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">CLIENT_CONTACT_PERSON</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="e.g. Production Manager"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5 font-semibold"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">CLIENT_REPRESENTATIVE_PHONE</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="e.g. +63 9xx xxx xxxx"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5 font-mono"
                      : "bg-[#121214] text-slate-200 border-white/5 font-mono"
                  }`}
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">REPORT_YEAR</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-bold ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              {/* Quarter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">REPORT_QUARTER</label>
                <select
                  name="quarter"
                  value={formData.quarter}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-bold ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5"
                      : "bg-[#121214] text-slate-200 border-white/5 focus:border-indigo-550"
                  }`}
                >
                  <option value="1st Quarter">1st Quarter</option>
                  <option value="2nd Quarter">2nd Quarter</option>
                  <option value="3rd Quarter">3rd Quarter</option>
                  <option value="4th Quarter">4th Quarter</option>
                </select>
              </div>

              {/* City and Provincial Office */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">CITY_OR_PROVINCIAL_OFFICE *</label>
                <select
                  name="cityProvincialOffice"
                  value={formData.cityProvincialOffice}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-bold ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5"
                      : "bg-[#121214] text-slate-200 border-white/5"
                  }`}
                >
                  <option value="Davao City">Davao City (Metropolitan Davao Office)</option>
                  <option value="Davao Oriental">Davao Oriental (PSTO Davao Oriental)</option>
                  <option value="Davao de Oro">Davao de Oro (PSTO Davao de Oro)</option>
                  <option value="Davao del Norte">Davao del Norte (PSTO Davao del Norte)</option>
                  <option value="Davao Occidental">Davao Occidental (PSTO Davao Occidental)</option>
                  <option value="Davao del Sur">Davao del Sur (PSTO Davao del Sur)</option>
                </select>
              </div>

              {/* Company Address */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">BUSINESS_FACILITY_LOCATOR</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="Facility street address, Municipality/Province"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 ${
                    isC_PSTO
                      ? "bg-[#121214] text-slate-500 border-white/5"
                      : "bg-[#121214] text-slate-200 border-white/5"
                  }`}
                />
              </div>

            </div>
          </div>

          {/* Section 2: Document / PL Brief Status */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-white/5 pb-2">
              {isC_PSTO && <Lock size={12} className="text-indigo-400" />}
              Packaging &amp; Labeling Brief Reception
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Brief Received Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">DATE_BRIEF_RECEIVED</label>
                <input
                  type="date"
                  name="datePlBriefReceived"
                  value={formData.datePlBriefReceived}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border ${
                    isC_PSTO ? "bg-[#121214] text-slate-500 border-white/5" : "bg-[#121214] text-slate-300 border-white/5"
                  }`}
                />
              </div>

              {/* Completed Brief Received Date */}
              <div>
                <label className="block text-[10px] font-bold text-[#a5b4fc] uppercase tracking-wider mb-2 font-mono">DATE_COMPLETED_BRIEF_RECEIVED</label>
                <input
                  type="date"
                  name="dateCompletedBriefReceived"
                  value={formData.dateCompletedBriefReceived || ""}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  placeholder="Yyyy-mm-dd"
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border ${
                    isC_PSTO ? "bg-[#121214] text-slate-500 border-white/5" : "bg-[#121214] text-emerald-400 border-emerald-500/10"
                  }`}
                />
              </div>

              {/* Response Sent Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">DATE_RESPONSE_DISPATCHED</label>
                <input
                  type="date"
                  name="dateResponseSent"
                  value={formData.dateResponseSent}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border ${
                    isC_PSTO ? "bg-[#121214] text-slate-500 border-white/5" : "bg-[#121214] text-slate-300 border-white/5"
                  }`}
                />
              </div>

              {/* Completed Docs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">BRIEF_DOCUMENTATION_COMPLETED</label>
                <select
                  name="completedDocuments"
                  value={formData.completedDocuments}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none border focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-bold ${
                    isC_PSTO ? "bg-[#121214] text-slate-500 border-white/5" : "bg-[#121214] text-slate-300 border-white/5"
                  }`}
                >
                  <option value="No">No (Requirements outstanding)</option>
                  <option value="Yes">Yes (Forms verified complete)</option>
                  <option value="In Progress">In Progress / Under audit</option>
                </select>
              </div>

              {/* Calculated Due Date (30 network days from date completed brief received) */}
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 font-mono">DUE_DATE (30 NETWORK DAYS FROM COMPLETED BRIEF)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    disabled
                    value={(() => {
                      if (!formData.dateCompletedBriefReceived) return "Pending Completed Brief";
                      const date = new Date(formData.dateCompletedBriefReceived);
                      if (isNaN(date.getTime())) return "Invalid Date";
                      
                      let workingDaysAdded = 0;
                      const tempDate = new Date(date);
                      while (workingDaysAdded < 30) {
                        tempDate.setDate(tempDate.getDate() + 1);
                        const day = tempDate.getDay();
                        if (day !== 0 && day !== 6) { // Skip Saturday and Sunday
                          workingDaysAdded++;
                        }
                      }
                      return tempDate.toISOString().split("T")[0];
                    })()}
                    className="w-40 bg-[#121214] border border-white/5 text-rose-400 text-xs font-mono font-bold rounded-xl py-2.5 px-4 focus:outline-none opacity-80"
                  />
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar size={11} className="text-indigo-400" />
                    Auto deadline
                  </span>
                </div>
              </div>

              {/* Deviation from F.O. */}
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 font-mono">DEVIATION_FROM_F_O (ON COMPLETED BRIEF)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    disabled
                    value={(() => {
                      if (!formData.dateCompletedBriefReceived) return "Pending Completed Brief";
                      const date = new Date(formData.dateCompletedBriefReceived);
                      if (isNaN(date.getTime())) return "-";
                      
                      let workingDaysAdded = 0;
                      const tempDate = new Date(date);
                      while (workingDaysAdded < 30) {
                        tempDate.setDate(tempDate.getDate() + 1);
                        const day = tempDate.getDay();
                        if (day !== 0 && day !== 6) {
                          workingDaysAdded++;
                        }
                      }
                      const dueDateStr = tempDate.toISOString().split("T")[0];

                      if (!formData.release1stDraft) return "Pending Draft 1";

                      const start = new Date(formData.release1stDraft);
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
                      
                      if (count === 0) return "0 (On Time)";
                      return isLate ? `+${count} Days Late` : `-${count} Days Early`;
                    })()}
                    className="w-48 bg-[#121214] border border-white/5 text-slate-200 text-xs font-mono font-bold rounded-xl py-2.5 px-4 focus:outline-none opacity-80"
                  />
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} className="text-indigo-400" />
                    Auto computed
                  </span>
                </div>
              </div>

              {/* Document Remarks */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">BRIEF_COMPLIANCE_REMARKS</label>
                <textarea
                  name="documentRemarks"
                  value={formData.documentRemarks}
                  onChange={handleChange}
                  disabled={isC_PSTO}
                  rows={2}
                  placeholder="Record verification logs, legal compliant requirements, or technical constraints..."
                  className={`w-full text-xs rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 border ${
                    isC_PSTO ? "bg-[#121214] text-slate-500 border-white/5" : "bg-[#121214] text-slate-200 border-white/5"
                  }`}
                />
              </div>

            </div>
          </div>

          {/* Section 3: Design & Draft Cycles (C/PSTO Editable block) */}
          <div className="bg-[#121214]/50 p-6 rounded-2xl border border-indigo-500/15 space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#818cf8] flex items-center gap-2 border-b border-indigo-500/10 pb-2.5">
              <CheckCircle size={14} className="text-indigo-400" />
              Design Action &amp; Delivery Milestones
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Release 1st Draft */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">1st Draft Trial Date</label>
                <input
                  type="date"
                  name="release1stDraft"
                  className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none"
                  value={formData.release1stDraft}
                  onChange={handleChange}
                />
              </div>

              {/* Release 2nd Draft */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">2nd Draft Trial Date</label>
                <input
                  type="date"
                  name="release2ndDraft"
                  className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none"
                  value={formData.release2ndDraft}
                  onChange={handleChange}
                />
              </div>

              {/* Release Final Design */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approved Master Release</label>
                <input
                  type="date"
                  name="releaseFinalDesign"
                  className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none"
                  value={formData.releaseFinalDesign}
                  onChange={handleChange}
                />
              </div>

              {/* Signed Acceptance */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono font-bold">ACCEPTANCE_OBTAINED</label>
                <select
                  name="signedAcceptance"
                  className="w-full text-xs rounded-xl py-2.5 px-4 border border-white/5 bg-[#0a0a0c] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-semibold uppercase tracking-wider"
                  value={formData.signedAcceptance}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Signed acceptance file)</option>
                  <option value="In Progress">Pending Signature</option>
                </select>
              </div>

              {/* Signed CSF */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono font-bold">CSF_ACQUIRED</label>
                <select
                  name="signedCsf"
                  className="w-full text-xs rounded-xl py-2.5 px-4 border border-white/5 bg-[#0a0a0c] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-semibold uppercase tracking-wider"
                  value={formData.signedCsf}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Feedback sheets logged)</option>
                  <option value="In Progress">Contact follow-up sent</option>
                </select>
              </div>

              {/* Design Forwarded */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono font-bold">DESIGN_FORWARDED_OUT</label>
                <select
                  name="designForwarded"
                  className="w-full text-xs rounded-xl py-2.5 px-4 border border-white/5 bg-[#0a0a0c] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-semibold uppercase tracking-wider"
                  value={formData.designForwarded}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Dispatched to printing)</option>
                  <option value="In Progress">Mock-up pending approval</option>
                </select>
              </div>

              {/* Drive Directories & Docs */}
              <div className="md:col-span-3 pt-4 border-t border-white/[0.04] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-3 rounded bg-indigo-500"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">Drive Directories &amp; Acceptance Sheets</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Part A Drive Folder Link</label>
                    <input
                      type="url"
                      name="partALink"
                      placeholder="e.g. https://drive.google.com/..."
                      className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      value={formData.partALink || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Part B Drive Folder Link</label>
                    <input
                      type="url"
                      name="partBLink"
                      placeholder="e.g. https://drive.google.com/..."
                      className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      value={formData.partBLink || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Acceptance Sheet Link</label>
                    <input
                      type="url"
                      name="acceptanceLink"
                      placeholder="e.g. https://docs.google.com/spreadsheets/..."
                      className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      value={formData.acceptanceLink || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Final Designs Link</label>
                    <input
                      type="url"
                      name="finalDesignLink"
                      placeholder="e.g. https://drive.google.com/..."
                      className="w-full text-xs rounded-xl py-2.5 px-4 focus:ring-1 focus:ring-indigo-500/50 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      value={formData.finalDesignLink || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Designer Remarks */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">DESIGNER_REMARKS_LOG</label>
                <textarea
                  name="remarks"
                  rows={3}
                  placeholder="Record file export details, revisions request specifics, dimensional mock-ups..."
                  className="w-full text-xs rounded-xl py-2.5 px-4 border border-white/5 bg-[#0a0a0c] text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="bg-[#0e0e10] border-t border-white/5 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
            <Shield size={12} className="text-indigo-400" />
            <span>SESSION: {role}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15 uppercase tracking-wider"
            >
              <Save size={13} />
              Save changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
