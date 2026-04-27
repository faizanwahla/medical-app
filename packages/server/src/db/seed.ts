import { PrismaClient } from "@prisma/client";
import { seedSymptomsAndSigns } from "./seed-symptoms-signs";
import { seedDiseases } from "./seed-diseases";

const prisma = new PrismaClient();

async function main() {
  // Seed Specialties
  const specialties = [
    { name: "General Medicine", description: "Internal medicine" },
    { name: "Pediatrics", description: "Child and adolescent medicine" },
    { name: "Cardiology", description: "Heart and cardiovascular system" },
    { name: "Dermatology", description: "Skin conditions" },
    { name: "Neurology", description: "Nervous system disorders" },
    { name: "Respiratory Medicine", description: "Lung and respiratory diseases" },
    { name: "Gastroenterology", description: "Digestive system" },
    { name: "Rheumatology", description: "Joint and connective tissue diseases" },
    { name: "Endocrinology", description: "Hormone and metabolic disorders" },
    { name: "Infectious Diseases", description: "Infectious disease management" },
    { name: "Critical Care", description: "Intensive care medicine" },
    { name: "Surgery", description: "Surgical procedures and management" },
    { name: "Urology", description: "Urinary and male reproductive system" },
  ];

  for (const s of specialties) {
    await prisma.specialty.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }

  // Seed Medicines
  const medicines = [
    { name: "Metformin", type: "Oral antidiabetic", uses: ["Type 2 diabetes"], dosage: "500-2000mg daily", sideEffects: ["nausea", "diarrhea"], contraindications: ["severe renal impairment"] },
    { name: "Lisinopril", type: "ACE inhibitor", uses: ["Hypertension", "Heart failure"], dosage: "10-40mg once daily", sideEffects: ["dry cough", "hyperkalemia"], contraindications: ["pregnancy", "bilateral renal artery stenosis"] },
    { name: "Amlodipine", type: "Calcium channel blocker", uses: ["Hypertension", "Angina"], dosage: "5-10mg once daily", sideEffects: ["peripheral edema", "headache"], contraindications: ["severe aortic stenosis"] },
    { name: "Salbutamol", type: "SABA", uses: ["Asthma", "COPD"], dosage: "2 puffs as needed", sideEffects: ["tremor", "tachycardia"], contraindications: [] },
    { name: "Atorvastatin", type: "Statin", uses: ["Hyperlipidemia", "CVD prevention"], dosage: "10-80mg once daily", sideEffects: ["myalgia", "elevated LFTs"], contraindications: ["active liver disease"] },
    { name: "Aspirin", type: "Antiplatelet", uses: ["CVD prevention", "Pain"], dosage: "75-325mg daily", sideEffects: ["GI bleeding", "tinnitus"], contraindications: ["active peptic ulcer", "bleeding disorders"] },
    { name: "Sumatriptan", type: "Triptan", uses: ["Migraine"], dosage: "50-100mg as needed", sideEffects: ["chest tightness", "dizziness"], contraindications: ["ischemic heart disease", "uncontrolled hypertension"] },
    { name: "Hydrocortisone cream", type: "Topical steroid", uses: ["Atopic dermatitis", "Eczema"], dosage: "Apply thin layer BID-TID", sideEffects: ["skin thinning", "hypopigmentation"], contraindications: ["fungal skin infections"] },
    { name: "Amoxicillin", type: "Penicillin antibiotic", uses: ["Pneumonia", "Infections"], dosage: "500mg TID for 7 days", sideEffects: ["diarrhea", "rash"], contraindications: ["penicillin allergy"] },
    { name: "Insulin (Human)", type: "Insulin", uses: ["Type 1 diabetes", "Type 2 diabetes"], dosage: "As per sliding scale", sideEffects: ["hypoglycemia", "weight gain"], contraindications: [] },
  ];

  for (const m of medicines) {
    await prisma.medicine.upsert({
      where: { name: m.name },
      update: m,
      create: m,
    });
  }

  // Seed comprehensive symptoms and signs
  await seedSymptomsAndSigns();

  // Seed enhanced disease database
  await seedDiseases();

  console.log("✅ Seed completed successfully!");
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
