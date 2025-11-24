const mongoose = require("mongoose");

const {
  getAdminByFilter,
  updateAdminByFilter,
} = require("../../services/admin/authServices");
const AppError = require("../../utils/AppError");
const { sendOtpToEmail } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");

exports.sendForgotPasswordOtp = async (req, res) => {
  const req_body = { ...req.body };
  // check admin
  const admin = await getAdminByFilter({ email: req_body.email }, "email", {
    lean: true,
  });
  if (!admin) {
    throw new AppError(400, "Email is not registered");
  }
  // send otp
  const otpData = await sendOtpToEmail({
    type: "reset password",
    email: req_body.email,
  });
  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: otpData?.data,
  });
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  const { otpId, otp } = req.body;
  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid OTP");
  }
  res.status(200).json({
    message: "Verified successfully",
    error: false,
    data: null,
  });
};

exports.changePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const admin = await getAdminByFilter(
    { email },
    "email password login_count",
    {}
  );

  if (!admin) {
    throw new AppError(400, "Email is not registered");
  }

  // chekc same password is used or not
  const isPasswordMatched = await admin.comparePassword(newPassword);
  if (isPasswordMatched) {
    throw new AppError(400, "This password is already in use");
  }

  //update admin
  const updatedAdmin = await updateAdminByFilter(
    { email },
    {
      password: await bcrypt.hash(newPassword, 12),
      is_blocked: false,
      login_count: 0,
      is_login_attempt_exceeded: false,
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
    },
    { new: true }
  );
  if (!updatedAdmin) {
    throw new AppError(400, "Error in updating details");
  }
  res.status(200).json({
    message: "Password changed successfully",
    error: false,
    data: null,
  });
};
