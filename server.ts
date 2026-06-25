import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import type { Case, DiaryEntry, Document, Settings } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Shared in-memory mock database store containing unified Case & FIR data as requested
let caseStore: Case[] = [
  {
    id: "case-001",
    firNumber: "FIR/2026/00142",
    incidentDate: "2026-06-15",
    location: "Main Street Market Area, Sector 4",
    crimeCategory: "Grand Theft Auto",
    complainantName: "Arthur Dent",
    complainantAddress: "42 Bypass Road, Countryside",
    complainantPhone: "+1-555-0142",
    accusedName: "John Doe (Alias: 'Slick')",
    accusedAddress: "Unknown",
    crimeDescription: "The complainant reports that his metallic-grey luxury sedan was parked in front of the market at 14:00. Upon returning at 15:30, the vehicle was missing. Broken safety glass was found on the asphalt.",
    status: "Open",
    createdAt: "2026-06-15T16:00:00Z",
    updatedAt: "2026-06-20T11:00:00Z",
    // Compatibility fields
    firId: "case-001",
    createdDate: "2026-06-15T16:00:00Z",
    updatedDate: "2026-06-20T11:00:00Z"
  }
];

let diaryStore: DiaryEntry[] = [
  {
    id: "diary-101",
    caseId: "case-001",
    date: "2026-06-16",
    activityType: "SPOT_VISIT",
    description: "Conducted field visit at Main Street Market. Inspected CCTV camera #12 located on the corner store.",
    officerNotes: "CCTV shows a male individual in a dark hoodie approaching the car at 14:45. Footages requested officially from the store owner.",
    createdAt: "2026-06-16T10:00:00Z"
  },
  {
    id: "diary-102",
    caseId: "case-001",
    date: "2026-06-18",
    activityType: "WITNESS_STATEMENT",
    description: "Interrogated shopkeeper Sarah Miller of Sarah's Florist.",
    officerNotes: "Witness states she saw a man matching 'Slick' loitering around the parked vehicle at 14:30. She noted he carried a heavy canvas bag.",
    createdAt: "2026-06-18T14:30:00Z"
  }
];

let documentStore: Document[] = [];

let settingsStore: Settings = {
  id: "setting-001",
  name: "Detective Alexander Stone",
  email: "alexander.stone@precinct.gov",
  theme: "light"
};

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// ==========================================
// REST API ROUTES
// ==========================================

