export interface Case {
  id: string;
  firNumber: string;
  incidentDate: string;
  location: string;
  crimeCategory: string;
  complainantName: string;
  complainantAddress: string;
  complainantPhone: string;
  accusedName: string;
  accusedAddress: string;
  crimeDescription: string;
  status: string; // e.g. 'Open', 'Closed'
  createdAt: string;
  updatedAt: string;
  // Backward compatibility properties for visualizers:
  firId?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface DiaryEntry {
  id: string;
  caseId: string;
  date: string;
  activityType: string;
  description: string;
  officerNotes: string;
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  documentName: string;
  content: string;
  date: string;
  createdAt: string;
  // Backward compatibility properties for visualizers:
  docType?: "CASE_SUMMARY" | "INVESTIGATION_REPORT" | "FIR_COPY";
  generatedDate?: string;
  filePath?: string;
  reportSummary?: string;
  reportDetail?: string;
}

export interface Settings {
  id: string;
  name: string;
  email: string;
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  badgeNumber: string;
  fullName: string;
  role: string;
  department: string;
}
