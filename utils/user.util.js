import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// GENERATING A VERIFICATION TOKEN.
export const generateVerificationToken = () => {
  return (
    (crypto.randomBytes(3).readUIntBE(0, 3) % 900000) +
    100000
  ).toString();
};
// GENERATING A RESET TOKEN.
export const generateResetToken = () => {
  return (
    (crypto.randomBytes(3).readUIntBE(0, 3) % 900000) +
    100000
  ).toString();
};

export const sendVerificationEmail = async (email, verificationToken) => {
  // SENDING THE VERIFICATION EMAIL.
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      text: `Your verification code is ${verificationToken}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Error in sending verification email", err);
    throw new Error("Error in sending verification email");
  }
};

export const sendResetEmail = async (email, url) => {
  // SENDING THE RESET EMAIL.
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset",
      text: `Your reset url is ${url}`, // URL TO RESET PASSWORD.
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Error in sending reset email", err);
    throw new Error("Error in sending reset email");
  }
};

export const generateMagicLink = async (email) => {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const link = `https://authentication-tcql.onrender.com/api/v1/auth/verifyMagicLink/?token=${token}`;
  return link;
};

export const sendMagicLinkEmail = async (email,magicLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Magic Link",
      text: `Your magic link is ${magicLink}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Error in sending magic link email", err);
    throw new Error("Error in sending magic link email");
  }
};
