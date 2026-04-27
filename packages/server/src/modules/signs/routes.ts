import { Router, Request, Response } from "express";
import { prisma } from "../../index";
import { handleError } from "../../lib/errors";

const router = Router();

// Get all signs
router.get("/", async (req: Request, res: Response) => {
  try {
    const system = (req.query.system as string) || "";

    const where = system ? { system } : {};

    const signs = await prisma.sign.findMany({
      where,
      orderBy: [{ system: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, data: signs });
  } catch (error) {
    handleError(error, res);
  }
});

// Get signs by system
router.get("/system/:system", async (req: Request, res: Response) => {
  try {
    const signs = await prisma.sign.findMany({
      where: { system: req.params.system },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: signs });
  } catch (error) {
    handleError(error, res);
  }
});

// Get all unique systems
router.get("/systems/list", async (req: Request, res: Response) => {
  try {
    const systems = await prisma.sign.findMany({
      select: { system: true },
      distinct: ["system"],
      orderBy: { system: "asc" },
    });

    res.json({
      success: true,
      data: systems.map((s) => s.system),
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
