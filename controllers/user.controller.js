// NECCESARY IN BUILD FILES IMPORT
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// OTHER FILES IMPORTS.
import { User } from "../models/user.model.js";
import {
  generateMagicLink,
  generateResetToken,
  generateVerificationToken,
  sendMagicLinkEmail,
  sendResetEmail,
  sendVerificationEmail,
} from "../utils/user.util.js";

// SIGNUP CONTROLLER.
export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // CHECKING IF USER ALREADY EXISTS.
    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }
    // HASHING PASSWORD.
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // CREATING A TOKEN.
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = Date.now() + 3600000; // 1 HOUR.

    // SENDING VERIFICATION EMAIL.
    await sendVerificationEmail(email, verificationToken);

    // CREATING A NEW USER.
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });
    // SAVING THE USER.
    await newUser.save();

    // CREATING A JWT TOKEN.
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // SETTING THE TOKEN IN COOKIE.
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000), // 1 HOUR.
    });

    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.log("Error in signing up", err);
    res.json({
      success: false,
      message: "Error in signing up",
    });
  }
};
// VERIFY CONTROLLER.
export const verifyToken = async (req, res) => {
  const { verificationToken } = req.body;
  try {
    if (!verificationToken) {
      return res.json({
        success: false,
        message: "Verification token is required",
      });
    }
    // FINDING THE USER.
    const user = await User.findOne({ verificationToken });
    // CHECKING IF USER EXISTS.
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // CHECKING IF TOKEN IS EXPIRED.
    if (Date.now() > user.verificationTokenExpires) {
      return res.json({
        success: false,
        message: "Verification token expired",
      });
    }
    // UPDATING THE USER.
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;
    // SAVING THE USER.
    await user.save();
    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "User verified successfully",
    });
  } catch (err) {
    console.log("Error in verifying token", err);
    res.json({
      success: false,
      message: "Error in verifying token",
    });
  }
};
// SIGNIN CONTROLLER.
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // CHECKING IF USER EXISTS.
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // CHECKING IF PASSWORD MATCHES.
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // CREATING A JWT TOKEN.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // SETTING THE TOKEN IN COOKIE.
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000), // 1 HOUR.
    });
    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "User signed in successfully",
    });
  } catch (err) {
    console.log("Error in signing in", err);
    res.json({
      success: false,
      message: "Error in signing in",
    });
  }
};
// RESET PASSWORD CONTROLLER.
export const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // CHECKING IF USER EXISTS.
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // GENERATING RESET TOKEN.
    const resetToken = generateResetToken();
    const resetTokenExpires = Date.now() + 3600000; // 1 HOUR.

    // SENDING RESET EMAIL.
    const url = `http://localhost:3000/api/v1/auth/reset-password/${resetToken}`;
    await sendResetEmail(email, url);

    // UPDATING THE USER.
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    // SAVING THE USER.
    await user.save();

    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "Reset email sent successfully",
    });
  } catch (err) {
    console.log("Error in resetting password", err);
    res.json({
      success: false,
      message: "Error in resetting password",
    });
  }
};
// NEW PASSWORD CONTROLLER.
export const newPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  try {
    if (!password) {
      return res.json({
        success: false,
        message: "Password is required",
      });
    }
    // FINDING THE USER.
    const user = await User.findOne({
      resetToken,
    });
    // CHECKING IF USER EXISTS.
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // CHECKING IF TOKEN IS EXPIRED.
    if (Date.now() > user.resetTokenExpires) {
      return res.json({
        success: false,
        message: "Reset token expired",
      });
    }
    // HASHING PASSWORD.
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // UPDATING THE USER.
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    // SAVING THE USER.
    await user.save();
    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log("Error in creating new password", err);
    res.json({
      success: false,
      message: "Error in creating new password",
    });
  }
};
// SIGNOUT CONTROLLER.
export const signOut = async (req, res) => {
  const token = req.cookies?.token;
  try {
    //  CHECKING IF TOKEN EXISTS.
      if(token){
        res.clearCookie("token");
        return res.json({
          success: true,
          message: "User signed out successfully",
        });
      }
      // CHECKING IF USER IS LOGGED IN.
       if (req.isAuthenticated()) {
        console.log("In here ");
         req.logout((err) => {
           // Passport logout
           if (err) {
             return res
               .status(500)
               .json({ success: false, message: "Logout failed" });
           }
          //  DESTROYING THE SESSION.
           req.session.destroy(() => {
             // Destroy session
             res.clearCookie("connect.sid"); // Remove session cookie
             return res.json({
               success: true,
               message: "Logged out (Google OAuth User)",
             });
           });
         });
         return;
       }

    return res.json({
      success: false,
      message: "User not signed in",
    });
  } catch (err) {
    console.log("Error in signing out", err);
    res.json({
      success: false,
      message: "Error in signing out",
    });
  }
};

// MAGIC LINK CONTROLLER.
export const magicLink = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    // CHECKING IF USER EXISTS.
    if (!user) {
      user = User.create({ email });
    }
    // GENERATING MAGIC LINK.
    const magicLink = await generateMagicLink(email);

    // SENDING MAGIC LINK.
    await sendMagicLinkEmail(email, magicLink);

    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "Magic link sent successfully",
    });
  } catch (err) {
    console.log("Error in magic link", err);
    res.json({
      success: false,
      message: "Error in magic link",
    });
  }
};
// VERIFY MAGIC LINK CONTROLLER.
export const verifyMagicLink = async (req, res) => {
  const { token } = req.query;
  try {
    if (!token) {
      return res.json({
        success: false,
        message: "Token is required",
      });
    }
    // VERIFYING THE TOKEN.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired magic link",
      });
    }
    // FINDING THE USER.
    const user = await User.findOne({ email: decoded.email });
    // CHECKING IF USER EXISTS.
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // CREATING A JWT TOKEN.
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // SETTING THE TOKEN IN COOKIE.
    res.cookie("token", newToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 3600000), // 1 HOUR.
    });
    // UPDATING THE USER.
    user.isVerified = true;
    // SAVING THE USER.
    await user.save();
    // RETURNING RESPONSE.
    res.json({
      success: true,
      message: "User verified successfully",
    });
  } catch (err) {
    console.log("Error in verifying magic link", err);
    res.json({
      success: false,
      message: "Error in verifying magic link",
    });
  }
};

// ADDITIONAL CONTROLLERS.
export const getUser=async(req,res)=>{
   try{
      // TAKEN FROM THE MIDDLEWARE.
      const userId=req.userId;
      const user=await User.findById(userId);
      if(!user){
         return res.json({
            success:false,
            message:"User not found"
         });
      }
      // RETURNING RESPONSE.
      res.json({
         success:true,
         user
      });
   }catch(err){
      console.log("Error in getting user",err);
      res.json({
        success:false,
        message:"Error in getting user"
      });
   }
}
