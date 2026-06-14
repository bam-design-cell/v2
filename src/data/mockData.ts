import { Project, User } from "../types";

export const initialUsers: User[] = [
  { email: "admin@region11.dost.gov.ph", role: "Admin", password: "admin" },
  { email: "packaging@region11.dost.gov.ph", role: "C/PSTO", password: "packaging" },
  { email: "supervisor@region11.dost.gov.ph", role: "Supervisor", password: "supervisor" },
  { email: "psto.davao.del.sur@dost.gov.ph", role: "C/PSTO", password: "davaodelsur" },
  { email: "psto.davao.de.oro@dost.gov.ph", role: "C/PSTO", password: "davaodeoro" }
];

export const initialProjects: Project[] = [
  {
    projectId: "PROJ-2026-001",
    companyName: "Davao Cacao Artisans Corp.",
    product: "Premium Dark Chocolate Bar 70%",
    clientName: "Maria Teresa Santos",
    year: "2026",
    quarter: "1st Quarter",
    cityProvincialOffice: "Davao City",
    address: "Bago Oshiro, Tugbok District, Davao City",
    contactPerson: "Maria Teresa Santos",
    contactNumber: "+63 917 555 1234",
    datePlBriefReceived: "2026-03-01",
    dateCompletedBriefReceived: "2026-03-01",
    dateResponseSent: "2026-03-03",
    completedDocuments: "Yes",
    documentRemarks: "Approved by regional director",
    release1stDraft: "2026-03-15",
    release2ndDraft: "2026-03-25",
    releaseFinalDesign: "2026-04-05",
    signedAcceptance: "Yes",
    signedCsf: "Yes",
    designForwarded: "Yes",
    remarks: "Excellent feedback on the gold foil accent colors.",
    projectStatus: "Completed",
    daysElapsed: 35
  },
  {
    projectId: "PROJ-2026-002",
    companyName: "Mt. Apo Coffee Growers Cooperative",
    product: "Single Origin Arabica Coffee Label & Pouch",
    clientName: "Juan Dela Cruz",
    year: "2026",
    quarter: "2nd Quarter",
    cityProvincialOffice: "Davao del Sur",
    address: "Bansalan, Davao del Sur",
    contactPerson: "Juan Dela Cruz",
    contactNumber: "+63 920 888 4321",
    datePlBriefReceived: "2026-04-10",
    dateCompletedBriefReceived: "2026-04-10",
    dateResponseSent: "2026-04-12",
    completedDocuments: "Yes",
    documentRemarks: "MoU signed; awaiting final test results",
    release1stDraft: "2026-04-24",
    release2ndDraft: "2026-05-08",
    releaseFinalDesign: "2026-05-20",
    signedAcceptance: "Yes",
    signedCsf: "No",
    designForwarded: "Yes",
    remarks: "Design sent to printer; Customer satisfaction feedback pending.",
    projectStatus: "In Progress",
    daysElapsed: 40
  },
  {
    projectId: "PROJ-2026-003",
    companyName: "Malagos Agri-Ventures Inc.",
    product: "Gourmet Goat Cheese Box Prototype",
    clientName: "Roberto Puentespina",
    year: "2026",
    quarter: "2nd Quarter",
    cityProvincialOffice: "Davao City",
    address: "Bolcan Street, Agdao, Davao City",
    contactPerson: "Roberto Puentespina",
    contactNumber: "+63 918 333 7777",
    datePlBriefReceived: "2026-05-01",
    dateCompletedBriefReceived: "2026-05-01",
    dateResponseSent: "2026-05-04",
    completedDocuments: "Yes",
    documentRemarks: "Product specs document parsed",
    release1stDraft: "2026-05-18",
    release2ndDraft: "2026-06-01",
    releaseFinalDesign: "",
    signedAcceptance: "No",
    signedCsf: "No",
    designForwarded: "No",
    remarks: "Client requested minor revisions on back panel layout.",
    projectStatus: "In Progress",
    daysElapsed: 43
  },
  {
    projectId: "PROJ-2026-004",
    companyName: "Samal Island Mango Processing",
    product: "Vacuum Fried Mango Chips pouch 100g",
    clientName: "Elena Rodriguez",
    year: "2026",
    quarter: "2nd Quarter",
    cityProvincialOffice: "Davao del Norte",
    address: "Peñaplata, Island Garden City of Samal",
    contactPerson: "Elena Rodriguez",
    contactNumber: "+63 909 444 8888",
    datePlBriefReceived: "2026-05-20",
    dateCompletedBriefReceived: "",
    dateResponseSent: "2026-05-22",
    completedDocuments: "No",
    documentRemarks: "Awaiting legal registration papers",
    release1stDraft: "",
    release2ndDraft: "",
    releaseFinalDesign: "",
    signedAcceptance: "No",
    signedCsf: "No",
    designForwarded: "No",
    remarks: "Drafting paused until document verification.",
    projectStatus: "On Hold",
    daysElapsed: 24
  },
  {
    projectId: "PROJ-2026-005",
    companyName: "Gov. Gen. Generoso Coconut Cooperative",
    product: "Virgin Coconut Oil Glass Bottle Label",
    clientName: "Pedro Alcantara",
    year: "2026",
    quarter: "2nd Quarter",
    cityProvincialOffice: "Davao Oriental",
    address: "Poblacion, Governor Generoso, Davao Oriental",
    contactPerson: "Pedro Alcantara",
    contactNumber: "+63 928 222 5555",
    datePlBriefReceived: "2026-06-01",
    dateCompletedBriefReceived: "",
    dateResponseSent: "2026-06-03",
    completedDocuments: "No",
    documentRemarks: "Basic details registered",
    release1stDraft: "2026-06-12",
    release2ndDraft: "",
    releaseFinalDesign: "",
    signedAcceptance: "No",
    signedCsf: "No",
    designForwarded: "No",
    remarks: "1st draft released yesterday. Awaiting client review.",
    projectStatus: "Pending",
    daysElapsed: 12
  }
];

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem("gas_pm_users");
  if (!data) {
    localStorage.setItem("gas_pm_users", JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(data);
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem("gas_pm_users", JSON.stringify(users));
};

export const getStoredProjects = (): Project[] => {
  const data = localStorage.getItem("gas_pm_projects");
  if (!data) {
    const initialized = initialProjects.map(proj => {
      const logs: any[] = [];
      logs.push({
        id: `mock-log-1-${proj.projectId}`,
        type: "system",
        message: "Project setup and initial requirement profile configured.",
        userEmail: "admin@region11.dost.gov.ph",
        userRole: "Admin",
        timestamp: "Jun 1, 10:20 AM"
      });

      if (proj.release1stDraft) {
        logs.push({
          id: `mock-log-2-${proj.projectId}`,
          type: "checklist_change",
          message: `Part A draft finalized & uploaded on ${proj.release1stDraft}`,
          userEmail: "packaging@region11.dost.gov.ph",
          userRole: "C/PSTO",
          timestamp: "Jun 5, 2:15 PM"
        });
      }

      if (proj.release2ndDraft) {
        logs.push({
          id: `mock-log-3-${proj.projectId}`,
          type: "checklist_change",
          message: `Part B design revision compiled & published on ${proj.release2ndDraft}`,
          userEmail: "packaging@region11.dost.gov.ph",
          userRole: "C/PSTO",
          timestamp: "Jun 8, 4:30 PM"
        });
      }

      if (proj.releaseFinalDesign) {
        logs.push({
          id: `mock-log-4-${proj.projectId}`,
          type: "checklist_change",
          message: `Final approved package design published on ${proj.releaseFinalDesign}`,
          userEmail: "supervisor@region11.dost.gov.ph",
          userRole: "Supervisor",
          timestamp: "Jun 10, 11:00 AM"
        });
      }

      if (proj.signedAcceptance === "Yes") {
        logs.push({
          id: `mock-log-5-${proj.projectId}`,
          type: "checklist_change",
          message: "Signed customer acceptance hand-off form registered.",
          userEmail: "admin@region11.dost.gov.ph",
          userRole: "Admin",
          timestamp: "Jun 12, 11:45 AM"
        });
      }

      if (proj.projectStatus === "Completed") {
        logs.push({
          id: `mock-log-6-${proj.projectId}`,
          type: "status_change",
          message: `Project status changed to COMPLETED.`,
          userEmail: "supervisor@region11.dost.gov.ph",
          userRole: "Supervisor",
          timestamp: "Jun 13, 9:00 AM"
        });
      } else if (proj.projectStatus === "On Hold") {
        logs.push({
          id: `mock-log-6-${proj.projectId}`,
          type: "status_change",
          message: `Project status set to ON HOLD: ${proj.remarks}`,
          userEmail: "supervisor@region11.dost.gov.ph",
          userRole: "Supervisor",
          timestamp: "Jun 12, 3:10 PM"
        });
      }

      return {
        ...proj,
        activityLogs: logs.reverse()
      };
    });
    localStorage.setItem("gas_pm_projects", JSON.stringify(initialized));
    return initialized;
  }
  return JSON.parse(data);
};

export const saveStoredProjects = (projects: Project[]) => {
  localStorage.setItem("gas_pm_projects", JSON.stringify(projects));
};
