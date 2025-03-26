import mongoose from "mongoose";

// FOR VALIDATION.
import validator from "validator";

// SCHEMA FOR AUTHENTICATION.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: (v) => {
          return validator.isEmail(v);
        },
        message: "{VALUE} is not a valid email",
      },
    },
    password: {
      type: String,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.",
      },
    },
    avatar: {
      type: String,
      default: "https://picsum.photos/200/300",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.user || mongoose.model("User", userSchema); // CREATING A MODEL.
