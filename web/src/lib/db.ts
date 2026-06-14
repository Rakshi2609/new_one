import { useState, useEffect } from "react";

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  type: string;
  stock: string;
};

export type PatientState = {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  procedure: string;
  recoveryDay: number;
  uploadState: "BEFORE" | "PROCESSING" | "AFTER";
  medicationTaken: boolean;
  voiceCallDone: boolean;
  hospital: string;
  medications: Medication[];
};

export type DBState = {
  patients: PatientState[];
};

const DEFAULT_PATIENTS: PatientState[] = [
  {
    id: "CPX23948",
    name: "Rajesh Kumar",
    age: 58,
    gender: "Male",
    diagnosis: "Right Knee Osteoarthritis",
    procedure: "Total Knee Replacement",
    recoveryDay: 4,
    uploadState: "BEFORE",
    medicationTaken: false,
    voiceCallDone: false,
    hospital: "AIIMS Hospital, New Delhi",
    medications: [
      { id: "1", name: "Paracetamol 650mg", dosage: "1 Tablet", time: "3x Daily", type: "Painkiller", stock: "14 left" },
      { id: "2", name: "Pantoprazole 40mg", dosage: "1 Tablet", time: "1x Morning", type: "Antacid", stock: "8 left" },
      { id: "3", name: "Amoxicillin 500mg", dosage: "1 Tablet", time: "2x Daily", type: "Antibiotic", stock: "6 left" }
    ]
  },
  {
    id: "PS-9912",
    name: "Priya Sharma",
    age: 42,
    gender: "Female",
    diagnosis: "L4-L5 Herniated Disc",
    procedure: "Microdiscectomy",
    recoveryDay: 12,
    uploadState: "AFTER",
    medicationTaken: true,
    voiceCallDone: true,
    hospital: "AIIMS New Delhi",
    medications: []
  }
];

export function useDB() {
  const [db, setDb] = useState<DBState>(() => {
    const saved = localStorage.getItem("curapath_saas_db");
    return saved ? JSON.parse(saved) : { patients: DEFAULT_PATIENTS };
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("curapath_saas_db");
      if (saved) setDb(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveDB = (nextState: DBState) => {
    setDb(nextState);
    localStorage.setItem("curapath_saas_db", JSON.stringify(nextState));
    window.dispatchEvent(new Event("storage"));
  };

  const addPatient = (patient: Omit<PatientState, "uploadState" | "medicationTaken" | "voiceCallDone" | "recoveryDay" | "medications">) => {
    const newPatient: PatientState = {
      ...patient,
      uploadState: "BEFORE",
      medicationTaken: false,
      voiceCallDone: false,
      recoveryDay: 1,
      medications: []
    };
    saveDB({ patients: [...db.patients, newPatient] });
  };

  const updatePatient = (id: string, updates: Partial<PatientState>) => {
    const updatedPatients = db.patients.map(p => p.id === id ? { ...p, ...updates } : p);
    saveDB({ patients: updatedPatients });
  };

  const deletePatient = (id: string) => {
    saveDB({ patients: db.patients.filter(p => p.id !== id) });
  };

  return { 
    db, 
    addPatient, 
    updatePatient, 
    deletePatient 
  };
}
