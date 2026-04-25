// Gender types
export const GENDERS = ["Male", "Female", "Other"] as const;

// Blood types
export const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

// Vital sign normal ranges (adult)
export const VITAL_RANGES = {
  temperature: { min: 36.1, max: 37.2, unit: "°C" },
  pulse: { min: 60, max: 100, unit: "bpm" },
  respiratoryRate: { min: 12, max: 20, unit: "breaths/min" },
  bloodPressureSystolic: { min: 90, max: 120, unit: "mmHg" },
  bloodPressureDiastolic: { min: 60, max: 80, unit: "mmHg" },
  oxygenSaturation: { min: 95, max: 100, unit: "%" },
};

// Investigation types
export const INVESTIGATION_TYPES = [
  "Lab",
  "Imaging",
  "ECG",
  "Other",
] as const;

// Treatment status
export const TREATMENT_STATUS = ["Active", "Completed", "Discontinued"] as const;

// Investigation status
export const INVESTIGATION_STATUS = ["Pending", "Completed", "Reviewed"] as const;

// Common medications by category (sample for UI)
export const MEDICINE_CATEGORIES = [
  "Antibiotic",
  "Antacid",
  "Antihypertensive",
  "Antihistamine",
  "Analgesic",
  "Antipyretic",
  "Anxiolytic",
  "Antidepressant",
  "Antiemetic",
  "Antidiarrheal",
  "Laxative",
  "Decongestant",
  "Cough Suppressant",
  "Expectorant",
  "Bronchodilator",
  "Corticosteroid",
  "Anticoagulant",
  "Antiplatelet",
  "Statin",
  "Antidiabetic",
] as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
};

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
