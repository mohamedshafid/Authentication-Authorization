import express from "express";
import passport from "passport";

import {
  getUser,
  magicLink,
  newPassword,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyMagicLink,
  verifyToken,
} from "../controllers/user.controller.js";
import { verify } from "../middlewares/user.middleware.js";

// CREATING AN ROUTER
const router = express.Router();

// API ENDPOINTS
router.post("/sign-up", signUp);
router.post("/verify-token", verifyToken);
router.post("/sign-in", signIn);
router.post("/reset-password", resetPassword);
router.post("/reset-password/:resetToken", newPassword);
router.get("/sign-out", signOut);

router.post("/magic-link", magicLink);
router.get("/verifyMagicLink", verifyMagicLink);

// SIGN IN WITH GOOGLE AND GITHUB.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
// GOOGLE CALLBACK.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/api/v1/auth/session",
    failureRedirect: "/",
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "User signed in with Google successfully",
    });
  }
);
// SIGN IN WITH GITHUB.
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);
// GITHUB CALLBACK.
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/api/v1/auth/session",
    failureRedirect: "/",
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "User signed in with Github successfully",
    });
  }
);

// GETTING THE DATA FROM THE SESSION.
router.get("/session", (req, res) => {
  if(req.isAuthenticated()){
    console.log("The user is authenticated");
  }
  res.json(req.user);
});

// ADDITIONAL ROUTES.
router.get("/getUser",verify,getUser);

export default router;
