import type { Role } from '../utils/constants';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  HealthInfo: undefined;
  AIChat: undefined;
  Reminders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PregnancyRecord: { userId?: string };
  CHW: undefined;
  Admin: undefined;
};
