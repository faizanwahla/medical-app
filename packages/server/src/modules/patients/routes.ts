import { Router, Response } from "express";
import { prisma } from "../../lib/prisma";
import { PatientCreateSchema, PatientUpdateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError, ValidationError } from "../../lib/errors";

const router = Router();

// Protect all patient routes with auth
router.use(authMiddleware);

// Get all patients for current user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
    const skip = (page - 1) * pageSize;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: { userId: req.user.userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          vitals: { take: 1, orderBy: { recordedAt: "desc" } },
          treatments: { where: { status: "Active" } },
        },
      }),
      prisma.patient.count({ where: { userId: req.user.userId } }),
    ]);

    res.json({
      success: true,
      data: {
        patients,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get single patient
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        vitals: { orderBy: { recordedAt: "desc" }, take: 10 },
        differentialDiagnoses: { orderBy: { createdAt: "desc" } },
        investigations: { orderBy: { requestedAt: "desc" } },
        treatments: true,
      },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    handleError(error, res);
  }
});

// Create new patient
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const input = PatientCreateSchema.parse(req.body);

    const patient = await prisma.patient.create({
      data: {
        ...input,
        userId: req.user.userId,
      },
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    handleError(error, res);
  }
});

// Update patient
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Check ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const input = PatientUpdateSchema.parse(req.body);

    const updated = await prisma.patient.update({
      where: { id: req.params.id },
      data: input,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete patient
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    // Check ownership
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    await prisma.patient.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Patient deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
