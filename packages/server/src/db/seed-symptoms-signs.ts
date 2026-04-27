import { prisma } from "../index";

const symptoms = [
  // Respiratory
  { name: "Cough", system: "Respiratory", description: "Persistent or acute cough" },
  { name: "Shortness of breath", system: "Respiratory", description: "Dyspnea or breathing difficulty" },
  { name: "Chest pain", system: "Respiratory", description: "Chest discomfort or pain" },
  { name: "Wheezing", system: "Respiratory", description: "High-pitched whistling sound while breathing" },
  { name: "Sputum production", system: "Respiratory", description: "Coughing up phlegm or mucus" },
  { name: "Hemoptysis", system: "Respiratory", description: "Coughing up blood" },

  // Gastrointestinal
  { name: "Abdominal pain", system: "Gastrointestinal", description: "Stomach or belly pain" },
  { name: "Nausea", system: "Gastrointestinal", description: "Feeling sick to stomach" },
  { name: "Vomiting", system: "Gastrointestinal", description: "Expelling stomach contents" },
  { name: "Diarrhea", system: "Gastrointestinal", description: "Loose or frequent bowel movements" },
  { name: "Constipation", system: "Gastrointestinal", description: "Difficulty with bowel movements" },
  { name: "Bloating", system: "Gastrointestinal", description: "Abdominal distension" },
  { name: "Loss of appetite", system: "Gastrointestinal", description: "Anorexia or decreased appetite" },
  { name: "Dysphagia", system: "Gastrointestinal", description: "Difficulty swallowing" },
  { name: "Heartburn", system: "Gastrointestinal", description: "GERD or acid reflux" },

  // Neurological
  { name: "Headache", system: "Neurological", description: "Head pain of varying intensity" },
  { name: "Dizziness", system: "Neurological", description: "Vertigo or lightheadedness" },
  { name: "Weakness", system: "Neurological", description: "Generalized weakness or fatigue" },
  { name: "Tremor", system: "Neurological", description: "Involuntary shaking" },
  { name: "Numbness", system: "Neurological", description: "Loss of sensation" },
  { name: "Tingling", system: "Neurological", description: "Paresthesia or pins and needles" },
  { name: "Loss of consciousness", system: "Neurological", description: "Syncope or fainting" },
  { name: "Confusion", system: "Neurological", description: "Disorientation or altered mental status" },
  { name: "Memory loss", system: "Neurological", description: "Amnesia or forgetfulness" },
  { name: "Difficulty concentrating", system: "Neurological", description: "Brain fog or poor focus" },

  // Cardiovascular
  { name: "Palpitations", system: "Cardiovascular", description: "Awareness of heartbeat" },
  { name: "Syncope", system: "Cardiovascular", description: "Fainting episodes" },
  { name: "Edema", system: "Cardiovascular", description: "Swelling due to fluid accumulation" },

  // Fever/Constitutional
  { name: "Fever", system: "Constitutional", description: "Elevated body temperature" },
  { name: "Chills", system: "Constitutional", description: "Shivering sensation" },
  { name: "Night sweats", system: "Constitutional", description: "Excessive sweating during sleep" },
  { name: "Fatigue", system: "Constitutional", description: "Extreme tiredness" },
  { name: "Malaise", system: "Constitutional", description: "General feeling of illness" },

  // Musculoskeletal
  { name: "Joint pain", system: "Musculoskeletal", description: "Arthralgia or joint discomfort" },
  { name: "Muscle pain", system: "Musculoskeletal", description: "Myalgia or muscle ache" },
  { name: "Back pain", system: "Musculoskeletal", description: "Dorsal spine pain" },
  { name: "Neck stiffness", system: "Musculoskeletal", description: "Restricted neck movement" },

  // Skin
  { name: "Rash", system: "Dermatological", description: "Skin eruption or irritation" },
  { name: "Itching", system: "Dermatological", description: "Pruritus or skin irritation" },
  { name: "Skin lesions", system: "Dermatological", description: "Abnormal skin growths or sores" },
  { name: "Hives", system: "Dermatological", description: "Urticaria or raised welts" },

  // Urinary/Renal
  { name: "Dysuria", system: "Urinary", description: "Painful urination" },
  { name: "Frequency of urination", system: "Urinary", description: "Increased urination" },
  { name: "Urgency of urination", system: "Urinary", description: "Sudden need to urinate" },
  { name: "Hematuria", system: "Urinary", description: "Blood in urine" },
  { name: "Oliguria", system: "Urinary", description: "Decreased urine output" },

  // Reproductive
  { name: "Vaginal discharge", system: "Reproductive", description: "Abnormal discharge" },
  { name: "Menstrual irregularities", system: "Reproductive", description: "Irregular periods" },
  { name: "Genital pain", system: "Reproductive", description: "Pain in genital area" },

  // Eye/ENT
  { name: "Eye pain", system: "ENT", description: "Ocular discomfort" },
  { name: "Eye redness", system: "ENT", description: "Conjunctival injection" },
  { name: "Tearing", system: "ENT", description: "Excessive tear production" },
  { name: "Ear pain", system: "ENT", description: "Otalgia" },
  { name: "Hearing loss", system: "ENT", description: "Decreased auditory acuity" },
  { name: "Tinnitus", system: "ENT", description: "Ringing in ears" },
  { name: "Sore throat", system: "ENT", description: "Pharyngeal pain" },
  { name: "Difficulty swallowing", system: "ENT", description: "Odynophagia" },
  { name: "Hoarseness", system: "ENT", description: "Altered voice quality" },

  // Psychiatric/Psychological
  { name: "Anxiety", system: "Psychiatric", description: "Worry or nervousness" },
  { name: "Depression", system: "Psychiatric", description: "Persistent low mood" },
  { name: "Irritability", system: "Psychiatric", description: "Increased aggression or frustration" },
  { name: "Sleep disturbance", system: "Psychiatric", description: "Insomnia or hypersomnia" },
];

