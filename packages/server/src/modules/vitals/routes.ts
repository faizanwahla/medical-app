import { Router, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { VitalCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";

const router = Router();
router.use(authMiddleware);

// Get vitals for a patient
router.get("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Verify patient ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const vitals = await prisma.vital.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { recordedAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: vitals });
  } catch (error) {
    handleError(error, res);
  }
});

// Get latest vital for patient
router.get("/patient/:patientId/latest", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Verify patient ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const vital = await prisma.vital.findFirst({
      where: { patientId: req.params.patientId },
      orderBy: { recordedAt: "desc" },
    });

    res.json({ success: true, data: vital });
  } catch (error) {
    handleError(error, res);
  }
});

// Add vital signs
router.post("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Verify patient ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const input = VitalCreateSchema.parse(req.body);

    const vital = await prisma.vital.create({
      data: {
        patientId: req.params.patientId,
        ...input,
        recordedAt: input.recordedAt || new Date(),
      },
    });

    res.status(201).json({ success: true, data: vital });
  } catch (error) {
    handleError(error, res);
  }
});

// Update vital
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get vital and verify ownership
    const vital = await prisma.vital.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!vital || vital.patient.userId !== req.user.userId) {
      throw new NotFoundError("Vital");
    }

    const input = VitalCreateSchema.parse(req.body);

    const updated = await prisma.vital.update({
      where: { id: req.params.id },
      data: input,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete vital
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get vital and verify ownership
    const vital = await prisma.vital.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!vital || vital.patient.userId !== req.user.userId) {
      throw new NotFoundError("Vital");
    }

    await prisma.vital.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Vital deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
