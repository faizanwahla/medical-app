import { DiseaseClinicalPlaybook, DiseaseTreatmentRecommendation } from "@medical-app/shared";
import { Disease, Medicine, Prisma } from "@prisma/client";

type DiseaseWithJsonPlaybook = Disease & {
  clinicalPlaybook: Prisma.JsonValue | null;
};

export function parseClinicalPlaybook(
  value: Prisma.JsonValue | null
): DiseaseClinicalPlaybook | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as unknown as DiseaseClinicalPlaybook;
}

function attachFormularyLinks(
  recommendation: DiseaseTreatmentRecommendation,
  medicinesByName: Map<string, Medicine>
): DiseaseTreatmentRecommendation {
  const matchedMedicine = medicinesByName.get(
    recommendation.medicineName.trim().toLowerCase()
  );

  return {
    ...recommendation,
    medicineId: matchedMedicine?.id,
  };
}

export function enrichDiseaseRecord(
  disease: DiseaseWithJsonPlaybook,
  medicinesByName: Map<string, Medicine>
) {
  const clinicalPlaybook = parseClinicalPlaybook(disease.clinicalPlaybook);

  return {
    ...disease,
    clinicalPlaybook: clinicalPlaybook
      ? {
          ...clinicalPlaybook,
          treatmentPlan: clinicalPlaybook.treatmentPlan.map((recommendation) =>
            attachFormularyLinks(recommendation, medicinesByName)
          ),
        }
      : null,
  };
}