// Auth Endpoint
app.post("/api/auth/login", (req, res) => {
  const { badgeNumber, password } = req.body;
  if (!badgeNumber || !password) {
    return res.status(400).json({ error: "Badge number and password are required" });
  }
  res.json({
    success: true,
    token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJvZmYtOTkiLCJiYWRnZSI6IiR7YmFkZ2VOdW1iZXJ9Iiwicm9sZSI6IklOVkVTVElHQVRJTkdfT0ZGSUNFUiJ9.signature`,
    user: {
      id: "off-99",
      badgeNumber,
      fullName: settingsStore.name,
      role: "INVESTIGATING_OFFICER",
      department: "Criminal Investigation Department (CID)"
    }
  });
});

// 1. FIR & Case Management API
// GET all FIRs
app.get(["/api/fir", "/api/firs"], (req, res) => {
  // Return caseStore mapped as FIRs for backwards compatibility with frontends
  const mapped = caseStore.map(c => ({
    id: c.id,
    firNumber: c.firNumber,
    incidentDate: c.incidentDate,
    location: c.location,
    crimeCategory: c.crimeCategory,
    complainantName: c.complainantName,
    complainantAddress: c.complainantAddress,
    complainantPhone: c.complainantPhone,
    accusedName: c.accusedName,
    accusedAddress: c.accusedAddress,
    crimeDescription: c.crimeDescription
  }));
  res.json(mapped);
});

// POST create a Case Docket combining FIR and Case details
app.post(["/api/fir", "/api/firs"], (req, res) => {
  const { firNumber, incidentDate, location, crimeCategory, complainantName, complainantAddress, complainantPhone, accusedName, accusedAddress, crimeDescription } = req.body;
  
  if (!firNumber || !complainantName || !crimeDescription) {
    return res.status(400).json({ error: "FIR Number, Complainant Name, and Crime Description are required." });
  }

  const newCase: Case = {
    id: `case-${Date.now()}`,
    firNumber,
    incidentDate: incidentDate || new Date().toISOString().split("T")[0],
    location: location || "Unknown",
    crimeCategory: crimeCategory || "Uncategorized",
    complainantName,
    complainantAddress: complainantAddress || "",
    complainantPhone: complainantPhone || "",
    accusedName: accusedName || "Unknown",
    accusedAddress: accusedAddress || "",
    crimeDescription,
    status: "Open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Compatibility fields
    firId: `case-${Date.now()}`,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  };

  caseStore.push(newCase);

  // Return structure compatible with expected client outcomes
  res.status(201).json({ 
    fir: { ...newCase, id: newCase.id }, 
    case: { ...newCase, firId: newCase.id } 
  });
});

// GET detailed FIR by ID
app.get("/api/fir/:id", (req, res) => {
  const kase = caseStore.find(c => c.id === req.params.id);
  if (!kase) return res.status(404).json({ error: "FIR not found" });
  res.json({
    id: kase.id,
    firNumber: kase.firNumber,
    incidentDate: kase.incidentDate,
    location: kase.location,
    crimeCategory: kase.crimeCategory,
    complainantName: kase.complainantName,
    complainantAddress: kase.complainantAddress,
    complainantPhone: kase.complainantPhone,
    accusedName: kase.accusedName,
    accusedAddress: kase.accusedAddress,
    crimeDescription: kase.crimeDescription
  });
});

// PUT update an FIR by ID
app.put("/api/fir/:id", (req, res) => {
  const idx = caseStore.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "FIR not found" });
  caseStore[idx] = { 
    ...caseStore[idx], 
    ...req.body,
    updatedAt: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  };
  res.json(caseStore[idx]);
});

// DELETE a Case
app.delete("/api/fir/:id", (req, res) => {
  const id = req.params.id;
  caseStore = caseStore.filter(c => c.id !== id);
  diaryStore = diaryStore.filter(d => d.caseId !== id);
  documentStore = documentStore.filter(doc => doc.caseId !== id);
  res.json({ message: "Case and associated dockets deleted successfully." });
});

// GET all Cases
app.get(["/api/case", "/api/cases"], (req, res) => {
  const mapped = caseStore.map(c => ({
    ...c,
    firId: c.id,
    createdDate: c.createdAt,
    updatedDate: c.updatedAt
  }));
  res.json(mapped);
});

// GET detailed Case information by ID
app.get("/api/cases/:id", (req, res) => {
  const kase = caseStore.find(c => c.id === req.params.id);
  if (!kase) return res.status(404).json({ error: "Case not found" });
  res.json({
    ...kase,
    firId: kase.id,
    createdDate: kase.createdAt,
    updatedDate: kase.updatedAt
  });
});

// PUT update Case status or details
app.put("/api/cases/:id", (req, res) => {
  const idx = caseStore.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Case not found" });
  
  caseStore[idx] = { 
    ...caseStore[idx], 
    ...req.body,
    updatedAt: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  };
  res.json(caseStore[idx]);
});

// 2. Case Diary API
// GET all investigation diary entries for a specific case, sorted chronologically
app.get(["/api/diary/:caseId", "/api/cases/:caseId/diary"], (req, res) => {
  const caseId = req.params.caseId;
  const entries = diaryStore.filter(d => d.caseId === caseId);
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(sorted);
});

// POST add a new investigation diary entry
app.post(["/api/diary", "/api/cases/:caseId/diary"], (req, res) => {
  const caseId = req.params.caseId || req.body.caseId;
  const { date, activityType, description, officerNotes } = req.body;
  
  if (!caseId || !activityType || !description) {
    return res.status(400).json({ error: "Case ID, Activity Type, and Description are required." });
  }

  // Ensure case exists
  const kase = caseStore.find(c => c.id === caseId);
  if (!kase) {
    return res.status(404).json({ error: "Target case record not found" });
  }

  const newEntry: DiaryEntry = {
    id: `diary-${Date.now()}`,
    caseId,
    date: date || new Date().toISOString().split("T")[0],
    activityType,
    description,
    officerNotes: officerNotes || "",
    createdAt: new Date().toISOString()
  };

  diaryStore.push(newEntry);

  // Touch parent Case's updated timestamp and automatically transition status if needed
  kase.updatedAt = new Date().toISOString();
  kase.updatedDate = new Date().toISOString();
  if (kase.status === "Open") {
    kase.status = "Under Investigation";
  }

  res.status(201).json(newEntry);
});

// PUT edit a specific diary entry
app.put("/api/cases/:caseId/diary/:entryId", (req, res) => {
  const { caseId, entryId } = req.params;
  const idx = diaryStore.findIndex(d => d.id === entryId && d.caseId === caseId);
  if (idx === -1) {
    return res.status(404).json({ error: "Diary entry not found" });
  }

  diaryStore[idx] = {
    ...diaryStore[idx],
    ...req.body,
    id: entryId, 
    caseId 
  };

  const kase = caseStore.find(c => c.id === caseId);
  if (kase) {
    kase.updatedAt = new Date().toISOString();
    kase.updatedDate = new Date().toISOString();
  }

  res.json(diaryStore[idx]);
});

// DELETE a specific diary entry
app.delete("/api/cases/:caseId/diary/:entryId", (req, res) => {
  const { caseId, entryId } = req.params;
  const idx = diaryStore.findIndex(d => d.id === entryId && d.caseId === caseId);
  if (idx === -1) {
    return res.status(404).json({ error: "Diary entry not found" });
  }

  diaryStore.splice(idx, 1);

  const kase = caseStore.find(c => c.id === caseId);
  if (kase) {
    kase.updatedAt = new Date().toISOString();
    kase.updatedDate = new Date().toISOString();
  }

  res.json({ success: true, message: "Diary entry deleted successfully." });
});

// 3. AI Integration API
// POST generate report summary/text using Case Details & Diary Entries via Gemini
app.post(["/api/report/generate", "/api/reports/generate"], async (req, res) => {
  const { caseId, docType } = req.body;
  if (!caseId || !docType) {
    return res.status(400).json({ error: "Case ID and Document Type (CASE_SUMMARY | INVESTIGATION_REPORT) are required" });
  }

  // 1. Locate Case
  const kase = caseStore.find(c => c.id === caseId);
  if (!kase) return res.status(404).json({ error: "Case record not found" });

  // 2. Locate Case Diaries
  const diaries = diaryStore.filter(d => d.caseId === caseId);

  // 3. Construct grounded prompts
  const diariesContext = diaries.map((d, i) => `
Diary Entry #${i + 1}:
- Date: ${d.date}
- Type: ${d.activityType}
- Action Performed: ${d.description}
- Officer Raw Notes: ${d.officerNotes}
`).join("\n");

  const systemInstruction = `
You are an expert police investigation documentation AI for "SmartCase AI".
Your output will be used directly as official legal investigation records.

CRITICAL MISTRUST POLICY:
- Absolute facts only! DO NOT invent, assume, extrapolate, or hallucinate names, dates, times, locations, suspects, vehicles, items, or witnesses.
- If a detail is missing from the provided context (FIR and Case Diary), state "NOT APPLICABLE" or "REMAINING UNKNOWN".
- Your output must be strictly formatted under clear headers. No commentary, no friendly preamble, no meta-notes.
`;

  const prompt = `
Generate a professional, structured ${docType === "CASE_SUMMARY" ? "Case Summary Report" : "Detailed Investigation Report"}.

### INPUT DATA SOURCED DIRECTLY FROM THE PRIMARY RECORD:

[CASE & FIR RECORD]
- FIR Reference Number: ${kase.firNumber}
- Category: ${kase.crimeCategory}
- Date of Incident: ${kase.incidentDate}
- Incident Location: ${kase.location}
- Complainant: ${kase.complainantName} (Addr: ${kase.complainantAddress}, Tel: ${kase.complainantPhone})
- Named Accused: ${kase.accusedName} (Addr: ${kase.accusedAddress})
- Primary Complaint Details: ${kase.crimeDescription}

[CHRONOLOGICAL CASE DIARY ENTRIES]
${diariesContext.length > 0 ? diariesContext : "No diary progress logged yet."}

### REQUIRED STRUCTURAL HEADERS FOR YOUR OUTPUT:

1. EXECUTIVE OVERVIEW (A formal, objective synthesis of the crime and status)
2. CRIME DETAILS (Category, incident coordinates, and victim/accused records)
3. INVESTIGATION TIMELINE & LOGS (Surgical chronology of SPOT VISITs, WITNESS STATEMENTs, and concrete actions taken based exclusively on Case Diary logs)
4. EVIDENCE ANALYSIS & CURRENT OUTCOMES
5. NEXT DOCUMENTED STEPS
`;

    const generateFallbackText = () => `[OFFLINE MODE / HIGH DEMAND FALLBACK]
      
1. EXECUTIVE OVERVIEW
The investigation for Case Ref ${kase.firNumber} (Category: ${kase.crimeCategory}) at ${kase.location} was registered based on the report filed by ${kase.complainantName}. The suspect named in the report is ${kase.accusedName}.

2. CRIME DETAILS
- Incident Date: ${kase.incidentDate}
- Victim: ${kase.complainantName}
- Accused: ${kase.accusedName}
- Complaint: ${kase.crimeDescription}

3. INVESTIGATION TIMELINE & LOGS
${diaries.map(d => `- [${d.date}] Action: ${d.activityType}. ${d.description}. Officer notes indicate: ${d.officerNotes}`).join("\n")}

4. EVIDENCE ANALYSIS & CURRENT OUTCOMES
Analysis of witness statements and spots visited indicates early investigative pathways are being pursued. All statements matches the primary complaint without contradictions.

5. NEXT DOCUMENTED STEPS
Request formal digital assets, proceed with interrogations, and finalize the charge-sheet.`;

    try {
      let resultText = "";

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.1, 
            }
          });
          resultText = response.text || "Report generation succeeded, but returned blank.";
        } catch (apiError: any) {
          console.error("Gemini API Error, falling back to offline mode:", apiError.message);
          resultText = generateFallbackText();
        }
      } else {
        resultText = generateFallbackText();
      }

      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        caseId,
        documentName: docType === "CASE_SUMMARY" ? "Case Summary Report" : "Detailed Investigation Report",
        content: resultText,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        // Compatibility fields for UI visualizer
        docType: docType as any,
        generatedDate: new Date().toISOString(),
        filePath: `/documents/doc-${Date.now()}.pdf`,
        reportSummary: `${docType === "CASE_SUMMARY" ? "Case Summary" : "Investigation Report"} for ${kase.firNumber}`,
        reportDetail: resultText
      };

      documentStore.push(newDoc);
      res.status(201).json(newDoc);

  } catch (error: any) {
    console.error("AI report compilation error:", error);
    res.status(500).json({ error: "Failed to generate report via Gemini. Please verify your API Key.", message: error.message });
  }
});

// 4. Document Storage API
// POST save a generated report/document manually
app.post("/api/documents", (req, res) => {
  const { caseId, docType, reportSummary, reportDetail, documentName, content, date } = req.body;
  
  const finalContent = content || reportDetail;
  const finalDocName = documentName || reportSummary || `${docType} created manually`;

  if (!caseId || !finalContent) {
    return res.status(400).json({ error: "Case ID and document content are required." });
  }

  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    caseId,
    documentName: finalDocName,
    content: finalContent,
    date: date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    // Compatibility fields
    docType: docType || "CASE_SUMMARY",
    generatedDate: new Date().toISOString(),
    filePath: `/documents/doc-${Date.now()}.pdf`,
    reportSummary: finalDocName,
    reportDetail: finalContent
  };

  documentStore.push(newDoc);
  res.status(201).json(newDoc);
});

// GET list of all saved documents
app.get("/api/documents", (req, res) => {
  res.json(documentStore);
});

// GET specific document for download or viewing
app.get(["/api/documents/:id", "/api/documents/:id/download"], (req, res) => {
  const doc = documentStore.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

// GET all documents for a specific case
app.get("/api/case/documents/:caseId", (req, res) => {
  const docs = documentStore.filter(d => d.caseId === req.params.caseId);
  res.json(docs);
});

// DELETE a saved report
app.delete("/api/documents/:id", (req, res) => {
  const idx = documentStore.findIndex(d => d.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Document not found" });
  }
  documentStore.splice(idx, 1);
  res.json({ success: true, message: "Document deleted successfully." });
});

// 5. Settings API
// GET Settings
app.get("/api/settings", (req, res) => {
  res.json(settingsStore);
});

// PUT update Settings
app.put("/api/settings", (req, res) => {
  settingsStore = {
    ...settingsStore,
    ...req.body
  };
  res.json(settingsStore);
});

// ==========================================
// VITE DEV SERVER OR STATIC FALLBACK
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCase AI Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
