import { User } from "../models/user.model.js";

import jwt from "jsonwebtoken";

export const verify = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    //   CHECKING IF TOKEN EXISTS.
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
        req.userId = user._id;
        return next();
      } catch (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }
    }

    //  CHECKING IF USER IS LOGGED IN.
    if (req.isAuthenticated()) {
      console.log("In here ",req.user);
      req.userId = req.user._id;
      return next();
    }
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
