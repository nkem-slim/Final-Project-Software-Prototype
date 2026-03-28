const DIAGNOSTIC_PATTERNS = [
  /\b(you have|you've got|diagnosis|diagnosed with|you're suffering from|you likely have|this indicates?)\s+[^.]+/gi,
  /\b(take|prescribe|prescription|dosage|mg|ml)\s+\d+\s*(mg|ml|times a day)/gi,
  /\bI (diagnose|prescribe|recommend (that you take|taking))\s+[^.]+/gi,
  /\b(medication|medicine|pill|tablet)\s+[A-Za-z-]+\s+(for|to treat)/gi,
];

const REPLACEMENT_PHRASE =
  "This may need attention. Please discuss with your health worker or clinic.";

export const sanitiseAiResponse = (text: string): string => {
  let out = text;
  for (const pattern of DIAGNOSTIC_PATTERNS) {
    out = out.replace(pattern, REPLACEMENT_PHRASE);
  }
  return out.trim();
};
