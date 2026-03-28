/**
 * USSD service — stateless session handling; Africa's Talking format.
 * SRS FR8: menu tree 1–5; session state via telecom sessionId.
 */

import { getUssdResponse } from "../utils/ussdContent";

export type UssdRequest = {
  sessionId: string;
  phoneNumber: string;
  text: string;
  serviceCode: string;
};

/**
 * Process USSD input and return CON/END response body for Africa's Talking.
 */
export const ussdService = {
  handle: (req: UssdRequest): string => {
    const { message, endSession } = getUssdResponse(req.text);
    const prefix = endSession ? "END" : "CON";
    return `${prefix} ${message}`;
  },
};
