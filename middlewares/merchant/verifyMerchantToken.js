const { getMerchantByFilter } = require("../../services/merchant/authService");
const { getMerchantKycByFilter } = require("../../services/merchant/kycService");
const AppError = require("../../utils/AppError");
const { verifyJwtToken } = require("../../utils/verifyJwtToken");

exports.verifyMerchantToken = async (req, res, next) => {
  const token = req.signedCookies["merchant_token"];

  if (!token) {
    throw new AppError(401, "Token is missing", "UNAUTHORISED");
  }

  //verify token
  const tokenData = verifyJwtToken(token);

  if (tokenData.error) {
    throw new AppError(401, tokenData.message, "UNAUTHORISED");
  }

  // get merchant based on token
  const merchant = await getMerchantByFilter(
    { token },
    "_id email phone_code phone is_blocked full_name merchant_type business_name  onboarding_mode live_onboarding_enabled",
    {
      lean: true,
    }
  );

  if (!merchant) {
    throw new AppError(
      401,
      "Token has expired, Try login again",
      "UNAUTHORISED"
    );
  }

  if (merchant.is_blocked) {
    throw new AppError(400, "Temporarly blocked, reset password to login");
  }

  const kycData = await getMerchantKycByFilter(
    { merchant_id: merchant._id },
    "_id kyc_status",
    {
      lean: true,
    }
  );

  if (!kycData) {
    throw new AppError(401, "No kyc data found");
  }

  req.merchantId = merchant._id;
  req.email = merchant.email;
  req.phoneCode = merchant.phone_code;
  req.phone = merchant.phone;
  req.fullName = merchant.full_name;
  req.businessName = merchant.business_name;
  req.merchantType = merchant.merchant_type;
  req.kycStatus = kycData.kyc_status;
  req.onboradingMode = merchant.onboarding_mode;
  req.isLiveModeEnabled = merchant.live_onboarding_enabled;

  next();
};
