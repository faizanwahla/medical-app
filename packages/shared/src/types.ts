// User and Authentication types
export interface User {
  id: string;
  email: string;
  specialty: string;
  role: "ADMIN" | "PHYSICIAN" | "NURSE" | "RECEPTIONIST";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  specialty: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Patient types
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  bloodType?: string;
  allergies: string[];
  pastMedicalHistory: string[];
  presentingComplaint: string;
  durationOfIllness: string;
  systemicReview: string;
  examFindings: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vital Signs
export interface Vital {
  id: string;
  patientId: string;
  temperature?: number;
  pulse?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
  recordedAt: Date;
  notes?: string;
}

// Disease and DDx types
export interface Disease {
  id: string;
  name: string;
  icdCode: string;
  specialty: string;
  definition: string;
  pathophysiology: string;
  epidemiology: string;
  symptoms: string[];
  signs: string[];
  diagnosticCriteria: string[];
  investigations: string[];
  management: string;
  prognosis: string;
  reference: string;
  clinicalPlaybook?: DiseaseClinicalPlaybook;
  createdAt: Date;
}

export type VitalMetric =
  | "temperature"
  | "pulse"
  | "respiratoryRate"
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "oxygenSaturation"
  | "bloodGlucose";

export interface DiseaseVitalPattern {
  metric: VitalMetric;
  expected: string;
  interpretation: string;
  highAlert?: number;
  lowAlert?: number;
}

export interface DiseaseInvestigationRecommendation {
  name: string;
  type: "Lab" | "Imaging" | "ECG" | "Other";
  priority: "Urgent" | "Routine" | "Targeted";
  reason: string;
  expectedFindings?: string;
}

export interface DiseaseTreatmentRecommendation {
  category: "First-line" | "Adjunct" | "Rescue" | "Long-term" | "Supportive";
  medicineName: string;
  medicineId?: string;
  rationale: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
  commonSideEffects: string[];
  contraindications: string[];
}

export interface DiseaseClinicalPlaybook {
  summary: string;
  riskFactors: string[];
  complications: string[];
  redFlags: string[];
  supportiveCare: string[];
  monitoring: string[];
  followUp: string[];
  disposition: string[];
  differentialClues: string[];
  vitalPatterns: DiseaseVitalPattern[];
  investigationPlan: DiseaseInvestigationRecommendation[];
  treatmentPlan: DiseaseTreatmentRecommendation[];
}

export interface DifferentialDiagnosis {
  id: string;
  patientId: string;
  diagnosis: string;
  probability: number; // 0-100
  reasoning: string;
  goldStandardReference: string;
  createdAt: Date;
}

export interface DDxSuggestion {
  diagnosis: string;
  probability: number;
  reasoning: string;
  investigations: string[];
  management: string;
  reference: string;
}

// Investigation types
export interface Investigation {
  id: string;
  patientId: string;
  name: string;
  type: "Lab" | "Imaging" | "ECG" | "Other";
  status: "Pending" | "Completed" | "Reviewed";
  requestedAt: Date;
  resultAt?: Date;
  result: string;
  notes?: string;
  normalRange?: string;
  interpretation?: string;
  createdAt: Date;
}

// Medicine and Treatment types
export interface Medicine {
  id: string;
  name: string;
  type: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  createdAt: Date;
}

export interface Treatment {
  id: string;
  patientId: string;
  medicineId: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status: "Active" | "Completed" | "Discontinued";
  startedAt: Date;
  endedAt?: Date;
}

// Note types
export interface ClinicalNote {
  id: string;
  patientId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Specialty types
export type Specialty =
  | "General Medicine"
  | "Pediatrics"
  | "Obstetrics & Gynaecology"
  | "Surgery"
  | "Cardiology"
  | "Pulmonology"
  | "Gastroenterology"
  | "Nephrology"
  | "Neurology"
  | "Psychiatry"
  | "Dermatology"
  | "Orthopedics"
  | "Endocrinology"
  | "Infectious Diseases"
  | "ENT"
  | "Ophthalmology";

export const SPECIALTIES: Specialty[] = [
  "General Medicine",
  "Pediatrics",
  "Obstetrics & Gynaecology",
  "Surgery",
  "Cardiology",
  "Pulmonology",
  "Gastroenterology",
  "Nephrology",
  "Neurology",
  "Psychiatry",
  "Dermatology",
  "Orthopedics",
  "Endocrinology",
  "Infectious Diseases",
  "ENT",
  "Ophthalmology",
];
