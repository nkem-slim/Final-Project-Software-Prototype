import { prisma } from "../config/database";
import type { Role } from "@prisma/client";

const userSelect = {
  id: true,
  name: true,
  phoneNumber: true,
  role: true,
  country: true,
  regionLevel1: true,
  regionLevel2: true,
  createdAt: true,
} as const;

export type CreateUserInput = {
  name: string;
  phoneNumber: string;
  password: string | null;
  role: Role;
  country?: string | null;
  regionLevel1?: string | null;
  regionLevel2?: string | null;
};

export type UpdateUserProfileInput = {
  name?: string;
  phoneNumber?: string;
  country?: string | null;
  regionLevel1?: string | null;
  regionLevel2?: string | null;
};

export const userRepository = {
  create: (data: CreateUserInput) =>
    prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        country: true,
        regionLevel1: true,
        regionLevel2: true,
        createdAt: true,
      },
    }),

  findByPhone: (phoneNumber: string) =>
    prisma.user.findUnique({
      where: { phoneNumber },
    }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: userSelect,
    }),

  updateProfileById: (id: string, data: UpdateUserProfileInput) =>
    prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    }),

  findAll: () =>
    prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: "desc" },
    }),

  findByRole: (role: Role) =>
    prisma.user.findMany({
      where: { role },
      select: userSelect,
      orderBy: { createdAt: "desc" },
    }),

  deleteById: (id: string) => prisma.user.delete({ where: { id } }),
};
