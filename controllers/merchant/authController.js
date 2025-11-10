const { sendOtpToEmail } = require("../../utils/sendOtp");
const AppError = require("../../utils/AppError");
const { verifyOtp } = require("../../utils/verifyOtp");
const {
  registerMerchant,
  updateMerchantByFilter,
} = require("../../services/merchant/authService");
const { sendEmail } = require("../../utils/emailDispatcher");
const { getMerchantByFilter } = require("../../services/merchant/authService");
const { getKycByFilter } = require("../../services/merchant/kycService");

exports.sendRegistrationOtp = async (req, res) => {
  const req_body = Object.assign({}, req.body);

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
  const req_body = Object.assign({}, req.body);

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

exports.sendLoginOtp = async (req, res) => {
  const req_body = Object.assign({}, req.body);

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
  const req_body = Object.assign({}, req.body);

  // verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid OTP");
  }

  // create token
  const jwtToken = jwt.sign(
    { data: req_body?.email ? req_body?.email : req_body?.phone },
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
    { new: true, session }
  );

  if (!updatedMerchant) {
    throw new AppError(400, "Error in updating merchant");
  }
  // getKycDetails
  const kycData = await getKycByFilter(
    { user_id: updatedUser._id },
    "_id kyc_status",
    { lean: true }
  );

  if (!kycData) {
    throw new AppError(400, "Error in fetching kyc details");
  }

  const response = {
    merchantType: updatedUser.merchant_type,
    businessName: updatedUser.business_name,
    businessCategory: updatedUser.business_category,
    fullName: updatedUser.full_name,
    profession: updatedUser.profession,
    email: updatedUser.email,
    phoneCode: updatedUser.phone_code,
    phone: updatedUser.phone,
    jwtToken: {
      tokenName: "user_token",
      token: updatedUser.token,
    },
    kycStatus: kycData?.kyc_status,
    onboardingMode: updatedUser.onboarding_mode,
    liveOnboardingEnabled: updatedUser.live_onboarding_enabled,
  };

  // send login email
  const emailObject = {
    userName:
      updatedUser.merchant_type === "ENTITY"
        ? updatedUser.business_name
        : updatedUser.full_name,
    ipAddress: req.ipAddress,
    location: req.location,
    time: moment().format("hh:mm A"),
    email: updatedUser.email,
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
