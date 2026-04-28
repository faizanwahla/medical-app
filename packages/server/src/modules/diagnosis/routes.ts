import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";
import {
  generateDifferentialDiagnosis,
  saveDifferentialDiagnoses,
  DDxRequest,
} from "../../lib/diagnosis-engine";
import { enrichDiseaseRecord } from "../../lib/disease-playbook";

const router = Router();
router.use(authMiddleware);

function uniqueValues(values: Array<string | null | undefined>, limit?: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    const normalized = trimmed.toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(trimmed);

    if (limit && result.length >= limit) {
      break;
    }
  }

  return result;
}

function normalizeList(value: unknown, limit?: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueValues(
    value.map((item) => (typeof item === "string" ? item : undefined)),
    limit
  );
}

function splitClinicalText(value?: string | null, limit?: number): string[] {
  return uniqueValues((value || "").split(/[\n,.;]+/), limit);
}

function normalizeLatestVital(vital?: {
  temperature: number | null;
  pulse: number | null;
  respiratoryRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  oxygenSaturation: number | null;
  bloodGlucose: number | null;
} | null): DDxRequest["latestVital"] {
  if (!vital) {
    return null;
  }

  return {
    temperature: vital.temperature ?? undefined,
    pulse: vital.pulse ?? undefined,
    respiratoryRate: vital.respiratoryRate ?? undefined,
    bloodPressureSystolic: vital.bloodPressureSystolic ?? undefined,
    bloodPressureDiastolic: vital.bloodPressureDiastolic ?? undefined,
    oxygenSaturation: vital.oxygenSaturation ?? undefined,
    bloodGlucose: vital.bloodGlucose ?? undefined,
  };
}

// Generate DDx for a patient
router.post("/generate/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
      include: {
        investigations: {
          orderBy: { requestedAt: "desc" },
          take: 10,
        },
        clinicalNotes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        vitals: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const chartSymptoms = splitClinicalText(patient.presentingComplaint, 12);
    const chartSigns = splitClinicalText(patient.examFindings, 12);
    const chartRiskFactors = uniqueValues(patient.pastMedicalHistory || [], 12);
    const clinicalNarrative = uniqueValues(
      [
        ...splitClinicalText(patient.durationOfIllness, 4),
        ...splitClinicalText(patient.systemicReview, 8),
        ...splitClinicalText(patient.examFindings, 8),
        ...splitClinicalText(patient.vitals[0]?.notes, 4),
        ...patient.clinicalNotes.flatMap((note) => [
          note.title,
          ...splitClinicalText(note.content, 4),
          ...(note.tags || []),
        ]),
      ],
      16
    );
    const investigationFindings = uniqueValues(
      patient.investigations.flatMap((investigation) => [
        investigation.name,
        investigation.notes,
        investigation.status === "Completed" ? investigation.result : undefined,
        investigation.interpretation,
      ]),
      16
    );
    const latestVital = normalizeLatestVital(patient.vitals[0]);

    const request: DDxRequest = {
      symptoms: Object.prototype.hasOwnProperty.call(body, "symptoms")
        ? normalizeList((body as { symptoms?: unknown }).symptoms, 12)
        : chartSymptoms,
      signs: Object.prototype.hasOwnProperty.call(body, "signs")
        ? normalizeList((body as { signs?: unknown }).signs, 12)
        : chartSigns,
      age: patient.age,
      specialty: req.user.specialty || "General Medicine",
      riskFactors: Object.prototype.hasOwnProperty.call(body, "riskFactors")
        ? normalizeList((body as { riskFactors?: unknown }).riskFactors, 12)
        : chartRiskFactors,
      latestVital,
      clinicalNarrative,
      investigationFindings,
    };

    // Generate suggestions
    const suggestions = await generateDifferentialDiagnosis(request);

    // Save to database
    await saveDifferentialDiagnoses(req.params.patientId, suggestions);

    res.json({
      success: true,
      data: {
        patientId: req.params.patientId,
        suggestions,
        count: suggestions.length,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get all diseases (Library)
router.get("/library", async (req: Request, res: Response) => {
  try {
    const [diseases, medicines] = await Promise.all([
      prisma.disease.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.medicine.findMany(),
    ]);
    const medicinesByName = new Map(
      medicines.map((medicine) => [medicine.name.trim().toLowerCase(), medicine])
    );

    res.json({
      success: true,
      data: diseases.map((disease) => enrichDiseaseRecord(disease, medicinesByName)),
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Search diseases
router.get("/search/query", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const specialty = (req.query.specialty as string) || "";

    if (query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { symptoms: { hasSome: [query] } },
        { signs: { hasSome: [query] } },
      ],
    };

    if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }

    const [diseases, medicines] = await Promise.all([
      prisma.disease.findMany({
        where,
        take: 20,
      }),
      prisma.medicine.findMany(),
    ]);
    const medicinesByName = new Map(
      medicines.map((medicine) => [medicine.name.trim().toLowerCase(), medicine])
    );

    res.json({
      success: true,
      data: diseases.map((disease) => enrichDiseaseRecord(disease, medicinesByName)),
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get disease details
router.get("/disease/:id", async (req: Request, res: Response) => {
  try {
    const [disease, medicines] = await Promise.all([
      prisma.disease.findUnique({
        where: { id: req.params.id },
      }),
      prisma.medicine.findMany(),
    ]);

    if (!disease) {
      throw new NotFoundError("Disease");
    }

    const medicinesByName = new Map(
      medicines.map((medicine) => [medicine.name.trim().toLowerCase(), medicine])
    );

    res.json({
      success: true,
      data: enrichDiseaseRecord(disease, medicinesByName),
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get saved DDx for a patient
router.get("/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const diagnoses = await prisma.differentialDiagnosis.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { probability: "desc" },
    });

    res.json({ success: true, data: diagnoses });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
