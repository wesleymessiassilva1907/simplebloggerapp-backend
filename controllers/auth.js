import { User } from "../models/user.js";
import sendEmail from "../utils/email.js";
import { generateActivationToken, sendToken } from "../utils/jwt.js";
import {
  comparePassword,
  hashPassword,
  hashSyncPassword,
} from "../utils/password.js";
import randomstring from "randomstring";
import {
  getUserByActivationToken,
  getUserByEmail,
  getUserByRandomString,
} from "../utils/user.js";

const getPrivateData = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "You got access to the private data in this route",
    user: req.user,
  });
};

const register = async (req, res) => {
  try {
    let user = await getUserByEmail(req);
    if (user) {
      return res.status(400).json({ error: "User Already Exist!" });
    }

    let hashedPassword = await hashPassword(req.body.password);
    const activationToken = generateActivationToken();

    user = await new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      activationToken,
    }).save();

    const activationLink = `${process.env.BASE_URL}/activate/${activationToken}`;
    const htmlContent = `
        <p>Hello ${user.firstName},</p>
        <p>Thank you for registering with Saas. To activate your account, click the button below:</p>
        <a href="${activationLink}">
        <button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Activate Your Account
        </button>
        </a>
        `;

    await sendEmail(user.email, "Account Activation", htmlContent);

    res.status(200).json({
      message: "Activation link sent to your email",
      activationToken: activationToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await getUserByActivationToken(req);
    if (!user) {
      return res.status(400).json({ error: "Invalid activation token!" });
    }

    user.isActive = true;
    user.activationToken = undefined;
    await user.save();

    res.status(200).json({
      message: "Account activated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    let user = await getUserByEmail(req);

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register!" });
    }

    const isPasswordValid = await comparePassword(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    const token = sendToken(user);
    const userName = user.firstName;

    res.status(200).json({
      message: "Login successful",
      token,
      userName,
      role: user.role,
      tenant: user.tenant,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await getUserByEmail(req);

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register." });
    }

    const resetToken = randomstring.generate(10);
    const resetTokenExpires = Date.now() + 3600000;

    user.randomString = resetToken;
    user.randomStringExpires = resetTokenExpires;
    await user.save();

    const resetLink = `${process.env.BASE_URL}/verifyRandomString/${resetToken}`;

    const htmlContent = `
        <p>Hello ${user.firstName},</p>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}">
          <button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Reset Your Password
          </button>
        </a>
      `;

    await sendEmail(user.email, "Password Reset", htmlContent);

    res.status(200).json({
      message: "Password reset link sent to your email",
      resetToken: resetToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyRandomString = async (req, res, next) => {
  try {
    const user = await getUserByRandomString(req);

    if (!user) {
      return res.status(400).json({ error: "Invalid Link" });
    }

    if (user.randomStringExpires < Date.now()) {
      return res.status(400).json({ error: "Password reset link has expired" });
    }

    res.status(200).json({ message: "Random String Verified" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetpassword = async (req, res, next) => {
  try {
    const user = await getUserByRandomString(req);

    if (!user) {
      return res.status(400).json({ error: "Invalid Link" });
    }

    if (user.randomStringExpires < Date.now()) {
      return res.status(400).json({ error: "Password reset link has expired" });
    }

    const hashedPassword = hashSyncPassword(req.body.password);
    user.password = hashedPassword;
    user.randomString = undefined;
    user.randomStringExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  getPrivateData,
  register,
  login,
  forgotPassword,
  verifyRandomString,
  resetpassword,
  activateUser,
};
