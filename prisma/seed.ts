import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  // Seed GarmentTypes (for alteration service)
  const garmentTypes = [
    { name: "Pants", slug: "pants" },
    { name: "Military Uniform", slug: "military-uniform" },
    { name: "Shirt", slug: "shirt" },
    { name: "Shorts", slug: "shorts" },
  ];

  for (const gt of garmentTypes) {
    await prisma.garmentType.upsert({
      where: { slug: gt.slug },
      update: {},
      create: gt,
    });
  }

  // Seed Categories (for ready-made products)
  const categories = [
    { name: "Military Uniforms", slug: "military-uniforms" },
    { name: "Shirts", slug: "shirts" },
    { name: "Pants", slug: "pants" },
    { name: "Shorts", slug: "shorts" },
    { name: "Caps", slug: "caps" },
    { name: "Belts", slug: "belts" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Seed admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@jendave.com" },
    update: {},
    create: {
      email: "admin@jendave.com",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Seed completed successfully.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
