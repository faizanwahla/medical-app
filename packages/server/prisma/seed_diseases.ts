import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const diseases = [
  {
    name: "Heart Failure with Reduced Ejection Fraction (HFrEF)",
    icdCode: "I50.2",
    specialty: "Cardiology",
    definition: "A clinical syndrome characterized by the inability of the heart to pump blood at a rate commensurate with the requirements of the metabolizing tissues.",
    pathophysiology: "Systolic dysfunction leading to reduced stroke volume and activation of neurohormonal systems (RAAS, SNS).",
    epidemiology: "Affects approx 1-2% of adult population in developed countries.",
    symptoms: ["Dyspnea on exertion", "Orthopnea", "Paroxysmal nocturnal dyspnea", "Fatigue", "Ankle swelling"],
    signs: ["Displaced apex beat", "S3 gallop", "Jugular venous distension", "Pulmonary crackles", "Peripheral edema"],
    diagnosticCriteria: ["Echocardiographic evidence of LVEF < 40%", "Elevated NT-proBNP (>125 pg/mL)"],
    investigations: ["NT-proBNP", "Echocardiogram", "ECG", "Chest X-ray", "Cardiac MRI"],
    management: "Triple therapy: ACEi/ARNI + Beta-blocker + MRA + SGLT2i.",
    prognosis: "5-year survival approx 50% without advanced therapies.",
    reference: "ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure (2021)."
  },
  {
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    icdCode: "J44.9",
    specialty: "Pulmonology",
    definition: "A common, preventable, and treatable disease characterized by persistent respiratory symptoms and airflow limitation.",
    pathophysiology: "Chronic inflammation causing narrowing of small airways and destruction of lung parenchyma (emphysema).",
    epidemiology: "Third leading cause of death worldwide; highly associated with tobacco smoke.",
    symptoms: ["Chronic cough", "Sputum production", "Progressive dyspnea", "Wheezing"],
    signs: ["Hyperinflated chest (barrel chest)", "Reduced breath sounds", "Prolonged expiratory phase", "Pursed-lip breathing"],
    diagnosticCriteria: ["Post-bronchodilator FEV1/FVC < 0.70"],
    investigations: ["Spirometry", "Chest CT", "Alpha-1 antitrypsin levels", "Pulse oximetry"],
    management: "Smoking cessation, Bronchodilators (LAMA/LABA), Inhaled corticosteroids, Pulmonary rehabilitation.",
    prognosis: "Variable; dependent on FEV1 and frequency of exacerbations.",
    reference: "GOLD Report: Global Strategy for Prevention, Diagnosis and Management of COPD (2024)."
  },
  {
    name: "Type 2 Diabetes Mellitus",
    icdCode: "E11.9",
    specialty: "Endocrinology",
    definition: "A metabolic disorder characterized by chronic hyperglycemia due to a combination of insulin resistance and inadequate insulin secretion.",
    pathophysiology: "Insulin resistance in peripheral tissues and progressive beta-cell failure.",
    epidemiology: "Affects over 400 million people globally; rising prevalence due to obesity.",
    symptoms: ["Polyuria", "Polydipsia", "Polyphagia", "Unexplained weight loss", "Blurred vision"],
    signs: ["Acanthosis nigricans", "Delayed wound healing", "Peripheral neuropathy signs"],
    diagnosticCriteria: ["HbA1c >= 6.5%", "Fasting plasma glucose >= 126 mg/dL", "Random glucose >= 200 mg/dL with symptoms"],
    investigations: ["HbA1c", "Fasting Lipid Profile", "Urine Albumin-to-Creatinine Ratio", "Fundoscopy"],
    management: "Lifestyle modification, Metformin, SGLT2 inhibitors, GLP-1 receptor agonists, Insulin.",
    prognosis: "Increased risk of cardiovascular disease, nephropathy, and retinopathy.",
    reference: "ADA Standards of Care in Diabetes (2024)."
  },
  {
    name: "Asthma",
    icdCode: "J45.9",
    specialty: "Pulmonology",
    definition: "A heterogeneous disease, usually characterized by chronic airway inflammation.",
    pathophysiology: "Airway hyperresponsiveness, mucosal edema, and mucus production.",
    epidemiology: "Affects approximately 300 million people worldwide.",
    symptoms: ["Wheezing", "Shortness of Breath", "Chest Tightness", "Cough"],
    signs: ["Expiratory wheeze", "Tachypnea", "Use of accessory muscles"],
    diagnosticCriteria: ["Reversible airflow limitation (FEV1 increases >12% and 200mL after bronchodilator)"],
    investigations: ["Spirometry", "Peak Expiratory Flow (PEF)", "Allergy testing"],
    management: "Inhaled Corticosteroids (ICS), Short-acting Beta Agonists (SABA), Long-acting Beta Agonists (LABA).",
    prognosis: "Generally good with proper management, but severe exacerbations can be life-threatening.",
    reference: "GINA (Global Initiative for Asthma) Guidelines (2023)."
  },
  {
    name: "Essential Hypertension",
    icdCode: "I10",
    specialty: "Cardiology",
    definition: "Persistently elevated resting systemic arterial blood pressure.",
    pathophysiology: "Increased systemic vascular resistance due to complex interplay of genetic, environmental, and neurohormonal factors.",
    epidemiology: "Affects about 1 in 3 adults globally.",
    symptoms: ["Mostly asymptomatic", "Headache", "Dizziness", "Palpitations"],
    signs: ["Elevated BP readings >130/80 mmHg", "S4 gallop (in long-standing cases)"],
    diagnosticCriteria: ["Average of >=2 readings obtained on >=2 occasions >130/80 mmHg"],
    investigations: ["ECG", "Urinalysis", "Serum Creatinine", "Fasting blood glucose/lipids"],
    management: "Lifestyle modification, Thiazide diuretics, ACEi/ARB, Calcium channel blockers.",
    prognosis: "Major risk factor for stroke, MI, heart failure, and CKD.",
    reference: "AHA/ACC Hypertension Guidelines (2017/2023 updates)."
  },
  {
    name: "Atrial Fibrillation",
    icdCode: "I48.9",
    specialty: "Cardiology",
    definition: "A supraventricular tachyarrhythmia characterized by uncoordinated atrial activation with consequent deterioration of atrial mechanical function.",
    pathophysiology: "Multiple re-entrant wavelets in the atria, often triggered by pulmonary vein ectopy.",
    epidemiology: "The most common sustained cardiac arrhythmia in adults.",
    symptoms: ["Palpitations", "Shortness of Breath", "Fatigue", "Dizziness"],
    signs: ["Irregularly irregular pulse", "Absent a-waves in JVP"],
    diagnosticCriteria: ["ECG showing absence of distinct P waves and irregularly irregular RR intervals"],
    investigations: ["12-lead ECG", "Echocardiogram", "Thyroid function tests"],
    management: "Rate control (Beta-blockers, CCB), Rhythm control (Cardioversion, Amiodarone), Anticoagulation (DOACs based on CHA2DS2-VASc score).",
    prognosis: "Increases risk of stroke by 5-fold.",
    reference: "ESC Guidelines for the diagnosis and management of atrial fibrillation (2020)."
  }
];

async function main() {
  console.log("Start seeding real clinical diseases...");
  for (const disease of diseases) {
    await prisma.disease.upsert({
      where: { icdCode: disease.icdCode },
      update: disease,
      create: disease,
    });
  }
  console.log("Finished seeding diseases.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
