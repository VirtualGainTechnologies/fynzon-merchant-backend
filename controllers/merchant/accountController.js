const moment = require("moment");

const {
  getMerchantByFilter,
  updateMerchantByFilter,
} = require("../../services/merchant/authService");
const AppError = require("../../utils/AppError");
const { sendEmail } = require("../../utils/emailDispatcher");
const { sendOtpToEmail, sendOtpToMobile } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");
// 1. Send Email OTP for Mobile Change
exports.sendEmailOtpForMobileChange = async (req, res) => {
  const merchantId = req.merchantId; // from verifyMerchantToken middleware
  if (!merchantId) throw new AppError(401, "Unauthorized access");

  const merchantData = await getMerchantByFilter(
    { _id: merchantId },
    "email merchant_type business_name full_name",
    { lean: true }
  );

  if (!merchantData || !merchantData.email) {
    throw new AppError(400, "Merchant email not found");
  }

  const payload = {
    type: "login",
    email: merchantData.email,
    userName:
      merchantData.merchant_type === "ENTITY"
        ? merchantData.business_name
        : merchantData.full_name,
    title: "Verify Email for Mobile Number Update",
  };

  const otpData = await sendOtpToEmail(payload);
  if (otpData.error) throw new AppError(400, otpData.message || "Failed to send OTP");

  res.status(200).json({
    message: "Email OTP sent successfully",
    error: false,
    data: otpData?.data,
  });
};

// 2. Verify Email OTP for Mobile Change
exports.verifyEmailOtpForMobileChange = async (req, res) => {
  const { otpId, otp } = req.body;
  if (!otpId || !otp) throw new AppError(400, "otpId and otp are required");

  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");

  const updatedMerchant = await updateMerchantByFilter(
    { _id: req.merchantId },
    { email_otp_verified_for_mobile_change: true },
    { new: true }
  );

  if (!updatedMerchant) {
    throw new AppError(400, "Failed to verify email OTP for mobile change");
  }

  res.status(200).json({
    message: "Email OTP verified successfully",
    error: false,
    data: null,
  });
};

// 3. Send Mobile OTP for Mobile Change
exports.sendMobileOtpForMobileChange = async (req, res) => {
  const merchantId = req.merchantId;
  const { newMobile, phoneCode } = req.body;

  if (!newMobile || !phoneCode) throw new AppError(400, "newMobile and phoneCode are required");

  const merchantData = await getMerchantByFilter(
    { _id: merchantId },
    "email_otp_verified_for_mobile_change"
  );

  if (!merchantData.email_otp_verified_for_mobile_change)
    throw new AppError(400, "Please verify email OTP first");

  const payload = {
    type: "update-mobile",
    phone: newMobile,
    phoneCode,
  };

  const otpData = await sendOtpToMobile(payload);
  if (otpData.error) throw new AppError(400, otpData.message);

  res.status(200).json({
    message: "Mobile OTP sent successfully",
    error: false,
    data: otpData.data,
  });
};

// 4. Update Mobile Number after verifying Mobile OTP
exports.changeMobileNumber = async (req, session) => {
  const { otpId, otp, newMobile, phoneCode } = req.body;

  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");

  const updatedMerchant = await updateMerchantByFilter(
    { _id: req.merchantId },
    { phone: newMobile, phone_code: phoneCode },
    { new: true, session }
  );

  if (!updatedMerchant) throw new AppError(400, "Failed to update mobile number");

  return {
    message: "Mobile number updated successfully",
    error: false,
    data: null,
  };
};

// 5. Send Mobile OTP for Email Change
exports.sendMobileOtpForEmailChange = async (req, res) => {
  const merchantId = req.merchantId;
  const merchantData = await getMerchantByFilter(
    { _id: merchantId },
    "phone phone_code merchant_type business_name full_name"
  );

  if (!merchantData || !merchantData.phone)
    throw new AppError(400, "Merchant phone not found");

  const payload = {
    type: "update-email-mobile-verification",
    phone: merchantData.phone,
    phoneCode: merchantData.phone_code,
  };

  const otpData = await sendOtpToMobile(payload);
  if (otpData.error) throw new AppError(400, otpData.message);

  res.status(200).json({
    message: "Mobile OTP sent successfully",
    error: false,
    data: otpData.data,
  });
};

