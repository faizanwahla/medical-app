import { DDxSuggestion, Vital } from "@medical-app/shared";
import { prisma } from "../index";
import { parseClinicalPlaybook } from "./disease-playbook";

export interface DDxRequest {
  symptoms: string[];
  signs: string[];
  age: number;
  specialty: string;
  riskFactors?: string[];
  clinicalNarrative?: string[];
  investigationFindings?: string[];
  latestVital?: Partial<
    Pick<
      Vital,
      | "temperature"
      | "pulse"
      | "respiratoryRate"
      | "bloodPressureSystolic"
      | "bloodPressureDiastolic"
      | "oxygenSaturation"
      | "bloodGlucose"
    >
  > | null;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 4);
}

function hasClinicalMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  if (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  ) {
    return true;
  }

  const leftTokens = extractTokens(normalizedLeft);
  const rightTokens = extractTokens(normalizedRight);

  return leftTokens.some((leftToken) =>
    rightTokens.some((rightToken) => {
      const leftStem = leftToken.slice(0, Math.min(leftToken.length, 5));
      const rightStem = rightToken.slice(0, Math.min(rightToken.length, 5));
      return leftStem === rightStem;
    })
  );
}

function countMatches(needles: string[], haystack: string[]): number {
  return needles.filter((needle) =>
    haystack.some((candidate) => hasClinicalMatch(candidate, needle))
  ).length;
}

/**
 * Core differential diagnosis engine
 * Generates DDx suggestions based on clinical findings
 */
export async function generateDifferentialDiagnosis(
  request: DDxRequest
): Promise<DDxSuggestion[]> {
  const {
    symptoms,
    signs,
    age,
    specialty,
    riskFactors = [],
    clinicalNarrative = [],
    investigationFindings = [],
    latestVital,
  } = request;

  if (!symptoms.length && !signs.length) {
    return [];
  }

  // Get all diseases
  const diseases = await prisma.disease.findMany();

  // Score each disease based on symptom/sign matches
  const scoredDiseases = diseases
    .map((disease) => {
      let score = 0;
      const playbook = parseClinicalPlaybook(disease.clinicalPlaybook);
      const diseaseContext = [
        disease.definition,
        disease.pathophysiology,
        disease.epidemiology,
        disease.management,
        ...disease.diagnosticCriteria,
        ...disease.investigations,
        ...(playbook?.differentialClues || []),
        ...(playbook?.redFlags || []),
        ...(playbook?.complications || []),
      ];

      // Match symptoms
      const matchedSymptoms = countMatches(symptoms, disease.symptoms);
      score += matchedSymptoms * 30;

      // Match signs
      const matchedSigns = countMatches(signs, disease.signs);
      score += matchedSigns * 25;

      // Specialty alignment bonus
      if (disease.specialty.toLowerCase() === specialty.toLowerCase()) {
        score += 20;
      }

      // Pathophysiology & Epidemiology Keyword Matching
      const clinicalContext = [...symptoms, ...signs, ...riskFactors];
      const contextMatches = countMatches(clinicalContext, diseaseContext);
      score += contextMatches * 10;

      const matchedRiskFactors =
        countMatches(riskFactors, playbook?.riskFactors || []);
      score += matchedRiskFactors * 12;

      const matchedNarrative = countMatches(clinicalNarrative, diseaseContext);
      score += matchedNarrative * 8;

      const matchedInvestigationFindings = countMatches(
        investigationFindings,
        [...disease.diagnosticCriteria, ...disease.investigations, ...(playbook?.differentialClues || [])]
      );
      score += matchedInvestigationFindings * 18;

      let vitalPatternMatches = 0;
      if (playbook?.vitalPatterns && latestVital) {
        vitalPatternMatches = playbook.vitalPatterns.filter((pattern) => {
          const value = latestVital[pattern.metric];
          if (typeof value !== "number") {
            return false;
          }

          if (typeof pattern.highAlert === "number" && value >= pattern.highAlert) {
            return true;
          }

          if (typeof pattern.lowAlert === "number" && value <= pattern.lowAlert) {
            return true;
          }

          return false;
        }).length;
      }
      score += vitalPatternMatches * 8;

      // Age compatibility (simplified)
      score += 10;

      return {
        disease,
        score,
        matchedSymptoms,
        matchedSigns,
        contextMatches,
        matchedRiskFactors,
        matchedNarrative,
        matchedInvestigationFindings,
        vitalPatternMatches,
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
    ((symptoms.length + signs.length + riskFactors.length) * 10) + // context
    (riskFactors.length * 12) +
    (clinicalNarrative.length * 8) +
    (investigationFindings.length * 18) +
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
  const parts: string[] = [];
  if (item.matchedSymptoms > 0) parts.push(`${item.matchedSymptoms} key symptoms`);
  if (item.matchedSigns > 0) parts.push(`${item.matchedSigns} clinical signs`);
  if (item.contextMatches > 0) parts.push("chart-context alignment");
  if (item.matchedRiskFactors > 0) parts.push(`${item.matchedRiskFactors} risk factor matches`);
  if (item.matchedNarrative > 0) parts.push(`${item.matchedNarrative} narrative chart matches`);
  if (item.matchedInvestigationFindings > 0) parts.push(`${item.matchedInvestigationFindings} investigation correlations`);
  if (item.vitalPatternMatches > 0) parts.push(`${item.vitalPatternMatches} vital sign correlations`);

  const evidenceSummary = parts.length
    ? parts.join(", ")
    : "overall specialty and demographic alignment";
  let reasoning = `Analysis reveals ${evidenceSummary} consistent with ${item.disease.name}. `;
  
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