const signs = [
  // Cardiovascular signs
  { name: "Hypertension", system: "Cardiovascular", examination: "BP measurement" },
  { name: "Hypotension", system: "Cardiovascular", examination: "BP measurement" },
  { name: "Tachycardia", system: "Cardiovascular", examination: "Pulse palpation" },
  { name: "Bradycardia", system: "Cardiovascular", examination: "Pulse palpation" },
  { name: "Arrhythmia", system: "Cardiovascular", examination: "Pulse/ECG" },
  { name: "Murmur", system: "Cardiovascular", examination: "Auscultation" },
  { name: "Jugular venous distension", system: "Cardiovascular", examination: "Inspection" },
  { name: "Peripheral edema", system: "Cardiovascular", examination: "Palpation" },
  { name: "Cyanosis", system: "Cardiovascular", examination: "Inspection" },

  // Respiratory signs
  { name: "Tachypnea", system: "Respiratory", examination: "Respiration rate count" },
  { name: "Bradypnea", system: "Respiratory", examination: "Respiration rate count" },
  { name: "Wheezing", system: "Respiratory", examination: "Auscultation" },
  { name: "Crackles", system: "Respiratory", examination: "Auscultation" },
  { name: "Ronchi", system: "Respiratory", examination: "Auscultation" },
  { name: "Stridor", system: "Respiratory", examination: "Auscultation" },
  { name: "Decreased breath sounds", system: "Respiratory", examination: "Auscultation" },
  { name: "Chest wall deformity", system: "Respiratory", examination: "Inspection" },
  { name: "Hypoxia", system: "Respiratory", examination: "Pulse oximetry" },

  // Neurological signs
  { name: "Altered consciousness", system: "Neurological", examination: "Mental status" },
  { name: "Meningismus", system: "Neurological", examination: "Neck stiffness test" },
  { name: "Cranial nerve deficit", system: "Neurological", examination: "CN testing" },
  { name: "Motor weakness", system: "Neurological", examination: "Strength testing" },
  { name: "Hyperreflexia", system: "Neurological", examination: "Reflex testing" },
  { name: "Hyporeflexia", system: "Neurological", examination: "Reflex testing" },
  { name: "Pupil dilation", system: "Neurological", examination: "Pupil assessment" },
  { name: "Pupil constriction", system: "Neurological", examination: "Pupil assessment" },
  { name: "Babinski sign", system: "Neurological", examination: "Plantar reflex" },

  // Gastrointestinal signs
  { name: "Abdominal distension", system: "Gastrointestinal", examination: "Inspection" },
  { name: "Abdominal tenderness", system: "Gastrointestinal", examination: "Palpation" },
  { name: "Guarding", system: "Gastrointestinal", examination: "Palpation" },
  { name: "Rebound tenderness", system: "Gastrointestinal", examination: "Palpation" },
  { name: "Bowel sounds absent", system: "Gastrointestinal", examination: "Auscultation" },
  { name: "Bowel sounds hyperactive", system: "Gastrointestinal", examination: "Auscultation" },
  { name: "Hepatomegaly", system: "Gastrointestinal", examination: "Palpation" },
  { name: "Splenomegaly", system: "Gastrointestinal", examination: "Palpation" },
  { name: "Rigidity", system: "Gastrointestinal", examination: "Palpation" },

  // Constitutional
  { name: "Fever", system: "Constitutional", examination: "Temperature measurement" },
  { name: "Pallor", system: "Constitutional", examination: "Inspection" },
  { name: "Jaundice", system: "Constitutional", examination: "Inspection" },
  { name: "Cachexia", system: "Constitutional", examination: "General appearance" },

  // Skin signs
  { name: "Petechiae", system: "Dermatological", examination: "Inspection" },
  { name: "Purpura", system: "Dermatological", examination: "Inspection" },
  { name: "Ecchymosis", system: "Dermatological", examination: "Inspection" },
  { name: "Maculopapular rash", system: "Dermatological", examination: "Inspection" },
  { name: "Vesicles", system: "Dermatological", examination: "Inspection" },
  { name: "Pustules", system: "Dermatological", examination: "Inspection" },
  { name: "Urticaria", system: "Dermatological", examination: "Inspection" },

  // Head and neck
  { name: "Lymphadenopathy", system: "ENT", examination: "Palpation" },
  { name: "Pharyngeal erythema", system: "ENT", examination: "Inspection" },
  { name: "Exudate", system: "ENT", examination: "Inspection" },
  { name: "Tympanum erythema", system: "ENT", examination: "Otoscopy" },
  { name: "Tympanic effusion", system: "ENT", examination: "Otoscopy" },

  // Musculoskeletal
  { name: "Joint swelling", system: "Musculoskeletal", examination: "Inspection/palpation" },
  { name: "Joint erythema", system: "Musculoskeletal", examination: "Inspection" },
  { name: "Joint warmth", system: "Musculoskeletal", examination: "Palpation" },
  { name: "Limited range of motion", system: "Musculoskeletal", examination: "ROM testing" },
];

async function seedSymptomsAndSigns() {
  console.log("🌱 Seeding symptoms and signs...");

  for (const symptom of symptoms) {
    await prisma.symptom.upsert({
      where: { name: symptom.name },
      update: {},
      create: symptom,
    });
  }

  for (const sign of signs) {
    await prisma.sign.upsert({
      where: { name: sign.name },
      update: {},
      create: sign,
    });
  }

  console.log(`✅ Seeded ${symptoms.length} symptoms and ${signs.length} signs`);
}

export { seedSymptomsAndSigns };
