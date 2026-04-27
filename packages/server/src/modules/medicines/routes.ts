import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";

const router = Router();

// Get all medicines (public endpoint, no auth needed)
router.get("/", async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const type = req.query.type as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) {
      where.type = { contains: type, mode: "insensitive" };
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.medicine.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        medicines,
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

// Get single medicine
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: req.params.id },
    });

    if (!medicine) {
      throw new NotFoundError("Medicine");
    }

    res.json({ success: true, data: medicine });
  } catch (error) {
    handleError(error, res);
  }
});

// Create medicine (admin only - implement later with role-based access)
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const { name, type, uses, dosage, sideEffects, contraindications } = req.body;

    if (!name || !type) {
      throw new Error("Name and type are required");
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        type,
        uses: uses || [],
        dosage: dosage || "",
        sideEffects: sideEffects || [],
        contraindications: contraindications || [],
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
