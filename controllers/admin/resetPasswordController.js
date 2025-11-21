const mongoose = require("mongoose");

const {
  getAdminByFilter,
  updateAdminByFilter,
} = require("../../services/admin/authServices");
const AppError = require("../../utils/AppError");
const { sendOtpToEmail } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");

exports.sendForgotPasswordOtp = async (req, res) => {
  const req_body = Object.assign({}, req.body);

  // check admin
  const filter = {
    ...(req_body.email && {
      email: req_body.email,
    }),
  };

  const admin = await getAdminByFilter(filter, "email", {
    lean: true,
  });

  if (!admin) {
    throw new AppError(400, "This email is not registered");
  }

  // send otp
  const payload = {
    ...(req_body.email && {
      type: "login",
      email: req_body.email,
    }),
  };

  const otpData = await sendOtpToEmail(payload);

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

  if (!otpId) {
    throw new AppError(400, "otpId is required");
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    throw new AppError(400, "OTP must be a 6-digit number");
  }

   if (!mongoose.isValidObjectId(otpId)) {
    throw new AppError(400, "Invalid otpId format. Must be a 24-character hex string.");
  }
  
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

exports.changePassword = async (req, session) => {
  const req_body = Object.assign({}, req.body);

  // get admin
  const filter = {
    ...(req_body.email && {
      email: req_body.email,
    }),
  };

  const admin = await getAdminByFilter(
    filter,
    "email password login_count",
    {}
  );

  if (!admin) {
    throw new AppError(400, "Provide either registered email or phone number");
  }

  // chekc same password is used or not
  const isPasswordMatched = await admin.comparePassword(req_body.newPassword);

  if (isPasswordMatched) {
    throw new AppError(400, "This password is already in use");
  }

  // change password
  admin.password = req_body.newPassword;
  const updatedPassword = await admin.save({ session });

  if (!updatedPassword) {
    throw new AppError(400, {
      message: "Failed to change password",
      error: true,
      data: null,
    });
  }

  //update admin
  const updatedAdmin = await updateAdminByFilter(
    { email: updatedPassword.email },
    {
      is_blocked: false,
      login_count: 0,
      is_login_attempt_exceeded: false,
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
    },
    { new: true, session }
  );

  if (!updatedAdmin) {
    throw new AppError(400, "Error in updating details");
  }

  return {
    message: "Password changed successfully",
    error: false,
    data: null,
  };
};
