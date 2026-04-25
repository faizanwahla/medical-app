import { prisma } from "../index";
import { DDxSuggestion } from "@medical-app/shared";

export interface DDxRequest {
  symptoms: string[];
  signs: string[];
  age: number;
  specialty: string;
  riskFactors?: string[];
}

/**
 * Core differential diagnosis engine
 * Generates DDx suggestions based on clinical findings
 */
export async function generateDifferentialDiagnosis(
  request: DDxRequest
): Promise<DDxSuggestion[]> {
  const { symptoms, signs, age, specialty, riskFactors = [] } = request;

  if (!symptoms.length && !signs.length) {
    return [];
  }

  // Get all diseases for the specialty
  const diseases = await prisma.disease.findMany({
    where: {
      specialty: {
        contains: specialty,
        mode: "insensitive",
      },
    },
  });

  // Score each disease based on symptom/sign matches
  const scoredDiseases = diseases
    .map((disease) => {
      let score = 0;

      // Match symptoms
      const matchedSymptoms = symptoms.filter((symptom) =>
        disease.symptoms.some((s) =>
          s.toLowerCase().includes(symptom.toLowerCase())
        )
      ).length;
      score += matchedSymptoms * 30;

      // Match signs
      const matchedSigns = signs.filter((sign) =>
        disease.signs.some((s) => s.toLowerCase().includes(sign.toLowerCase()))
      ).length;
      score += matchedSigns * 25;

      // Age compatibility (simplified)
      // In production, implement more sophisticated age range checking
      score += 10;

      // Risk factor bonus
      const matchedRiskFactors = riskFactors.filter((rf) =>
        disease.epidemiology.toLowerCase().includes(rf.toLowerCase())
      ).length;
      score += matchedRiskFactors * 15;

      return {
        disease,
        score,
        matchedSymptoms,
        matchedSigns,
      };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Format results
  return scoredDiseases.map((item) => ({
    diagnosis: item.disease.name,
    probability: Math.min(100, Math.round((item.score / 100) * 100)),
    reasoning: generateReasoning(item),
    investigations: item.disease.investigations,
    management: item.disease.management,
    reference: item.disease.reference,
  }));
}

function generateReasoning(item: any): string {
  const parts = [];
  if (item.matchedSymptoms > 0) {
    parts.push(`${item.matchedSymptoms} symptom(s) match`);
  }
  if (item.matchedSigns > 0) {
    parts.push(`${item.matchedSigns} sign(s) match`);
  }
  return parts.length > 0
    ? `Based on clinical findings: ${parts.join(" and ")}.`
    : "Consider this diagnosis based on overall clinical context.";
}

/**
 * Save DDx suggestions to database
 */
export async function saveDifferentialDiagnoses(
  patientId: string,
  suggestions: DDxSuggestion[]
): Promise<void> {
  // Delete previous suggestions for this patient (keep only latest)
  await prisma.differentialDiagnosis.deleteMany({
    where: { patientId },
  });

  // Save new suggestions
  for (const suggestion of suggestions) {
    await prisma.differentialDiagnosis.create({
      data: {
        patientId,
        diagnosis: suggestion.diagnosis,
        probability: suggestion.probability,
        reasoning: suggestion.reasoning,
        goldStandardReference: suggestion.reference,
      },
    });
  }
}
