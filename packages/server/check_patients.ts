import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.patient.count();
  console.log(`Total patients in DB: ${count}`);
  const patients = await prisma.patient.findMany({
    select: { firstName: true, lastName: true, presentingComplaint: true }
  });
  console.log("Patients:");
  console.table(patients);
}

main().finally(() => prisma.$disconnect());
