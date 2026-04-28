import { Router, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { authMiddleware, AuthRequest, roleCheck } from "../../middleware/auth";
import { handleError } from "../../lib/errors";

const router = Router();

router.use(authMiddleware);

// Get high-level stats (Admin/Physician)
router.get("/stats", roleCheck(["ADMIN", "PHYSICIAN"]), async (req: AuthRequest, res: Response) => {
  try {
    const [patientCount, vitalCount, diagnosisCount, treatmentCount] = await Promise.all([
      prisma.patient.count(),
      prisma.vital.count(),
      prisma.differentialDiagnosis.count(),
      prisma.treatment.count(),
    ]);

    res.json({
      success: true,
      data: {
        patients: patientCount,
        vitals: vitalCount,
        diagnoses: diagnosisCount,
        treatments: treatmentCount,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get clinical analytics (Admin/Physician)
router.get("/clinical-analytics", roleCheck(["ADMIN", "PHYSICIAN"]), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Diagnoses distribution
    const diagnoses = await prisma.differentialDiagnosis.groupBy({
      by: ["diagnosis"],
      _count: { _all: true },
      orderBy: { _count: { diagnosis: "desc" } },
      take: 10,
    });

    // 2. Patient age distribution
    const patients = await prisma.patient.findMany({ select: { age: true } });
    const ageGroups = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-65": 0,
      "66+": 0,
    };

    patients.forEach((p) => {
      if (p.age <= 18) ageGroups["0-18"]++;
      else if (p.age <= 35) ageGroups["19-35"]++;
      else if (p.age <= 50) ageGroups["36-50"]++;
      else if (p.age <= 65) ageGroups["51-65"]++;
      else ageGroups["66+"]++;
    });

    // 3. Treatment types
    const treatments = await prisma.treatment.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    res.json({
      success: true,
      data: {
        topDiagnoses: diagnoses.map((d) => ({ name: d.diagnosis, count: d._count._all })),
        ageDistribution: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
        treatmentStatus: treatments.map((t) => ({ name: t.status, value: t._count._all })),
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
