import { Platform } from "react-native";

export const THEME_COLOR = "#50a5e8";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "android"
    ? "http://rimind.medatta0.tech"
    : "http://rimind.medatta0.tech");

export const STORAGE_KEYS = {
  AUTH_TOKEN: "@rimind/accessToken",
  REFRESH_TOKEN: "@rimind/refreshToken",
  USER: "@rimind/user",
  PREGNANCY_RECORDS: "@rimind/pregnancyRecords",
  REMINDERS: "@rimind/reminders",
  AI_HISTORY: "@rimind/aiHistory",
  EXERCISE_PLANS: "@rimind/exercisePlans",
  OFFLINE_QUEUE: "@rimind/offlineQueue",
  DEVICE_ID: "@rimind/deviceId",
} as const;

export const ROLES = ["MOTHER", "HEALTH_WORKER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export const REGISTRATION_ROLES = ["MOTHER", "HEALTH_WORKER"] as const;
export type RegistrationRole = (typeof REGISTRATION_ROLES)[number];

export const LOCATION_OPTIONS = {
  Rwanda: {
    regionLevel1Label: "District",
    regionLevel2Label: "Sector",
    regionLevel1: ["Kigali", "Musanze", "Huye", "Rubavu"],
    regionLevel2ByRegion: {
      Kigali: ["Nyarugenge", "Kicukiro", "Gasabo"],
      Musanze: ["Muhoza", "Cyuve", "Kinigi"],
      Huye: ["Ngoma", "Tumba", "Huye"],
      Rubavu: ["Gisenyi", "Nyamyumba", "Kanama"],
    } as Record<string, string[]>,
  },
  Uganda: {
    regionLevel1Label: "District",
    regionLevel2Label: "Subcounty",
    regionLevel1: ["Kampala", "Wakiso", "Gulu", "Mbarara"],
    regionLevel2ByRegion: {
      Kampala: ["Central", "Kawempe", "Makindye"],
      Wakiso: ["Nansana", "Kira", "Entebbe"],
      Gulu: ["Bardege", "Pece", "Layibi"],
      Mbarara: ["Kakoba", "Nyamitanga", "Biharwe"],
    } as Record<string, string[]>,
  },
  Nigeria: {
    regionLevel1Label: "State",
    regionLevel2Label: "Local Government",
    regionLevel1: ["Lagos", "Abuja", "Kano", "Rivers"],
    regionLevel2ByRegion: {
      Lagos: ["Ikeja", "Surulere", "Eti-Osa"],
      Abuja: ["AMAC", "Bwari", "Kuje"],
      Kano: ["Nassarawa", "Tarauni", "Fagge"],
      Rivers: ["Port Harcourt", "Obio-Akpor", "Oyigbo"],
    } as Record<string, string[]>,
  },
  Kenya: {
    regionLevel1Label: "County",
    regionLevel2Label: "Subcounty",
    regionLevel1: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    regionLevel2ByRegion: {
      Nairobi: ["Westlands", "Langata", "Embakasi"],
      Mombasa: ["Nyali", "Kisauni", "Likoni"],
      Kisumu: ["Kisumu East", "Kisumu West", "Seme"],
      Nakuru: ["Nakuru Town East", "Naivasha", "Molo"],
    } as Record<string, string[]>,
  },
} as const;
export type SupportedCountry = keyof typeof LOCATION_OPTIONS;

export const DISCLAIMER_TEXT =
  "This guidance is not a medical diagnosis. Please consult a qualified health professional.";
