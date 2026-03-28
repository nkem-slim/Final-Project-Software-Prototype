/**
 * Exercise plan repository — Prisma data access for ExercisePlan.
 */

import { prisma } from "../config/database";
import type { PregnancyStage } from "@prisma/client";

export const exerciseRepository = {
  findByStage: (stage: PregnancyStage) =>
    prisma.exercisePlan.findMany({
      where: { stage },
      orderBy: { createdAt: "desc" },
    }),

  create: (data: {
    userId: string;
    stage: PregnancyStage;
    title: string;
    description: string;
    duration: number;
    source?: string | null;
  }) => prisma.exercisePlan.create({ data }),
};
