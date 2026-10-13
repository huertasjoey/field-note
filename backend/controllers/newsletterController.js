import Subscriber from "../models/Subscriber.js";
import { HttpError } from "../middleware/errorHandler.js";
import { EMAIL_RE } from "../utils/helpers.js";

export const subscribe = async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      throw new HttpError(400, "Please enter a valid email address");
    }
    try {
      await Subscriber.create({ email });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ message: "You are already subscribed. Thanks!", alreadySubscribed: true });
      }
      throw err;
    }
    res.status(201).json({ message: "Thanks for subscribing to Fieldnote!" });
  } catch (err) {
    next(err);
  }
};
