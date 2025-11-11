const jwt = require("jsonwebtoken");
const moment = require("moment");
const bcrypt = require("bcryptjs");

const { sendOtpToEmail } = require("../../utils/sendOtp");
const AppError = require("../../utils/AppError");
const { verifyOtp } = require("../../utils/verifyOtp");
const {
  registerMerchant,
  updateMerchantByFilter,
  getMerchantByFilter,
} = require("../../services/merchant/authService");
const { sendEmail } = require("../../utils/emailDispatcher");
const {
  getMerchantKycByFilter,
} = require("../../services/merchant/kycService");

exports.sendRegistrationOtp = async (req, res) => {
  const req_body = { ...req.body };

  const emailObject = {
    type: "register-otp",
    email: req_body.email,
    userName: req_body.userName,
    title: "Registration",
  };

  const emailData = await sendOtpToEmail(emailObject);

  if (emailData.error) {
    throw new AppError(400, emailData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      otpId: emailData?.data.otpId,
      ...req_body,
    },
  });
};

exports.verifyRegistrationOtp = async (req, session) => {
  const req_body = { ...req.body };

  //verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");
  }

  //register merchant
  const payload = {
    ...req_body,
    ipAddress: req.ipAddress,
    locationDetails: req.locationDetails,
  };

  const registerDetails = await registerMerchant(payload, session);
  if (registerDetails.error) {
    throw new AppError(400, registerDetails.message);
  }

  const registerData = registerDetails.data;

  const response = {
    merchantType: registerData.merchant_type,
    businessName: registerData.business_name,
    businessCategory: registerData.business_category,
    fullName: registerData.full_name,
    profession: registerData.profession,
    email: registerData.email,
    phoneCode: registerData.phone_code,
    phone: registerData.phone,
    jwtToken: {
      tokenName: "merchant_token",
      token: registerData.token,
    },
    kycStatus: "PENDING",
    onboardingMode: registerData.onboarding_mode,
    liveOnboardingEnabled: registerData.live_onboarding_enabled,
  };

  const emailObject = {
    userName:
      registerData.merchant_type === "ENTITY"
        ? registerData.business_name
        : registerData.full_name,
    kycUrl: `${process.env.CLIENT_BASE_URL1}/dashboard/account/kyc`,
    email: registerData.email,
    type: "registration-success",
  };

  const isEmailSent = await sendEmail(emailObject);
  if (isEmailSent.error) {
    throw new AppError(400, isEmailSent.message);
  }

  return {
    message: registerData.message || "Registration successful",
    error: false,
    data: response,
  };
};

exports.sendLoginOtp = async (req, res) => {
  const req_body = { ...req.body };

  // check user exists or not
  const merchantData = await getMerchantByFilter(
    { email: req_body?.email },
    "_id auth_mode google_auth_secret",
    {
      lean: true,
    }
  );
  if (!merchantData) {
    throw new AppError(400, "Email is not registered");
  }
  // Send OTP to email
  const otpData = await sendOtpToEmail({
    type: "login-otp",
    email: req_body.email,
    userName:
      merchantData.merchant_type === "ENTITY"
        ? merchantData.business_name
        : merchantData.full_name,
    title: "Login",
  });

  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: "OTP sent to email",
    error: false,
    data: {
      ...otpData?.data,
    },
  });
};

exports.verifyLoginOtp = async (req, res) => {
  const req_body = { ...req.body };

  // verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid OTP");
  }

  // create token
  const jwtToken = jwt.sign(
    { data: req_body?.email },
    process.env.USER_JWT_SECRET,
    {
      expiresIn: process.env.USER_JWT_EXPIRES_IN,
    }
  );
  // update merchant
  const updatedMerchant = await updateMerchantByFilter(
    { email: req_body.email },
    {
      token: jwtToken,
      last_login_date: new Date().getTime(),
      incorrect_login_count: 0,
      last_failed_login_at: null,
    },
    { new: true }
  );

  if (!updatedMerchant) {
    throw new AppError(400, "Error in updating merchant");
  }
  // getKycDetails
  const kycData = await getMerchantKycByFilter(
    { merchant_id: updatedMerchant._id },
    "_id kyc_status",
    { lean: true }
  );

  if (!kycData) {
    throw new AppError(400, "Error in fetching kyc details");
  }

  const response = {
    merchantType: updatedMerchant.merchant_type,
    businessName: updatedMerchant.business_name,
    businessCategory: updatedMerchant.business_category,
    fullName: updatedMerchant.full_name,
    profession: updatedMerchant.profession,
    email: updatedMerchant.email,
    phoneCode: updatedMerchant.phone_code,
    phone: updatedMerchant.phone,
    jwtToken: {
      tokenName: "merchant_token",
      token: updatedMerchant.token,
    },
    kycStatus: kycData?.kyc_status,
    onboardingMode: updatedMerchant.onboarding_mode,
    liveOnboardingEnabled: updatedMerchant.live_onboarding_enabled,
  };

  // send login email
  const emailObject = {
    userName:
      updatedMerchant.merchant_type === "ENTITY"
        ? updatedMerchant.business_name
        : updatedMerchant.full_name,
    ipAddress: req.ipAddress,
    location: req.location,
    time: moment().format("hh:mm A"),
    email: updatedMerchant.email,
    type: "login-success",
  };

  const isEmailSent = await sendEmail(emailObject);
  if (isEmailSent.error) {
    throw new AppError(400, isEmailSent.message);
  }
  res.status(200).json({
    message: "Login successful",
    error: false,
    data: response,
  });
};

exports.sendForgotPasswordOtp = async (req, res) => {
  const req_body = { ...req.body };

  // check user
  const merchantData = await getMerchantByFilter(
    { email: req_body.email },
    "email phone merchant_type business_name full_name",
    {
      lean: true,
    }
  );
  if (!merchantData) {
    throw new AppError(400, "Email is not registered");
  }

  // send otp
  const payload = {
    type: "reset-password",
    email: req_body.email,
    userName:
      merchantData.merchant_type === "ENTITY"
        ? merchantData.business_name
        : merchantData.full_name,
    title: "Password reset",
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
  const req_body = Object.assign({}, req.body);

  //verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
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
  const req_body = { ...req.body };

  // get merchant
  const merchantData = await getMerchantByFilter(
    { email: req_body.email },
    "email password",
    {}
  );
  if (!merchantData) {
    throw new AppError(400, "Email is not registered");
  }

  // check same password is used or not
  const isPasswordMatched = await merchantData.comparePassword(
    req_body.newPassword
  );
  if (isPasswordMatched) {
    throw new AppError(400, "This password is already in use");
  }

  // update merchant
  const updatedMerchant = await updateMerchantByFilter(
    { email: merchantData.email },
    {
      password: await bcrypt.hash(req_body.newPassword, 12),
      incorrect_login_count: 0,
      last_failed_login_at: null,
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
    },
    { new: true }
  );
  if (!updatedMerchant) {
    throw new AppError(400, "Error in updating details");
  }

  // send email
  const emailObject = {
    userName:
      updatedMerchant.merchant_type === "ENTITY"
        ? updatedMerchant.business_name
        : updatedMerchant.full_name,
    time: moment().format("DD MMM YYYY, hh:mmA"),
    email: updatedMerchant.email,
    type: "reset-password-success",
  };

  const isEmailSent = await sendEmail(emailObject);
  if (isEmailSent.error) {
    throw new AppError(400, isEmailSent.message);
  }

  res.status(200).json({
    message: "Password changed successfully",
    error: false,
    data: null,
  });
};
