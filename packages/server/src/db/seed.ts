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
    { name: "Budesonide", type: "Inhaled corticosteroid", uses: ["Asthma"], dosage: "200-400mcg twice daily", sideEffects: ["oral thrush", "dysphonia"], contraindications: ["hypersensitivity"] },
    { name: "Prednisolone", type: "Systemic corticosteroid", uses: ["Asthma exacerbation", "Inflammatory conditions"], dosage: "30-40mg once daily", sideEffects: ["hyperglycemia", "mood change"], contraindications: ["untreated systemic infection"] },
    { name: "Atorvastatin", type: "Statin", uses: ["Hyperlipidemia", "CVD prevention"], dosage: "10-80mg once daily", sideEffects: ["myalgia", "elevated LFTs"], contraindications: ["active liver disease"] },
    { name: "Aspirin", type: "Antiplatelet", uses: ["CVD prevention", "Pain"], dosage: "75-325mg daily", sideEffects: ["GI bleeding", "tinnitus"], contraindications: ["active peptic ulcer", "bleeding disorders"] },
    { name: "Clopidogrel", type: "Antiplatelet", uses: ["Acute coronary syndrome", "Secondary stroke prevention"], dosage: "75mg once daily", sideEffects: ["bleeding", "rash"], contraindications: ["active bleeding"] },
    { name: "Nitroglycerin", type: "Nitrate", uses: ["Angina", "Acute coronary syndrome"], dosage: "0.4mg sublingual as needed", sideEffects: ["headache", "hypotension"], contraindications: ["recent phosphodiesterase inhibitor use", "hypotension"] },
    { name: "Metoprolol", type: "Beta blocker", uses: ["Myocardial infarction", "Heart failure", "Hypertension"], dosage: "25-100mg twice daily", sideEffects: ["bradycardia", "fatigue"], contraindications: ["cardiogenic shock", "severe bradycardia"] },
    { name: "Sumatriptan", type: "Triptan", uses: ["Migraine"], dosage: "50-100mg as needed", sideEffects: ["chest tightness", "dizziness"], contraindications: ["ischemic heart disease", "uncontrolled hypertension"] },
    { name: "Hydrocortisone cream", type: "Topical steroid", uses: ["Atopic dermatitis", "Eczema"], dosage: "Apply thin layer BID-TID", sideEffects: ["skin thinning", "hypopigmentation"], contraindications: ["fungal skin infections"] },
    { name: "Amoxicillin", type: "Penicillin antibiotic", uses: ["Pneumonia", "Infections"], dosage: "500mg TID for 7 days", sideEffects: ["diarrhea", "rash"], contraindications: ["penicillin allergy"] },
    { name: "Azithromycin", type: "Macrolide antibiotic", uses: ["Atypical pneumonia", "Respiratory infections"], dosage: "500mg once daily", sideEffects: ["nausea", "QT prolongation"], contraindications: ["significant QT prolongation"] },
    { name: "Ceftriaxone", type: "Cephalosporin antibiotic", uses: ["Sepsis", "Pneumonia", "Surgical prophylaxis"], dosage: "1-2g once daily", sideEffects: ["diarrhea", "biliary sludge"], contraindications: ["severe cephalosporin allergy"] },
    { name: "Furosemide", type: "Loop diuretic", uses: ["Heart failure", "Fluid overload"], dosage: "20-80mg once or twice daily", sideEffects: ["hypokalemia", "dehydration"], contraindications: ["anuria", "severe dehydration"] },
    { name: "Nitrofurantoin", type: "Urinary antibiotic", uses: ["Uncomplicated urinary tract infection"], dosage: "100mg BID for 5 days", sideEffects: ["nausea", "dark urine"], contraindications: ["significant renal impairment"] },
    { name: "Ondansetron", type: "Antiemetic", uses: ["Nausea", "Vomiting"], dosage: "4-8mg every 8 hours as needed", sideEffects: ["constipation", "QT prolongation"], contraindications: ["congenital long QT syndrome"] },
    { name: "Insulin (Human)", type: "Insulin", uses: ["Type 1 diabetes", "Type 2 diabetes"], dosage: "As per sliding scale", sideEffects: ["hypoglycemia", "weight gain"], contraindications: [] },
    { name: "Omeprazole", type: "Proton pump inhibitor", uses: ["GERD", "Peptic ulcer disease"], dosage: "20-40mg once daily", sideEffects: ["headache", "abdominal discomfort"], contraindications: ["hypersensitivity"] },
    { name: "Ferrous Sulfate", type: "Iron supplement", uses: ["Iron deficiency anemia"], dosage: "200mg once to three times daily", sideEffects: ["constipation", "dark stools"], contraindications: ["iron overload states"] },
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
