import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const registerUser = async ({
  email,
  password,
  name,
  phone,
}: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, phone },
    select: { id: true, email: true, name: true, role: true, phone: true },
  });

  return user;
};