// 6. Verify Mobile OTP for Email Change
exports.verifyMobileOtpForEmailChange = async (req, res) => {
  const { otpId, otp } = req.body;
  if (!otpId || !otp) throw new AppError(400, "otpId and otp are required");

  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");

  await updateMerchantByFilter(
    { _id: req.merchantId },
    { mobile_otp_verified_for_email_change: true },
    { new: true }
  );

  res.status(200).json({
    message: "Mobile OTP verified successfully",
    error: false,
    data: null,
  });
};

// 7. Send Email OTP for Email Change
exports.sendEmailOtpForEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) throw new AppError(400, "newEmail is required");

  const merchant = await getMerchantByFilter(
    { _id: req.merchantId },
    "merchant_type business_name full_name mobile_otp_verified_for_email_change"
  );

  if (!merchant.mobile_otp_verified_for_email_change)
    throw new AppError(400, "Please verify mobile OTP first");

  const payload = {
    type: "update-email",
    email: newEmail,
    userName:
      merchant.merchant_type === "ENTITY"
        ? merchant.business_name
        : merchant.full_name,
    title: "Verify Email for Email ID Change",
  };

  const otpData = await sendOtpToEmail(payload);
  if (otpData.error) throw new AppError(400, otpData.message || "Failed to send OTP");

  res.status(200).json({
    message: "Email OTP sent successfully",
    error: false,
    data: otpData.data,
  });
};

// 8. Change Email ID
exports.changeEmailId = async (req, session) => {
  const { otpId, otp, newEmail } = req.body;

  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");

  const updatedMerchant = await updateMerchantByFilter(
    { _id: req.merchantId },
    { email: newEmail },
    { new: true, session }
  );

  if (!updatedMerchant) throw new AppError(400, "Failed to update email address");

  return {
    message: "Email ID updated successfully",
    error: false,
    data: null,
  };
};

// 9. Send OTP to Change Password
exports.sendOtpToChangePassword = async (req, res) => {
  const merchant = await getMerchantByFilter(
    { _id: req.merchantId },
    "email merchant_type business_name full_name"
  );

  const payload = {
    type: "change-password",
    email: merchant.email,
    userName:
      merchant.merchant_type === "ENTITY"
        ? merchant.business_name
        : merchant.full_name,
    title: "Password Change Verification",
  };

  const otpData = await sendOtpToEmail(payload);
  if (otpData.error) throw new AppError(400, otpData.message);

  res.status(200).json({
    message: "Password change OTP sent successfully",
    error: false,
    data: otpData.data,
  });
};

// 10. Update Password
exports.updatePassword = async (req, session) => {
  const { otpId, otp, newPassword } = req.body;

  const verifiedOtp = await verifyOtp(otpId, otp);
  if (verifiedOtp.error) throw new AppError(400, verifiedOtp.message || "Invalid or expired OTP");

  const merchant = await getMerchantByFilter({ _id: req.merchantId }, "password");
  if (!merchant) throw new AppError(404, "Merchant not found");

  merchant.password = newPassword;
  await merchant.save({ session });

  return {
    message: "Password updated successfully",
    error: false,
    data: null,
  };
};

// 11. Get Account Data
exports.getAccountData = async (req, res) => {
  const merchant = await getMerchantByFilter(
    { _id: req.merchantId },
    "email phone phone_code full_name business_name merchant_type createdAt"
  );

  if (!merchant) throw new AppError(404, "Merchant not found");

  res.status(200).json({
    message: "Account data fetched successfully",
    error: false,
    data: merchant,
  });
};
