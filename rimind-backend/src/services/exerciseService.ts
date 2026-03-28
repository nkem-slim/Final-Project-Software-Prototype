import { exerciseRepository } from "../repositories/exerciseRepository";
import type { PregnancyStage } from "@prisma/client";

export type CreateExerciseInput = {
  userId: string;
  stage: PregnancyStage;
  title: string;
  description: string;
  duration: number;
  source?: string | null;
};

export const exerciseService = {
  getByStage: (stage: PregnancyStage) => exerciseRepository.findByStage(stage),

  create: (input: CreateExerciseInput) => exerciseRepository.create(input),
};
