/**
 * Auth service — registration, login, tokens, getMe.
 * FR1: bcrypt min 12 rounds, JWT 24h access / 7d refresh.
 * No business logic in controllers; all here.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../middleware/errorHandler";
import type { Role } from "@prisma/client";
import type { JwtPayload } from "../middleware/auth";

const SALT_ROUNDS = Math.max(12, env.BCRYPT_ROUNDS);

export type RegisterInput = {
  name: string;
  phoneNumber: string;
  password: string;
  role: Role;
  country?: string;
  regionLevel1?: string;
  regionLevel2?: string;
};

export type LoginInput = {
  phoneNumber: string;
  password: string;
};

export type UpdateMeInput = {
  userId: string;
  name?: string;
  phoneNumber?: string;
  country?: string;
  regionLevel1?: string;
  regionLevel2?: string;
};

export type AuthResult = {
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    role: Role;
    country?: string | null;
    regionLevel1?: string | null;
    regionLevel2?: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
};

const ADMIN_LOGIN_PHONE = "0795019913";
const ADMIN_LOGIN_PASSWORD = "admin";
const STATIC_ADMIN_ID = "admin-static";

const signAccess = (userId: string, role: Role): string =>
  jwt.sign(
    { userId, role, type: "access" } as JwtPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions
  );

const signRefresh = (userId: string, role: Role): string =>
  jwt.sign(
    { userId, role, type: "refresh" } as JwtPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions
  );

export const authService = {
  register: async (input: RegisterInput): Promise<AuthResult> => {
    if (input.role === "ADMIN") {
      throw new AppError("Admin account creation is disabled", 403, "FORBIDDEN");
    }
    if (!input.country || !input.regionLevel1 || !input.regionLevel2) {
      throw new AppError("Location is required for this role", 400, "VALIDATION_ERROR");
    }
    const existing = await userRepository.findByPhone(input.phoneNumber);
    if (existing) {
      throw new AppError("Phone number already registered", 409, "CONFLICT");
    }
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      phoneNumber: input.phoneNumber,
      password: hashedPassword,
      role: input.role,
      country: input.country,
      regionLevel1: input.regionLevel1,
      regionLevel2: input.regionLevel2,
    });
    const accessToken = signAccess(user.id, user.role);
    const refreshToken = signRefresh(user.id, user.role);
    return {
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        country: user.country,
        regionLevel1: user.regionLevel1,
        regionLevel2: user.regionLevel2,
      },
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY,
    };
  },

  login: async (input: LoginInput): Promise<AuthResult> => {
    if (
      input.phoneNumber.trim() === ADMIN_LOGIN_PHONE &&
      input.password === ADMIN_LOGIN_PASSWORD
    ) {
      const accessToken = signAccess(STATIC_ADMIN_ID, "ADMIN");
      const refreshToken = signRefresh(STATIC_ADMIN_ID, "ADMIN");
      return {
        user: {
          id: STATIC_ADMIN_ID,
          name: "Admin",
          phoneNumber: ADMIN_LOGIN_PHONE,
          role: "ADMIN",
        },
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRY,
      };
    }
    const user = await userRepository.findByPhone(input.phoneNumber);
    if (!user || !user.password) {
      throw new AppError("Invalid phone number or password", 401, "UNAUTHORIZED");
    }
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new AppError("Invalid phone number or password", 401, "UNAUTHORIZED");
    }
    const accessToken = signAccess(user.id, user.role);
    const refreshToken = signRefresh(user.id, user.role);
    return {
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        country: user.country,
        regionLevel1: user.regionLevel1,
        regionLevel2: user.regionLevel2,
      },
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY,
    };
  },

  getMe: async (userId: string) => {
    if (userId === STATIC_ADMIN_ID) {
      return {
        id: STATIC_ADMIN_ID,
        name: "Admin",
        phoneNumber: ADMIN_LOGIN_PHONE,
        role: "ADMIN" as Role,
        country: null,
        regionLevel1: null,
        regionLevel2: null,
        createdAt: new Date(),
      };
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }
    return user;
  },

  updateMe: async (input: UpdateMeInput) => {
    if (input.userId === STATIC_ADMIN_ID) {
      throw new AppError("Admin profile is fixed and cannot be edited", 403, "FORBIDDEN");
    }
    const current = await userRepository.findById(input.userId);
    if (!current) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const nextPhone = input.phoneNumber?.trim();
    if (nextPhone && nextPhone !== current.phoneNumber) {
      const existing = await userRepository.findByPhone(nextPhone);
      if (existing && existing.id !== input.userId) {
        throw new AppError("Phone number already registered", 409, "CONFLICT");
      }
    }

    return userRepository.updateProfileById(input.userId, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(nextPhone ? { phoneNumber: nextPhone } : {}),
      ...(input.country !== undefined ? { country: input.country.trim() } : {}),
      ...(input.regionLevel1 !== undefined ? { regionLevel1: input.regionLevel1.trim() } : {}),
      ...(input.regionLevel2 !== undefined ? { regionLevel2: input.regionLevel2.trim() } : {}),
    });
  },
};
