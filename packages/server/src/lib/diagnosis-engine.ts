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

  // Get all diseases
  const diseases = await prisma.disease.findMany();

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

      // Specialty alignment bonus
      if (disease.specialty.toLowerCase() === specialty.toLowerCase()) {
        score += 20;
      }

      // Pathophysiology & Epidemiology Keyword Matching
      const clinicalContext = [...symptoms, ...signs, ...riskFactors];
      let contextMatches = 0;
      clinicalContext.forEach(term => {
        if (disease.pathophysiology.toLowerCase().includes(term.toLowerCase())) contextMatches++;
        if (disease.epidemiology.toLowerCase().includes(term.toLowerCase())) contextMatches++;
      });
      score += contextMatches * 10;

      // Age compatibility (simplified)
      score += 10;

      return {
        disease,
        score,
        matchedSymptoms,
        matchedSigns,
        contextMatches
      };
    })
    .filter((d) => d.score > 20) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Calculate maximum possible score for calibration
  const maxPossibleScore = 
    (symptoms.length * 30) + 
    (signs.length * 25) + 
    20 + // specialty bonus
    ((symptoms.length + signs.length) * 10) + // context
    10; // age

  // Format results with calibrated probability
  return scoredDiseases.map((item) => {
    // Normalize probability: use actual max score instead of hardcoded 150
    const normalizedScore = (item.score / Math.max(maxPossibleScore, 100)) * 100;
    const probability = Math.min(98, Math.round(normalizedScore));

    return {
      diagnosis: item.disease.name,
      probability,
      reasoning: generateReasoning(item, specialty),
      investigations: item.disease.investigations,
      management: item.disease.management,
      reference: item.disease.reference,
    };
  });
}

function generateReasoning(item: any, userSpecialty: string): string {
  const parts = [];
  if (item.matchedSymptoms > 0) parts.push(`${item.matchedSymptoms} key symptoms`);
  if (item.matchedSigns > 0) parts.push(`${item.matchedSigns} clinical signs`);
  if (item.contextMatches > 0) parts.push("pathophysiological alignment");
  
  let reasoning = `Analysis reveals ${parts.join(", ")} consistent with ${item.disease.name}. `;
  
  if (item.disease.specialty.toLowerCase() === userSpecialty.toLowerCase()) {
    reasoning += `This matches your primary specialty context. `;
  }

  return reasoning + `Probability is based on weighted clinical evidence matching.`;
}

/**
 * Save DDx suggestions to database using createMany for performance
 */
export async function saveDifferentialDiagnoses(
  patientId: string,
  suggestions: DDxSuggestion[]
): Promise<void> {
  // Delete previous suggestions for this patient (keep only latest)
  await prisma.differentialDiagnosis.deleteMany({
    where: { patientId },
  });

  // Save new suggestions using createMany (single DB roundtrip instead of N)
  if (suggestions.length > 0) {
    await prisma.differentialDiagnosis.createMany({
      data: suggestions.map((suggestion) => ({
        patientId,
        diagnosis: suggestion.diagnosis,
        probability: suggestion.probability,
        reasoning: suggestion.reasoning,
        goldStandardReference: suggestion.reference,
      })),
    });
  }
}
