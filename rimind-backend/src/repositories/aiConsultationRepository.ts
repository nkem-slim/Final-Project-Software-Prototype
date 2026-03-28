import { prisma } from "../config/database";

const DEFAULT_DISCLAIMER =
  "This guidance is not a medical diagnosis. Please consult a qualified health professional.";

export const aiConsultationRepository = {
  create: (data: {
    userId: string | null;
    question: string;
    response: string;
    disclaimer?: string;
  }) =>
    prisma.aIConsultation.create({
      data: {
        ...data,
        disclaimer: data.disclaimer ?? DEFAULT_DISCLAIMER,
      },
    }),

  findByUserId: (userId: string) =>
    prisma.aIConsultation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
};
