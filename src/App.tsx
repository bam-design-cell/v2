import React, { useState, useEffect } from "react";
import { User, Project, UserRole } from "./types";
import {
  getStoredUsers,
  getStoredProjects,
  saveStoredUsers,
  saveStoredProjects,
} from "./data/mockData";
import Dashboard from "./components/Dashboard";
import ProjectTable from "./components/ProjectTable";
import ProjectForm from "./components/ProjectForm";
import UserManagement from "./components/UserManagement";
import AccessDenied from "./components/AccessDenied";
import DesignReview from "./components/DesignReview";
import Login from "./components/Login";

import {
  LayoutDashboard,
  FolderDot,
  Users2,
  FileSpreadsheet,
  Cpu,
  Lock,
  UserCheck,
  RefreshCw,
  FolderHeart,
  Globe,
  Database,
  ArrowRight,
  ShieldAlert,
  LogOut,
  Bell,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface SystemNotification {
  id: string;
  type: "link_added" | "review_needed";
  title: string;
  description: string;
  projectId: string;
  time: string;
  isNew?: boolean;
}

const getNotificationsFromProjects = (projectsList: Project[]): SystemNotification[] => {
  const list: SystemNotification[] = [];
  
  projectsList.forEach((p) => {
    // 1. Check if design review is needed (status in Pending, In Progress, On Hold)
    if (p.projectStatus === "In Progress" || p.projectStatus === "Pending") {
      list.push({
        id: `review-${p.projectId}`,
        type: "review_needed",
        title: "Design Review Needed",
        description: `Project ${p.projectId} (${p.companyName}) status is "${p.projectStatus}". Direct milestone appraisal needed.`,
        projectId: p.projectId,
        time: "Pending"
      });
    }
    
    // 2. Check if embedded links are configured
    if (p.partALink) {
      list.push({
        id: `link-parta-${p.projectId}`,
        type: "link_added",
        title: "Drive Link Loaded (Part A)",
        description: `Source directory for Part A design has been mapped for ${p.companyName}.`,
        projectId: p.projectId,
        time: "Published"
      });
    }
    
    if (p.partBLink) {
      list.push({
        id: `link-partb-${p.projectId}`,
        type: "link_added",
        title: "Drive Link Loaded (Part B)",
        description: `Development directory for Part B has been populated for ${p.companyName}.`,
        projectId: p.projectId,
        time: "Published"
      });
    }

    if (p.acceptanceLink) {
      list.push({
        id: `link-acceptance-${p.projectId}`,
        type: "link_added",
        title: "New Acceptance Link Embedded",
        description: `Signed digital acceptance document has been linked for ${p.companyName}.`,
        projectId: p.projectId,
        time: "Published"
      });
    }

    if (p.finalDesignLink) {
      list.push({
        id: `link-final-${p.projectId}`,
        type: "link_added",
        title: "Final Designs Link Embedded",
        description: `Final approved packaging blueprint directory folder was synchronized for ${p.companyName}.`,
        projectId: p.projectId,
        time: "Published"
      });
    }
  });

  return list;
};

export default function App() {
  // Database States
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Shared Filter States for Projects across entire session
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [officeFilter, setOfficeFilter] = useState("All");
  const [quarterFilter, setQuarterFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setOfficeFilter("All");
    setQuarterFilter("All");
    setYearFilter("All");
  };

  const isAnyFilterActive =
    searchTerm !== "" ||
    statusFilter !== "All" ||
    officeFilter !== "All" ||
    quarterFilter !== "All" ||
    yearFilter !== "All";

  // Filter projects by search and status/location properties dynamically at parent level
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

  // Active Authenticated Session state
  const [activeUser, setActiveUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("gas_pm_active_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Force removal of any residual light-mode classes
  useEffect(() => {
    document.documentElement.classList.remove("light-mode");
    document.body.classList.remove("light-mode");
    localStorage.removeItem("gas_pm_theme");
  }, []);

  // App Navigation View States
  const [activeTab, setActiveTab] = useState<"dashboard" | "projects" | "users" | "design-review">("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  // Form Modals states
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isOpeningForm, setIsOpeningForm] = useState(false);

  // Toaster & Data Loading Tracking
  interface ToastAlert {
    id: string;
    projectId: string;
    companyName: string;
    linkLabel: string;
    url?: string;
    type?: "link" | "comment" | "reply" | "status" | "checklist" | "project_added";
    title?: string;
  }
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    const loadedProjects = getStoredProjects();
    setUsers(loadedUsers);
    setProjects(loadedProjects);
    setIsDataLoaded(true);
  }, []);

  // Update & Sync Active Auth Role if changed in User Management
  useEffect(() => {
    if (activeUser && users.length > 0) {
      const match = users.find((u) => u.email.toLowerCase() === activeUser.email.toLowerCase());
      if (!match) {
        alert("Session Revoked: Your active profile has been removed from the user database.");
        handleLogout();
      } else if (match.role !== activeUser.role || match.password !== activeUser.password) {
        setActiveUser(match);
        localStorage.setItem("gas_pm_active_user", JSON.stringify(match));
      }
    }
  }, [users, activeUser]);

  // Handle Logout
  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem("gas_pm_active_user");
    setActiveTab("dashboard");
  };

  // Safe tab fallback lock constraint for C/PSTO and Supervisor
  useEffect(() => {
    if (activeUser?.role === "C/PSTO" && activeTab !== "dashboard") {
      setActiveTab("dashboard");
    } else if (activeUser?.role === "Supervisor" && (activeTab === "projects" || activeTab === "users")) {
      setActiveTab("dashboard");
    }
  }, [activeUser, activeTab]);

  // Trigger Toast pop-up alert
  const triggerToastNotification = (
    proj: Project, 
    label: string, 
    url: string = "", 
    type: "link" | "comment" | "reply" | "status" | "checklist" | "project_added" = "link",
    title: string = "System Dispatch"
  ) => {
    const newToast: ToastAlert = {
      id: `toast-${Date.now()}-${Math.random()}`,
      projectId: proj.projectId,
      companyName: proj.companyName,
      linkLabel: label,
      url: url,
      type: type,
      title: title
    };
    setActiveToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 7000);
  };

  // Watcher for added links, status corrections, development comments & replies (detects when state undergoes mutations)
  const prevProjectsRef = React.useRef<Project[]>([]);

  useEffect(() => {
    if (!isDataLoaded) return;

    if (prevProjectsRef.current && prevProjectsRef.current.length > 0) {
      projects.forEach((proj) => {
        const prevProj = prevProjectsRef.current.find((p) => p.projectId === proj.projectId);
        
        // 1. Newly created project
        if (!prevProj) {
          triggerToastNotification(
            proj, 
            `A brand new project brief has been registered.`, 
            "", 
            "project_added", 
            "Project Created"
          );
          return;
        }

        // 2. Project Status change
        if (proj.projectStatus !== prevProj.projectStatus) {
          triggerToastNotification(
            proj, 
            `Stage updated successfully to matching tier "${proj.projectStatus}".`, 
            "", 
            "status", 
            "Status Shifted"
          );
        }

        // 3. Document or folder links added
        const linksToCheck: { key: keyof Project; label: string }[] = [
          { key: "partALink", label: "Part A Drive Folder" },
          { key: "partBLink", label: "Part B Drive Folder" },
          { key: "acceptanceLink", label: "Acceptance Sheet" },
          { key: "finalDesignLink", label: "Final Designs Link" },
        ];

        linksToCheck.forEach(({ key, label }) => {
          const currentVal = proj[key];
          const prevVal = prevProj[key];
          if (currentVal && !prevVal) {
            triggerToastNotification(proj, label, String(currentVal), "link", "Resource Linked");
          }
        });

        // 4. Checklist item transitions (drafts & acceptance release updates)
        if (proj.release1stDraft !== prevProj.release1stDraft) {
          triggerToastNotification(
            proj, 
            `Part A design brief releases set to ${proj.release1stDraft ? "Completed" : "Incomplete"}.`, 
            "", 
            "checklist", 
            "Checklist Updated"
          );
        }
        if (proj.release2ndDraft !== prevProj.release2ndDraft) {
          triggerToastNotification(
            proj, 
            `Part B revision uploads marked as ${proj.release2ndDraft ? "Completed" : "Incomplete"}.`, 
            "", 
            "checklist", 
            "Checklist Updated"
          );
        }
        if (proj.releaseFinalDesign !== prevProj.releaseFinalDesign) {
          triggerToastNotification(
            proj, 
            `Final artwork blueprint designated as ${proj.releaseFinalDesign ? "Authorized" : "Unauthorized"}.`, 
            "", 
            "checklist", 
            "Checklist Updated"
          );
        }
        if (proj.signedAcceptance !== prevProj.signedAcceptance) {
          triggerToastNotification(
            proj, 
            `Technical digital hand-off signed acceptance changed to "${proj.signedAcceptance}".`, 
            "", 
            "checklist", 
            "Checklist Updated"
          );
        }

        // 5. Developmental logs & comments added
        const currentComments = proj.comments || [];
        const prevComments = prevProj.comments || [];
        if (currentComments.length > prevComments.length) {
          const newComments = currentComments.filter(nc => !prevComments.some(pc => pc.id === nc.id));
          newComments.forEach(nc => {
            triggerToastNotification(
              proj, 
              `"${nc.content.length > 50 ? nc.content.substring(0, 47) + "..." : nc.content}" posted by ${nc.authorRole}.`, 
              "", 
              "comment", 
              "New Comment Posted"
            );
          });
        }

        // 6. Comments thread nested replies added
        currentComments.forEach(c => {
          const matchedPrevComment = prevComments.find(pc => pc.id === c.id);
          if (matchedPrevComment) {
            const curReplies = c.replies || [];
            const prevReplies = matchedPrevComment.replies || [];
            if (curReplies.length > prevReplies.length) {
              const newReplies = curReplies.filter(nr => !prevReplies.some(pr => pr.id === nr.id));
              newReplies.forEach(nr => {
                triggerToastNotification(
                  proj, 
                  `Reply: "${nr.content.length > 40 ? nr.content.substring(0, 37) + "..." : nr.content}" posted by ${nr.authorRole}.`, 
                  "", 
                  "reply", 
                  "Thread Reply Logged"
                );
              });
            }
          }
        });

      });
    }
    prevProjectsRef.current = JSON.parse(JSON.stringify(projects));
  }, [projects, isDataLoaded]);

  // Handle deep updates (comments, reviews) easily from child components
  const handleUpdateProject = (updatedProj: Project) => {
    const oldProj = projects.find((p) => p.projectId === updatedProj.projectId);
    if (oldProj) {
      const logs = [...(oldProj.activityLogs || [])];
      const timestampString = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // A. Compare Comments differences
      const currentComments = updatedProj.comments || [];
      const oldComments = oldProj.comments || [];
      if (currentComments.length > oldComments.length) {
        const latestComment = currentComments[currentComments.length - 1];
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "comment",
          message: `Added developmental note: "${latestComment.content.length > 55 ? latestComment.content.substring(0, 52) + "..." : latestComment.content}"`,
          userEmail: latestComment.authorEmail,
          userRole: latestComment.authorRole,
          timestamp: latestComment.timestamp || timestampString
        });
      } else if (currentComments.length === oldComments.length) {
        // Compare replies differences
        currentComments.forEach((c, idx) => {
          const oldC = oldComments[idx];
          if (oldC) {
            const curReplies = c.replies || [];
            const oldReplies = oldC.replies || [];
            if (curReplies.length > oldReplies.length) {
              const latestReply = curReplies[curReplies.length - 1];
              logs.unshift({
                id: `log-${Date.now()}-${Math.random()}`,
                type: "reply",
                message: `Replied in log: "${latestReply.content.length > 55 ? latestReply.content.substring(0, 52) + "..." : latestReply.content}"`,
                userEmail: latestReply.authorEmail,
                userRole: latestReply.authorRole,
                timestamp: latestReply.timestamp || timestampString
              });
            }
          }
        });
      }

      // B. Compare Status differences
      if (updatedProj.projectStatus !== oldProj.projectStatus) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "status_change",
          message: `Stage transitioned to "${updatedProj.projectStatus}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }

      // C. Compare Checklist items change
      if (updatedProj.release1stDraft !== oldProj.release1stDraft) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Part A Draft set to "${updatedProj.release1stDraft || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (updatedProj.release2ndDraft !== oldProj.release2ndDraft) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Part B Draft set to "${updatedProj.release2ndDraft || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (updatedProj.releaseFinalDesign !== oldProj.releaseFinalDesign) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Final Approved Design set to "${updatedProj.releaseFinalDesign || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (updatedProj.signedAcceptance !== oldProj.signedAcceptance) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Signed Acceptance set to "${updatedProj.signedAcceptance}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }

      // D. Compare Directory Link changes
      const linksToCheck: { key: keyof Project; label: string }[] = [
        { key: "partALink", label: "Part A Drive Folder" },
        { key: "partBLink", label: "Part B Drive Folder" },
        { key: "acceptanceLink", label: "Acceptance Sheet" },
        { key: "finalDesignLink", label: "Final Designs Link" },
      ];
      linksToCheck.forEach(({ key, label }) => {
        if (updatedProj[key] !== oldProj[key]) {
          logs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            type: "link_added",
            message: updatedProj[key]
              ? `Mapped new directory resource for ${label}`
              : `Removed directory resource for ${label}`,
            userEmail: activeUser?.email || "system",
            userRole: activeUser?.role || "GUEST",
            timestamp: timestampString
          });
        }
      });

      updatedProj.activityLogs = logs;
    }

    const updated = projects.map((p) => (p.projectId === updatedProj.projectId ? updatedProj : p));
    setProjects(updated);
    saveStoredProjects(updated);
  };

  // Synchronise Users Table (Admin only)
  const handleAddUser = (email: string, role: UserRole, password?: string) => {
    const updated = [...users, { email, role, password: password || "dost123" }];
    setUsers(updated);
    saveStoredUsers(updated);
  };

  const handleRemoveUser = (email: string) => {
    const updated = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    setUsers(updated);
    saveStoredUsers(updated);
  };

  // Synchronise Projects Table
  const handleSaveProject = (savedProj: Project) => {
    // BACKEND-STYLE DOUBLE VERIFICATION RULES SECURING THE ENDPOINT
    const isC_PSTO = activeUser?.role === "C/PSTO";
    const oldProj = projects.find((p) => p.projectId === savedProj.projectId);

    if (isC_PSTO) {
      alert("Operation Denied: Users with C/PSTO profiles are banned from registering or modifying project brief details.");
      return;
    }

    let updated: Project[];
    if (oldProj) {
      // Edit save
      const logs = [...(oldProj.activityLogs || [])];
      const timestampString = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (savedProj.projectStatus !== oldProj.projectStatus) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "status_change",
          message: `Stage updated from "${oldProj.projectStatus}" to "${savedProj.projectStatus}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }

      const linksToCheck: { key: keyof Project; label: string }[] = [
        { key: "partALink", label: "Part A Folder" },
        { key: "partBLink", label: "Part B Folder" },
        { key: "acceptanceLink", label: "Acceptance Sheet" },
        { key: "finalDesignLink", label: "Final Design Folder" },
      ];
      linksToCheck.forEach(({ key, label }) => {
        if (savedProj[key] !== oldProj[key]) {
          logs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            type: "link_added",
            message: savedProj[key]
              ? `Modified directory link for ${label}`
              : `Removed directory link for ${label}`,
            userEmail: activeUser?.email || "system",
            userRole: activeUser?.role || "GUEST",
            timestamp: timestampString
          });
        }
      });

      // Compare release check-offs if edited from Project Table / Form
      if (savedProj.release1stDraft !== oldProj.release1stDraft) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Set Part A delivery to "${savedProj.release1stDraft || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (savedProj.release2ndDraft !== oldProj.release2ndDraft) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Set Part B delivery to "${savedProj.release2ndDraft || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (savedProj.releaseFinalDesign !== oldProj.releaseFinalDesign) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Set Final approved layout to "${savedProj.releaseFinalDesign || "None"}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }
      if (savedProj.signedAcceptance !== oldProj.signedAcceptance) {
        logs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          type: "checklist_change",
          message: `Set technical customer acceptance to "${savedProj.signedAcceptance}"`,
          userEmail: activeUser?.email || "system",
          userRole: activeUser?.role || "GUEST",
          timestamp: timestampString
        });
      }

      savedProj.activityLogs = logs;
      updated = projects.map((p) => (p.projectId === savedProj.projectId ? savedProj : p));
    } else {
      // Creation
      savedProj.activityLogs = [{
        id: `log-${Date.now()}-${Math.random()}`,
        type: "system",
        message: "Project setup and requirement documentation registered.",
        userEmail: activeUser?.email || "system",
        userRole: activeUser?.role || "GUEST",
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }];
      updated = [...projects, savedProj];
    }

    setProjects(updated);
    saveStoredProjects(updated);
    setIsOpeningForm(false);
    setEditingProject(undefined);
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter((p) => p.projectId !== projectId);
    setProjects(updated);
    saveStoredProjects(updated);
  };

  const handleResetData = () => {
    if (confirm("Reset current simulator to factory DOST DAVAO demo defaults?")) {
      localStorage.removeItem("gas_pm_users");
      localStorage.removeItem("gas_pm_projects");
      localStorage.removeItem("gas_pm_active_user");
      window.location.reload();
    }
  };

  if (!activeUser) {
    return (
      <Login 
        users={users} 
        onLoginSuccess={(user) => {
          setActiveUser(user);
          localStorage.setItem("gas_pm_active_user", JSON.stringify(user));
        }} 
      />
    );
  }

  const isAdmin = activeUser.role === "Admin";
  const isC_PSTO = activeUser.role === "C/PSTO";
  const activeRole = activeUser.role;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#050505] text-slate-300 flex flex-col font-sans select-none">
      
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-x-hidden">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col shrink-0 lg:h-full lg:overflow-y-auto">
            {/* Header branding */}
            <div className="p-8 flex items-center space-x-3 border-b border-white/5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                <FolderHeart size={16} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-black tracking-[0.1em] text-white uppercase block">DOST DAVAO</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block -mt-1">P&amp;L Project Management</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 focus:outline-none">
              <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
              
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  activeTab === "dashboard"
                    ? "bg-white/5 text-indigo-400 border-white/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  activeTab === "dashboard" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" : "bg-slate-700"
                }`}></span>
                <span className="font-semibold uppercase text-xs tracking-wider">Dashboard</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    activeTab === "projects"
                      ? "bg-white/5 text-indigo-400 border-white/10"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === "projects" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" : "bg-slate-700"
                  }`}></span>
                  <span className="font-semibold uppercase text-xs tracking-wider">Project Folders</span>
                </button>
              )}

              {(isAdmin || activeRole === "Supervisor") && (
                <button
                  onClick={() => setActiveTab("design-review")}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    activeTab === "design-review"
                      ? "bg-white/5 text-indigo-400 border-white/10"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === "design-review" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" : "bg-slate-700"
                  }`}></span>
                  <span className="font-semibold uppercase text-xs tracking-wider">Design Dev &amp; Review</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    activeTab === "users"
                      ? "bg-white/5 text-indigo-400 border-white/10"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === "users" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" : "bg-slate-700"
                  }`}></span>
                  <span className="font-semibold uppercase text-xs tracking-wider">User Registry</span>
                </button>
              )}
            </nav>

            {/* Profile Footer Panel */}
            <div className="p-6 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 space-y-1.5 animate-fade-in">
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Active Profile</span>
                <p className="text-xs font-mono text-indigo-300 truncate font-semibold" title={activeUser.email}>{activeUser.email}</p>
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <select
                      value={activeUser.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        const emails: Record<UserRole, string> = {
                          "Admin": "admin@region11.dost.gov.ph",
                          "Supervisor": "supervisor@region11.dost.gov.ph",
                          "C/PSTO": "packaging@region11.dost.gov.ph"
                        };
                        const updated = {
                          email: emails[newRole],
                          role: newRole,
                          password: newRole.toLowerCase()
                        };
                        setActiveUser(updated);
                        localStorage.setItem("gas_pm_active_user", JSON.stringify(updated));
                      }}
                      className="bg-[#121214] border border-white/10 text-indigo-300 text-[10px] font-bold py-1 px-2 rounded-lg cursor-pointer focus:outline-none uppercase tracking-widest font-sans"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="C/PSTO">C/PSTO</option>
                    </select>
                    
                    <button
                      onClick={handleLogout}
                      className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer ml-2"
                      title="Log Out Session"
                    >
                      <LogOut size={11} />
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#050505]">
            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#070708] bg-opacity-[0.8] backdrop-blur-md sticky top-0 z-10">
              <div>
                <h1 className="text-xl md:text-2xl font-light text-white uppercase tracking-[0.15em]">
                  {activeTab === "dashboard" && (
                    <>KPI <span className="font-bold text-[#4f46e5]">Overview</span></>
                  )}
                  {activeTab === "projects" && (
                    <>Project <span className="font-bold text-[#4f46e5]">Briefs</span></>
                  )}
                  {activeTab === "design-review" && (
                    <>Design <span className="font-bold text-[#4f46e5]">Review</span> Board</>
                  )}
                  {activeTab === "users" && (
                    <>Security <span className="font-bold text-[#4f46e5]">Registry</span></>
                  )}
                  {activeTab === "gas-code" && (
                    <>Apps Script <span className="font-bold text-[#4f46e5]">Exporter</span></>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Notification Dropdown Component */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer relative"
                    title="System Notifications"
                  >
                    <Bell size={14} className={getNotificationsFromProjects(projects).length > 0 ? "animate-pulse text-violet-400" : ""} />
                    {getNotificationsFromProjects(projects).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-violet-600 text-white font-black rounded-full w-4 h-4 flex items-center justify-center text-[8px] border border-black">
                        {getNotificationsFromProjects(projects).length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden text-left divide-y divide-white/5">
                        <div className="p-4 bg-gradient-to-r from-violet-950/20 to-indigo-950/20 flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest text-violet-400 font-mono flex items-center gap-1.5">
                            <Sparkles size={12} className="text-violet-400 animate-spin" />
                            Gateway System Alerts
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold font-mono bg-indigo-500/10 text-indigo-400">
                            {getNotificationsFromProjects(projects).length} Events
                          </span>
                        </div>

                        <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                          {getNotificationsFromProjects(projects).length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-sans text-[11px] space-y-1">
                              <Bell size={24} className="mx-auto opacity-20 text-slate-400 mb-1" />
                              <p className="font-bold">Zero Alerts Issued</p>
                              <p>Any link enhancements or pending reviews will list here.</p>
                            </div>
                          ) : (
                            getNotificationsFromProjects(projects).map((notif) => (
                              <div key={notif.id} className="p-3.5 hover:bg-white/[0.01] transition-all flex gap-3">
                                <div className="mt-0.5">
                                  {notif.type === "link_added" ? (
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      <Globe size={11} />
                                    </div>
                                  ) : (
                                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                      <ShieldAlert size={11} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wide text-slate-200 truncate font-semibold">
                                      {notif.title}
                                    </span>
                                    <span className="text-[8px] font-mono bg-white/5 px-1.5 py-0.5 rounded font-bold text-slate-400 shrink-0 capitalize">
                                      {notif.time}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-normal mt-1 font-sans">
                                    {notif.description}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                                      ID: {notif.projectId}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setActiveTab("projects");
                                        setShowNotifications(false);
                                      }}
                                      className="text-[8px] font-bold text-slate-400 hover:text-white uppercase tracking-widest font-mono flex items-center gap-0.5 transition-colors"
                                    >
                                      Inspect Link &rarr;
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <span className="px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={11} className="text-indigo-400" />
                  DATABASE_ONLINE
                </span>
              </div>
            </header>

            {/* Page Canvas Render Body */}
            <div className="p-8 space-y-8 flex-1 font-sans">
              
              {activeTab === "dashboard" && (
                <div className="animate-fade-in flex flex-col gap-6">
                  {isAnyFilterActive && (
                    <div className="bg-[#0e0e11]/90 border border-indigo-500/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Active Dashboard Segment:
                        </span>
                        {officeFilter !== "All" && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Office: {officeFilter}
                          </span>
                        )}
                        {quarterFilter !== "All" && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Quarter: {quarterFilter}
                          </span>
                        )}
                        {yearFilter !== "All" && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Year: {yearFilter}
                          </span>
                        )}
                        {statusFilter !== "All" && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Status: {statusFilter}
                          </span>
                        )}
                        {searchTerm !== "" && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Search: "{searchTerm}"
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={handleResetFilters}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest font-mono cursor-pointer"
                      >
                        Reset Segment Filter
                      </button>
                    </div>
                  )}
                  <Dashboard 
                    projects={filteredProjects} 
                    role={activeRole}
                    yearFilter={yearFilter}
                    setYearFilter={setYearFilter}
                    quarterFilter={quarterFilter}
                    setQuarterFilter={setQuarterFilter}
                  />
                </div>
              )}

              {activeTab === "projects" && (
                <div className="animate-fade-in">
                  <ProjectTable
                    projects={projects}
                    role={activeRole}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    officeFilter={officeFilter}
                    setOfficeFilter={setOfficeFilter}
                    quarterFilter={quarterFilter}
                    setQuarterFilter={setQuarterFilter}
                    yearFilter={yearFilter}
                    setYearFilter={setYearFilter}
                    onAddNew={() => {
                      setEditingProject(undefined);
                      setIsOpeningForm(true);
                    }}
                    onEdit={(project) => {
                      setEditingProject(project);
                      setIsOpeningForm(true);
                    }}
                    onDelete={handleDeleteProject}
                    onSave={handleSaveProject}
                  />
                </div>
              )}

              {activeTab === "design-review" && (
                <div className="animate-fade-in">
                  <DesignReview
                    projects={filteredProjects}
                    currentUser={activeUser}
                    onUpdateProject={handleUpdateProject}
                  />
                </div>
              )}

              {activeTab === "users" && isAdmin && (
                <div className="animate-fade-in">
                  <UserManagement
                    users={users}
                    onAddUser={handleAddUser}
                    onRemoveUser={handleRemoveUser}
                    currentUserEmail={activeUser.email}
                  />
                </div>
              )}

            </div>
          </main>
        </div>

      {/* Project Add/Edit Overlay Modal */}
      {isOpeningForm && (
        <ProjectForm
          project={editingProject}
          role={activeRole}
          onClose={() => {
            setIsOpeningForm(false);
            setEditingProject(undefined);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* Floating Toast Notification Center */}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => {
          let accentColor = "border-l-emerald-500 border-emerald-500/30 text-emerald-400";
          let labelText = "System Link Dispatch";
          
          if (toast.type === "comment") {
            accentColor = "border-l-indigo-500 border-indigo-500/30 text-indigo-400";
            labelText = "Dev Log Comment";
          } else if (toast.type === "reply") {
            accentColor = "border-l-violet-500 border-violet-500/30 text-violet-400";
            labelText = "Thread Reply";
          } else if (toast.type === "status") {
            accentColor = "border-l-amber-500 border-amber-500/30 text-amber-500";
            labelText = "Status Corrected";
          } else if (toast.type === "checklist") {
            accentColor = "border-l-sky-500 border-sky-500/30 text-sky-400";
            labelText = "Checklist Approved";
          } else if (toast.type === "project_added") {
            accentColor = "border-l-rose-500 border-rose-500/30 text-rose-400";
            labelText = "New Project Registered";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-[#0a0a0e] border rounded-2xl p-4 shadow-2xl flex flex-col gap-1 border-l-4 ${accentColor} text-white animate-slide-in relative overflow-hidden`}
            >
              {/* Ambient background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center z-10">
                <span className="text-[9px] font-black uppercase tracking-widest font-mono">
                  {toast.title || labelText}
                </span>
                <button
                  onClick={() => setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-500 hover:text-white font-bold text-sm cursor-pointer ml-2 leading-none"
                >
                  &times;
                </button>
              </div>
              
              <p className="text-xs text-slate-100 font-black leading-snug mt-1.5 z-10">
                {toast.companyName}
              </p>
              
              <p className="text-[11px] text-slate-400 leading-normal z-10">
                {toast.type === "link" ? (
                  <>New link mapped for: <span className="text-indigo-450 text-indigo-400 font-semibold">{toast.linkLabel}</span></>
                ) : (
                  toast.linkLabel
                )}
              </p>
              
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 z-10">
                <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                  {toast.projectId}
                </span>
                {toast.url ? (
                  <a
                    href={toast.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest font-mono flex items-center gap-0.5 transition-colors pointer-events-auto"
                  >
                    Launch resource &rarr;
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
