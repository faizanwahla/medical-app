import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/auth.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = "test@example.com";
  const password = "Password123"; // Meets requirements: 8 chars, 1 upper, 1 digit
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      specialty: "General Medicine",
      role: "PHYSICIAN",
    },
  });

  console.log("Created test user:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
