import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";

import { User } from "../models/user.model.js";

import dotenv from "dotenv";
dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://authentication-tcql.onrender.com/api/v1/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.email,
            avatar: profile.photos[0].value,
          });
        }
        user.isVerified = true;
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        "https://authentication-tcql.onrender.com/api/v1/auth/github/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let email = profile?.emails?.[0]?.value; // Check if email is available

        // Fetch email from GitHub API if not present
        if (!email) {
          const emailResponse = await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );
          const emails = await emailResponse.json();
          console.log(emails);
          email = emails.find((e) => e.primary && e.verified)?.email;
        }

        if (!email) {
          return done(new Error("Email not available from GitHub"), null);
        }

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            name: profile.displayName,
            email: email, // Now email is correctly fetched
            avatar: profile.photos?.[0]?.value,
          });
        }

        user.isVerified = true;
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
