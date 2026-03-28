/**
 * Seed script — optional initial data for development.
 * Run: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  // Seed only if no users exist (idempotent)
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  // Example admin for local testing (password: Admin123!)
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.default.hash("Admin123!", 12);

  await prisma.user.create({
    data: {
      name: "System Admin",
      phoneNumber: "+250788000000",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed completed: 1 admin user created.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
