import { Router, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { TreatmentCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest, roleCheck } from "../../middleware/auth";
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
router.post("/patient/:patientId", roleCheck(["ADMIN", "PHYSICIAN"]), async (req: AuthRequest, res: Response) => {
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
    const trimmedMedicineName = input.medicineName?.trim();
    const trimmedMedicineType = input.medicineType?.trim();
    let medicine = input.medicineId
      ? await prisma.medicine.findUnique({
          where: { id: input.medicineId },
        })
      : null;

    if (!medicine && trimmedMedicineName) {
      medicine = await prisma.medicine.findFirst({
        where: {
          name: {
            equals: trimmedMedicineName,
            mode: "insensitive",
          },
        },
      });
    }

    if (!medicine && trimmedMedicineName) {
      medicine = await prisma.medicine.create({
        data: {
          name: trimmedMedicineName,
          type: trimmedMedicineType || "Custom prescription",
          uses: [],
          dosage: input.dosage,
          sideEffects: [],
          contraindications: [],
        },
      });
    }

    if (!medicine) {
      throw new NotFoundError("Medicine");
    }

    const { medicineId: _medicineId, medicineName: _medicineName, medicineType: _medicineType, ...treatmentInput } = input;

    const treatment = await prisma.treatment.create({
      data: {
        patientId: req.params.patientId,
        ...treatmentInput,
        medicineId: medicine.id,
        status: "Active",
        startedAt: treatmentInput.startedAt || new Date(),
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
