/**
 * USSD controller — public callback for Africa's Talking.
 */

import { Request, Response, NextFunction } from "express";
import { ussdService } from "../services/ussdService";

/**
 * Africa's Talking sends POST (form-urlencoded or JSON) with sessionId, phoneNumber, text, serviceCode.
 * Response: plain text starting with CON (continue) or END (terminate).
 */
const handleUssd = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sessionId = (req.body?.sessionId ?? req.query?.sessionId ?? "") as string;
    const phoneNumber = (req.body?.phoneNumber ?? req.query?.phoneNumber ?? "") as string;
    const text = (req.body?.text ?? req.query?.text ?? "") as string;
    const serviceCode = (req.body?.serviceCode ?? req.query?.serviceCode ?? "") as string;

    const output = ussdService.handle({ sessionId, phoneNumber, text, serviceCode });
    res.set("Content-Type", "text/plain");
    res.send(output);
  } catch (e) {
    next(e);
  }
};

export const ussdController = { handleUssd };
