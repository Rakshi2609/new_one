import type { ActionPlan, MedicalDocument, ClinicalNote, UploadResponse } from "@/types/models";

export const mockDocuments: MedicalDocument[] = [
  {
    document_type: "operation_report",
    patient_name: "Pierre Muller",
    doctor_name: "Dr. Laurent Muller",
    doctor_id: null,
    date: "2026-04-10",
    medications: [],
    procedure: "Ureteroscopy scheduled for 2026-04-24",
    diagnosis: "Urolithiasis — right proximal ureter calculus (8mm)",
    operative_findings: null,
    post_op_instructions: [
      "ECBU (urine culture) required 7 days before the procedure",
      "Urea and creatinine blood test required 7 days before the procedure",
      "48h rest post-procedure, no driving",
      "Mention current lithium treatment to the urologist before intervention",
    ],
    follow_up: "Follow-up consultation 15 days after the procedure at CHU Nîmes — Urologie",
    notes:
      "Patient on long-term lithium therapy (400mg/day, psychiatric follow-up with Dr. Faure). Lives alone, 3rd floor no elevator — transport required post-procedure.",
  },
  {
    document_type: "prescription",
    patient_name: "Pierre Muller",
    doctor_name: "Dr. Laurent Muller",
    doctor_id: null,
    date: "2026-04-10",
    medications: [
      {
        name: "Amoxicilline",
        dosage: "1g",
        frequency: "twice a day",
        duration: "5 days post-op",
        route: "oral",
        instructions: "Take with food. Alert doctor if allergic reaction.",
      },
      {
        name: "Lithium (Téralithe 400)",
        dosage: "400mg",
        frequency: "once a day (evening)",
        duration: "ongoing",
        route: "oral",
        instructions: "Existing treatment — do not stop without psychiatrist approval. Monitor lithium levels around procedure.",
      },
    ],
    procedure: null,
    diagnosis: null,
    operative_findings: null,
    post_op_instructions: [],
    follow_up: null,
    notes: null,
  },
];

export const mockClinicalNote: ClinicalNote = {
  patient_name: "Pierre Muller",
  practitioner: "Dr. Laurent Muller",
  date: "2026-04-10",
  chief_complaint: "Urolithiasis requiring ureteroscopy — ureter calculus 8mm",
  observations:
    "Patient on lithium since 2018, psychiatric follow-up ongoing with Dr. Faure. Lives alone, 3rd floor without elevator at 14 impasse des Pins, Nîmes. Post-procedure transport must be arranged.",
  action_items: [
    "Book ECBU before 2026-04-17",
    "Book urea and creatinine blood test before 2026-04-17",
    "Arrange medical transport for 2026-04-24 (procedure day)",
    "Inform urologist about lithium treatment before procedure",
  ],
  follow_up: "Ureteroscopy on 2026-04-24 at CHU Nîmes — Urology Department",
};

export const mockUploadResponse: UploadResponse = {
  documents: mockDocuments,
  clinical_note: mockClinicalNote,
  upload_id: "mock-upload-001",
};

export const mockActionPlan: ActionPlan = {
  actions: [
    {
      id: "lab-ecbu",
      type: "BOOK_LAB",
      title: "ECBU urine culture sample",
      why: "Required by the surgeon before ureteroscopy to rule out active urinary tract infection.",
      deadline: "2026-04-17",
      constraints: ["Fasting not required", "Results in 48h — allow time"],
      depends_on: [],
      priority: "HIGH",
      group_with: "lab-urea",
      suggested_url: "https://www.doctolib.fr/search?query=laboratoire+analyses+m%C3%A9dicales&location=N%C3%AEmes",
    },
    {
      id: "lab-urea",
      type: "BOOK_LAB",
      title: "Blood test — urea and creatinine",
      why: "Evaluation of kidney function before endoscopic intervention. Mandatory with lithium treatment.",
      deadline: "2026-04-17",
      constraints: ["Fasting recommended", "Results within 24h at city lab"],
      depends_on: [],
      priority: "HIGH",
      group_with: "lab-ecbu",
      suggested_url: "https://www.doctolib.fr/search?query=laboratoire+analyses+m%C3%A9dicales&location=N%C3%AEmes",
    },
    {
      id: "transport-post-op",
      type: "BOOK_TRANSPORT",
      title: "Medical transport home after ureteroscopy (April 24)",
      why: "Patient lives alone, 3rd floor no elevator — driving forbidden 48h post-procedure under anaesthesia.",
      deadline: "2026-04-23",
      constraints: [
        "VSL or ambulance as prescribed",
        "CPAM coverage if medical prescription attached",
        "Plan approximate discharge time",
      ],
      depends_on: [],
      priority: "URGENT",
      group_with: null,
      suggested_url: "https://www.doctolib.fr/search?query=transport+sanitaire+vsl&location=N%C3%AEmes",
    },
    {
      id: "reminder-lithium",
      type: "ADD_REMINDER",
      title: "Reminder: inform urologist about lithium treatment",
      why: "Lithium + renal procedure interaction — overdose risk if diuresis changes post-op. Must be mentioned in pre-anaesthesia consultation.",
      deadline: "2026-04-24",
      constraints: [],
      depends_on: [],
      priority: "MEDIUM",
      group_with: null,
      suggested_url: null,
    },
  ],
  questions_for_next_appointments: [
    {
      appointment: "Pre-anaesthesia consultation — CHU Nîmes",
      questions: [
        "Should lithium dosage be adjusted around the procedure or in the following days?",
        "Should lithium levels be retested within 48h post-operatively?",
      ],
      reasoning:
        "Lithium is eliminated by the kidneys. Any change in diuresis or sodium after ureteroscopy may significantly alter lithium levels (toxicity risk). Coordination between urologist and psychiatrist is recommended.",
    },
  ],
  alerts: [
    "⚠️ Lithium × renal procedure interaction — Lithium is eliminated by the kidney. Ureteroscopy with anaesthesia may alter diuresis and lead to overdose. Must be reported to anaesthetic staff and urologist.",
  ],
  patient_card_updates: [
    {
      section: "treatments",
      action: "confirm",
      item: "Lithium (Téralithe 400mg/day) — ongoing treatment",
    },
    {
      section: "upcoming",
      action: "add",
      item: "Ureteroscopy — April 24, 2026 — CHU Nîmes, Urology",
    },
  ],
};
