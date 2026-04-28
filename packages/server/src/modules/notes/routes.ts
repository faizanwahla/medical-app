import { Router, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { ClinicalNoteCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";
import { createAuditLog } from "../../lib/audit";

const router = Router();
router.use(authMiddleware);

// Get notes for patient
router.get("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const notes = await prisma.clinicalNote.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: notes });
  } catch (error) {
    handleError(error, res);
  }
});

// Create note
router.post("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const input = ClinicalNoteCreateSchema.parse(req.body);

    const note = await prisma.clinicalNote.create({
      data: {
        patientId: req.params.patientId,
        ...input,
      },
    });

    // Audit log
    await createAuditLog(
      req.user.userId,
      "NOTE_CREATE",
      "CLINICAL_NOTE",
      note.id,
      `Created note: ${note.title}`,
      req.ip
    );

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    handleError(error, res);
  }
});

// Update note
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const note = await prisma.clinicalNote.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!note || note.patient.userId !== req.user.userId) {
      throw new NotFoundError("Note");
    }

    const input = ClinicalNoteCreateSchema.parse(req.body);

    const updated = await prisma.clinicalNote.update({
      where: { id: req.params.id },
      data: input,
    });

    // Audit log
    await createAuditLog(
      req.user.userId,
      "NOTE_UPDATE",
      "CLINICAL_NOTE",
      updated.id,
      `Updated note: ${updated.title}`,
      req.ip
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete note
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const note = await prisma.clinicalNote.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!note || note.patient.userId !== req.user.userId) {
      throw new NotFoundError("Note");
    }

    await prisma.clinicalNote.delete({ where: { id: req.params.id } });

    // Audit log
    await createAuditLog(
      req.user.userId,
      "NOTE_DELETE",
      "CLINICAL_NOTE",
      req.params.id,
      `Deleted note: ${note.title}`,
      req.ip
    );

    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
