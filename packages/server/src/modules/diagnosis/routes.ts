import { Router, Request, Response } from "express";
import { prisma } from "../../index";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";
import {
  generateDifferentialDiagnosis,
  saveDifferentialDiagnoses,
  DDxRequest,
} from "../../lib/diagnosis-engine";

const router = Router();
router.use(authMiddleware);

// Generate DDx for a patient
router.post("/generate/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get patient
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const { symptoms = [], signs = [], riskFactors = [] } = req.body;

    const request: DDxRequest = {
      symptoms,
      signs,
      age: patient.age,
      specialty: req.user.specialty || "General Medicine",
      riskFactors,
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

// Get disease details
router.get("/disease/:id", async (req: Request, res: Response) => {
  try {
    const disease = await prisma.disease.findUnique({
      where: { id: req.params.id },
    });

    if (!disease) {
      throw new NotFoundError("Disease");
    }

    res.json({ success: true, data: disease });
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

    const diseases = await prisma.disease.findMany({
      where,
      take: 20,
    });

    res.json({ success: true, data: diseases });
  } catch (error) {
    handleError(error, res);
  }
});

// Get all diseases (Library)
router.get("/library", async (req: Request, res: Response) => {
  try {
    const diseases = await prisma.disease.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: diseases });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
