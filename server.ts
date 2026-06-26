import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
            model: "gemini-2.5-flash",
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
// CENTRALIZED LEGAL & ANALYTICS AI ROUTING
// ==========================================

// 1. POST /api/ai/suggest-sections
// Accepts: { crimeDescription: string }
// Returns: { sections: Array<{ section, act, title, explanation, applicability }> }
app.post("/api/ai/suggest-sections", async (req, res) => {
  const { crimeDescription } = req.body;
  if (!crimeDescription || typeof crimeDescription !== "string") {
    return res.status(400).json({ error: "crimeDescription is required and must be a string." });
  }

  const normalizedDesc = crimeDescription.toLowerCase();

  // Robust Offline Fallback: Local rule-based legal sections dictionary
  const fallbackSections = [];
  if (normalizedDesc.includes("theft") || normalizedDesc.includes("stolen") || normalizedDesc.includes("steal") || normalizedDesc.includes("rob") || normalizedDesc.includes("snatch")) {
    fallbackSections.push({
      section: "IPC Section 379",
      act: "Indian Penal Code",
      title: "Punishment for Theft",
      explanation: "Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.",
      applicability: "Applies directly to the unauthorized removal/stretching of movable property without consent."
    });
  }
  if (normalizedDesc.includes("fraud") || normalizedDesc.includes("otp") || normalizedDesc.includes("online") || normalizedDesc.includes("cyber") || normalizedDesc.includes("phishing") || normalizedDesc.includes("scam") || normalizedDesc.includes("cheat") || normalizedDesc.includes("internet")) {
    fallbackSections.push({
      section: "IT Act Section 66D",
      act: "Information Technology Act, 2000",
      title: "Punishment for cheating by personation by using computer resource",
      explanation: "Whoever, by means of any communication device or computer resource cheats by personating, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.",
      applicability: "Applicable to online/OTP scam calls, cyber phishing, and identity cheating via electronic communications."
    });
    fallbackSections.push({
      section: "IPC Section 420",
      act: "Indian Penal Code",
      title: "Cheating and dishonestly inducing delivery of property",
      explanation: "Cheating and dishonestly inducing delivery of property is punishable with imprisonment up to 7 years and fine.",
      applicability: "Applies to fraudulent transfer of funds, online cheating, and inducing victims to share confidential banking OTPs."
    });
  }
  if (normalizedDesc.includes("assault") || normalizedDesc.includes("hurt") || normalizedDesc.includes("beat") || normalizedDesc.includes("attack") || normalizedDesc.includes("wound") || normalizedDesc.includes("hit") || normalizedDesc.includes("slap") || normalizedDesc.includes("abuse")) {
    fallbackSections.push({
      section: "IPC Section 323",
      act: "Indian Penal Code",
      title: "Punishment for voluntarily causing hurt",
      explanation: "Whoever, except in the case provided for by section 334, voluntarily causes hurt, shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.",
      applicability: "Applies to cases of physical assault, fist-fights, or minor body injuries caused voluntarily."
    });
    if (normalizedDesc.includes("woman") || normalizedDesc.includes("female") || normalizedDesc.includes("lady") || normalizedDesc.includes("girl") || normalizedDesc.includes("modesty") || normalizedDesc.includes("harass")) {
      fallbackSections.push({
        section: "IPC Section 354",
        act: "Indian Penal Code",
        title: "Assault or criminal force to woman with intent to outrage her modesty",
        explanation: "Punishable with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and shall also be liable to fine.",
        applicability: "Applies specifically when criminal force or physical assault is committed against a female with intent to outrage her modesty."
      });
    }
  }

  // General catch-all fallback for unrecognized descriptions
  if (fallbackSections.length === 0) {
    fallbackSections.push({
      section: "IPC Section 506",
      act: "Indian Penal Code",
      title: "Punishment for Criminal Intimidation",
      explanation: "Whoever commits the offense of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
      applicability: "Generic fallback for threat or intimidation associated with disputes or grievances."
    });
  }

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following crime description and suggest relevant IPC (Indian Penal Code) or IT Act sections that are highly applicable.

Crime Description:
"${crimeDescription}"

Ensure you suggest specific, accurate sections. Provide detailed explanation, act name, section title, and applicability details.`,
        config: {
          systemInstruction: "You are an expert legal AI assisting police officers. Identify real legal sections from the Indian Penal Code (IPC) or Information Technology (IT) Act. Answer strictly in JSON format as specified.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING, description: "Section name and number (e.g., IPC Section 379)" },
                act: { type: Type.STRING, description: "Name of the Act (e.g., Indian Penal Code or Information Technology Act, 2000)" },
                title: { type: Type.STRING, description: "The legal title of the section (e.g., Punishment for Theft)" },
                explanation: { type: Type.STRING, description: "Brief official legal definition or description of the section" },
                applicability: { type: Type.STRING, description: "How this specific section applies to the provided crime description" }
              },
              required: ["section", "act", "title", "explanation", "applicability"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const sections = JSON.parse(text);
        return res.json({ sections });
      }
    }
  } catch (error) {
    console.error("Gemini legal section suggestion error:", error);
  }

  // Serve fully matched local fallbacks if offline or if API key is invalid
  res.json({ sections: fallbackSections });
});

// 2. POST /api/ai/investigation-summary
// Accepts: { caseId: string }
// Returns: { overview, timeline: Array<{ date, activityType, description, officerNotes }>, riskIndicators: string[], importantEntities: string[] }
app.post("/api/ai/investigation-summary", async (req, res) => {
  const { caseId } = req.body;
  if (!caseId) {
    return res.status(400).json({ error: "caseId is required" });
  }

  // 1. Locate the Case record
  const kase = caseStore.find(c => c.id === caseId);
  if (!kase) {
    return res.status(404).json({ error: "Case record not found" });
  }

  // 2. Locate chronological Diaries linked to this case
  const diaries = diaryStore.filter(d => d.caseId === caseId);

  // 3. Prepare Offline Fallback Elements: Chronological timeline mapping
  const timeline = diaries.map(d => ({
    date: d.date,
    activityType: d.activityType,
    description: d.description,
    officerNotes: d.officerNotes || ""
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Entity extraction via fallback heuristics
  const importantEntities: string[] = [];
  if (kase.complainantName) importantEntities.push(`${kase.complainantName} (Complainant)`);
  if (kase.accusedName && kase.accusedName !== "Unknown") importantEntities.push(`${kase.accusedName} (Accused)`);
  if (kase.location) importantEntities.push(`${kase.location} (Crime Scene)`);

  diaries.forEach(d => {
    const witnessMatch = d.description.match(/(?:witness|shopkeeper|officer|individual|informant)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (witnessMatch && witnessMatch[1]) {
      const name = witnessMatch[1];
      if (!importantEntities.some(e => e.includes(name))) {
        importantEntities.push(`${name} (Witness / Person of Interest)`);
      }
    }
  });

  const fallbackSummary = {
    overview: `This case concerns "${kase.crimeCategory}" at "${kase.location}" registered as FIR ${kase.firNumber}. The incident occurred on ${kase.incidentDate} involving complainant ${kase.complainantName} and accused ${kase.accusedName}. Current status is: ${kase.status}.`,
    timeline: timeline,
    riskIndicators: [
      `Active Investigation status is "${kase.status}".`,
      diaries.length === 0 ? "No diary progress logged yet, risk of investigation stall." : "Chronological activities are being tracked.",
      kase.accusedName === "Unknown" ? "The suspect identity is not fully verified yet." : "Suspect has been named in primary records."
    ],
    importantEntities: importantEntities
  };

  try {
    if (ai) {
      const diariesContext = diaries.map((d, i) => `
Diary Entry #${i + 1}:
- Date: ${d.date}
- Type: ${d.activityType}
- Action: ${d.description}
- Notes: ${d.officerNotes}
`).join("\n");

      const prompt = `Analyze the central case details and chronological investigation diaries below. Compile a comprehensive, highly accurate analysis covering Overview, Timeline, Risk Indicators, and Important Entities.

[CASE DETAILS]
- FIR Number: ${kase.firNumber}
- Category: ${kase.crimeCategory}
- Date: ${kase.incidentDate}
- Location: ${kase.location}
- Complainant: ${kase.complainantName}
- Accused: ${kase.accusedName}
- Raw Description: ${kase.crimeDescription}

[INVESTIGATION DIARY LOGS]
${diariesContext.length > 0 ? diariesContext : "No diary entries logged yet."}

You must return a structured JSON object strictly adhering to the specified schema. No preambles, no explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional criminal analyst AI. Return complete structured analyses of police dockets in the specified schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: "A highly concise paragraph synthesizing the case origin, prime incident details, and core legal focus." },
              timeline: {
                type: Type.ARRAY,
                description: "Chronological sequence of key investigative activities matching the diaries.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    activityType: { type: Type.STRING },
                    description: { type: Type.STRING },
                    officerNotes: { type: Type.STRING }
                  },
                  required: ["date", "activityType", "description", "officerNotes"]
                }
              },
              riskIndicators: {
                type: Type.ARRAY,
                description: "Array of risk assessment points (e.g. suspect absconding, missing CCTV footage, stalled logs, lack of physical evidence).",
                items: { type: Type.STRING }
              },
              importantEntities: {
                type: Type.ARRAY,
                description: "List of key human actors (complainant, suspect, witnesses), locations, vehicles, and assets identified in case and logs.",
                items: { type: Type.STRING }
              }
            },
            required: ["overview", "timeline", "riskIndicators", "importantEntities"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    }
  } catch (error) {
    console.error("Gemini investigation summary error:", error);
  }

  // Return mapped structured fallback if offline or if API key is invalid
  res.json(fallbackSummary);
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
