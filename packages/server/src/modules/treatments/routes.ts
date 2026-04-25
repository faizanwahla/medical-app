import { Router, Response } from "express";
import { prisma } from "../../lib/prisma";
import { TreatmentCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";

const router = Router();
router.use(authMiddleware);

// Get treatments for a patient
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

    const treatments = await prisma.treatment.findMany({
      where: { patientId: req.params.patientId },
      include: { medicine: true },
      orderBy: { startedAt: "desc" },
    });

    res.json({ success: true, data: treatments });
  } catch (error) {
    handleError(error, res);
  }
});

// Get active treatments for a patient
router.get("/patient/:patientId/active", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Verify patient ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const treatments = await prisma.treatment.findMany({
      where: {
        patientId: req.params.patientId,
        status: "Active",
      },
      include: { medicine: true },
    });

    res.json({ success: true, data: treatments });
  } catch (error) {
    handleError(error, res);
  }
});

// Add treatment
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

    const input = TreatmentCreateSchema.parse(req.body);

    // Verify medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: input.medicineId },
    });

    if (!medicine) {
      throw new NotFoundError("Medicine");
    }

    const treatment = await prisma.treatment.create({
      data: {
        patientId: req.params.patientId,
        ...input,
        status: "Active",
        startedAt: input.startedAt || new Date(),
      },
      include: { medicine: true },
    });

    res.status(201).json({ success: true, data: treatment });
  } catch (error) {
    handleError(error, res);
  }
});

// Update treatment
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get treatment and verify ownership
    const treatment = await prisma.treatment.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!treatment || treatment.patient.userId !== req.user.userId) {
      throw new NotFoundError("Treatment");
    }

    const { dosage, frequency, duration, instructions, status, endedAt } = req.body;

    const updated = await prisma.treatment.update({
      where: { id: req.params.id },
      data: {
        dosage: dosage || treatment.dosage,
        frequency: frequency || treatment.frequency,
        duration: duration || treatment.duration,
        instructions: instructions !== undefined ? instructions : treatment.instructions,
        status: status || treatment.status,
        endedAt: endedAt || (status === "Discontinued" || status === "Completed" ? new Date() : treatment.endedAt),
      },
      include: { medicine: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete treatment
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const treatment = await prisma.treatment.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!treatment || treatment.patient.userId !== req.user.userId) {
      throw new NotFoundError("Treatment");
    }

    await prisma.treatment.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Treatment deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
