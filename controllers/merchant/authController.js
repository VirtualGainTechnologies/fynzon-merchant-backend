const { sendOtpToEmail } = require("../../utils/sendOtp");
const AppError = require("../../utils/AppError");
const { verifyOtp } = require("../../utils/verifyOtp");
const { registerMerchant } = require("../../services/merchant/authService");
const { sendEmail } = require("../../utils/emailDispatcher");

exports.sendRegistrationOtp = async (req, res) => {
  const emailObject = {
    type: "register-otp",
    email: req.body.email,
    userName: req.body.userName,
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
      ...req.body,
    },
  });
};

exports.verifyRegistrationOtp = async (req, session) => {
  const req_body = { ...req.body };

  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");
  }
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
      tokenName: "user_token",
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
