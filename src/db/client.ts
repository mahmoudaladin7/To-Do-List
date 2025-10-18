// Purpose: one shared Prisma client instance for the whole app.
import { PrismaClient } from "../generated/prisma";
export const prisma = new PrismaClient();
