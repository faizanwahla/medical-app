import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding dummy patients...");
  
  // Find a user to attach patients to
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log("No user found in the database. Run the app and register a user first.");
    return;
  }

  const dummyPatients = [
    {
      userId: user.id,
      firstName: "James",
      lastName: "Smith",
      age: 45,
      gender: "Male",
      bloodType: "A+",
      allergies: ["Penicillin"],
      pastMedicalHistory: ["Hypertension"],
      presentingComplaint: "Chest Pain, Shortness of Breath",
      durationOfIllness: "2 days",
      systemicReview: "Patient reports worsening chest pain radiating to left arm.",
      examFindings: "Elevated blood pressure, tachycardic."
    },
    {
      userId: user.id,
      firstName: "Maria",
      lastName: "Garcia",
      age: 32,
      gender: "Female",
      bloodType: "O-",
      allergies: [],
      pastMedicalHistory: ["Asthma"],
      presentingComplaint: "Wheezing, Cough",
      durationOfIllness: "1 week",
      systemicReview: "Frequent nighttime awakenings due to cough.",
      examFindings: "Bilateral expiratory wheezes on auscultation."
    },
    {
      userId: user.id,
      firstName: "Robert",
      lastName: "Johnson",
      age: 60,
      gender: "Male",
      bloodType: "B+",
      allergies: ["Sulfa"],
      pastMedicalHistory: ["Type 2 Diabetes"],
      presentingComplaint: "Fatigue, Polyuria",
      durationOfIllness: "3 months",
      systemicReview: "Increased thirst and urination.",
      examFindings: "Decreased sensation in bilateral feet (monofilament test)."
    }
  ];

  for (const p of dummyPatients) {
    await prisma.patient.create({
      data: p
    });
  }

  console.log("Finished seeding dummy patients.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
