import { z } from "zod";

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  specialty: z.string(),
});

// Patient Schemas
export const PatientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().min(0).max(150),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodType: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]).optional(),
  allergies: z.array(z.string()).optional(),
  pastMedicalHistory: z.array(z.string()).optional(),
  presentingComplaint: z.string().optional(),
  durationOfIllness: z.string().optional(),
  systemicReview: z.string().optional(),
  examFindings: z.string().optional(),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

// Vital Signs Schemas
export const VitalCreateSchema = z.object({
  temperature: z.number().min(35).max(42).optional(),
  pulse: z.number().int().min(40).max(200).optional(),
  respiratoryRate: z.number().int().min(10).max(50).optional(),
  bloodPressureSystolic: z.number().int().min(60).max(220).optional(),
  bloodPressureDiastolic: z.number().int().min(40).max(140).optional(),
  oxygenSaturation: z.number().min(50).max(100).optional(),
  recordedAt: z.date().optional(),
  notes: z.string().optional(),
});

// Investigation Schemas
export const InvestigationCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Lab", "Imaging", "ECG", "Other"]),
  result: z.string().optional(),
  normalRange: z.string().optional(),
  interpretation: z.string().optional(),
});

// Treatment Schemas
export const TreatmentCreateSchema = z.object({
  medicineId: z.string(),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
  startedAt: z.date().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
export type VitalCreateInput = z.infer<typeof VitalCreateSchema>;
export type InvestigationCreateInput = z.infer<typeof InvestigationCreateSchema>;
export type TreatmentCreateInput = z.infer<typeof TreatmentCreateSchema>;
