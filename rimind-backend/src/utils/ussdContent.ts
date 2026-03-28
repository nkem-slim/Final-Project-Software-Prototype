/**
 * USSD menu content — SRS §3.1.3 exact menu tree.
 * No sensitive personal health data; stateless session by sessionId.
 */

export const USSD_MENU = {
  WELCOME: `Welcome to Rimind
1. Pregnancy Info
2. Danger Signs
3. Exercise Tips
4. Nearest Clinic
5. Exit`,

  PREGNANCY_INFO: `Pregnancy Info:
- Attend antenatal care early and regularly.
- Take folic acid and iron as advised.
- Eat a balanced diet and stay hydrated.
Contact your clinic for personal advice.`,

  DANGER_SIGNS: `Danger Signs - seek care now:
- Severe headache or blurred vision
- Bleeding or severe abdominal pain
- High fever or fits
- Baby moving less or not moving
- Severe swelling. Dial your clinic or go to hospital.`,

  EXERCISE_TIPS: `Exercise Tips:
- Walk and do gentle stretches if your health worker says it's OK.
- Avoid heavy lifting and contact sports.
- Stop if you feel pain or dizzy.
See safe routines in the Rimind app.`,

  NEAREST_CLINIC: `Nearest Clinic:
Visit your local health centre or contact your community health worker for clinic locations and opening times.`,

  EXIT: "Thank you for using Rimind. Stay safe.",
} as const;

/**
 * Resolve response text for user input. text is the concatenated input (e.g. "" or "1" or "2").
 */
export const getUssdResponse = (text: string): { message: string; endSession: boolean } => {
  const input = (text || "").trim();
  if (!input) {
    return { message: USSD_MENU.WELCOME, endSession: false };
  }
  switch (input) {
    case "1":
      return { message: USSD_MENU.PREGNANCY_INFO, endSession: true };
    case "2":
      return { message: USSD_MENU.DANGER_SIGNS, endSession: true };
    case "3":
      return { message: USSD_MENU.EXERCISE_TIPS, endSession: true };
    case "4":
      return { message: USSD_MENU.NEAREST_CLINIC, endSession: true };
    case "5":
      return { message: USSD_MENU.EXIT, endSession: true };
    default:
      return { message: "Invalid option. Please try again.", endSession: false };
  }
};
