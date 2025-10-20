import bcrypt from "bcrypt";
import { prisma } from "../../db/client";

export async function createUser(email: string, password: string) {
  //Normalize the email its optional but helpful
  const normalized = email.trim().toLowerCase();

  // Check that use dosen't exist
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    const err = new Error("Email already registered");
    (err as any).code = "EMAIL_TAKEN";
    throw err;
  }

  //Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email: normalized, passwordHash },
    select: { id: true, email: true, createdAt: true },
  });
  return user;
}
