import { PrismaClient } from "@prisma/client";
import { PatientCreateSchema } from "@medical-app/shared";

const prisma = new PrismaClient();

async function testCreate() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log("No user");

  const payload = {
    firstName: "API",
    lastName: "Test",
    age: 99,
    gender: "Male",
    specialty: "General Medicine"
  };

  try {
    const { specialty, ...patientData } = PatientCreateSchema.parse(payload);
    
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        userId: user.id
      }
    });
    console.log("Created successfully:", patient.id);
    
    // Now test delete
    await prisma.patient.delete({ where: { id: patient.id } });
    console.log("Deleted successfully:", patient.id);
    
  } catch(e: any) {
    console.error(e);
  }
}

testCreate().finally(() => prisma.$disconnect());
