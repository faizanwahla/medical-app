import { Router, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { InvestigationCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";

const router = Router();
router.use(authMiddleware);

// Get investigations for a patient
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

    const investigations = await prisma.investigation.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { requestedAt: "desc" },
    });

    res.json({ success: true, data: investigations });
  } catch (error) {
    handleError(error, res);
  }
});

// Create investigation
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

    const input = InvestigationCreateSchema.parse(req.body);

    const investigation = await prisma.investigation.create({
      data: {
        patientId: req.params.patientId,
        ...input,
        status: "Pending",
      },
    });

    res.status(201).json({ success: true, data: investigation });
  } catch (error) {
    handleError(error, res);
  }
});

// Update investigation (add results)
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Get investigation and verify ownership
    const investigation = await prisma.investigation.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!investigation || investigation.patient.userId !== req.user.userId) {
      throw new NotFoundError("Investigation");
    }

    const { result, normalRange, interpretation, status, notes } = req.body;

    const updated = await prisma.investigation.update({
      where: { id: req.params.id },
      data: {
        notes: notes !== undefined ? notes : investigation.notes,
        result: result || investigation.result,
        normalRange: normalRange || investigation.normalRange,
        interpretation: interpretation || investigation.interpretation,
        status: status || (result ? "Completed" : investigation.status),
        resultAt: result ? new Date() : investigation.resultAt,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete investigation
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const investigation = await prisma.investigation.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!investigation || investigation.patient.userId !== req.user.userId) {
      throw new NotFoundError("Investigation");
    }

    await prisma.investigation.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Investigation deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
