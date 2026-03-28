import { userRepository } from "../repositories/userRepository";

export const chwService = {
  getPatients: () => userRepository.findByRole("MOTHER"),
};
