export type UserRole = "Admin" | "C/PSTO" | "Supervisor";

export interface User {
  email: string;
  role: UserRole;
  password?: string;
}

export interface ProjectCommentReply {
  id: string;
  authorEmail: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface ProjectComment {
  id: string;
  authorEmail: string;
  authorRole: string;
  content: string;
  timestamp: string;
  replies?: ProjectCommentReply[];
}

export interface ProjectActivityLog {
  id: string;
  type: "status_change" | "comment" | "reply" | "link_added" | "checklist_change" | "system";
  message: string;
  userEmail: string;
  userRole: string;
  timestamp: string;
}

export interface Project {
  projectId: string; // Project ID
  companyName: string; // Company Name
  product: string; // Product
  clientName: string; // Client Name
  year: string; // Year
  quarter: string; // Quarter
  cityProvincialOffice: string; // City and Provincial Office
  address: string; // Address
  contactPerson: string; // Contact Person
  contactNumber: string; // Contact Number
  datePlBriefReceived: string; // Date PL Brief Received
  dateCompletedBriefReceived: string; // Date Completed Brief Received
  dateResponseSent: string; // Date Response Sent
  completedDocuments: string; // Completed Documents
  documentRemarks: string; // Document Remarks
  release1stDraft: string; // Release 1st Draft
  release2ndDraft: string; // Release 2nd Draft
  releaseFinalDesign: string; // Release Final Design
  signedAcceptance: string; // Signed Acceptance
  signedCsf: string; // Signed CSF
  designForwarded: string; // Design Forwarded
  remarks: string; // Remarks
  projectStatus: string; // Project Status
  daysElapsed: number; // Days Elapsed
  partALink?: string; // Google Drive Part A Link
  partBLink?: string; // Google Drive Part B Link
  acceptanceLink?: string; // Acceptance Sheet Link
  finalDesignLink?: string; // Final Designs Link
  comments?: ProjectComment[];
  activityLogs?: ProjectActivityLog[];
}
