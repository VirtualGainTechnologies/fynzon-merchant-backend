const { getUserByFilter } = require("../../services/user/userAuthService");
const { getUserKycByFilter } = require("../../services/user/userKycService");
const AppError = require("../../utils/AppError");
const { verifyCsrfToken } = require("../../utils/csrfToken");
const { verifyJwtToken } = require("../../utils/verifyJwtToken");

exports.verifyUserToken = async (req, res, next) => {
  const token = req.signedCookies["user_token"];

  if (!token) {
    throw new AppError(401, "Token is missing", "UNAUTHORISED");
  }

  //verify token
  const tokenData = verifyJwtToken(token);

  if (tokenData.error) {
    throw new AppError(401, tokenData.message, "UNAUTHORISED");
  }

  //get user based on token
  const userResult = await getUserByFilter(
    { token },
    "_id email phone_code phone is_blocked full_name merchant_type business_name auth_mode onboarding_mode live_onboarding_enabled",
    {
      lean: true,
    }
  );

  if (!userResult) {
    throw new AppError(
      401,
      "Token has expired, Try login again",
      "UNAUTHORISED"
    );
  }

  if (userResult.is_blocked) {
    throw new AppError(400, "Temporarly blocked, reset password to login");
  }

  const kycData = await getUserKycByFilter(
    { user_id: userResult._id },
    "_id kyc_status",
    {
      lean: true,
    }
  );

  if (!kycData) {
    throw new AppError(401, "No kyc data found");
  }

  req.userId = userResult._id;
  req.email = userResult.email;
  req.phoneCode = userResult.phone_code;
  req.phone = userResult.phone;
  req.fullName = userResult.full_name;
  req.businessName = userResult.business_name;
  req.merchantType = userResult.merchant_type;
  req.kycStatus = kycData.kyc_status;
  req.authMode = userResult.auth_mode;
  req.onboradingMode = userResult.onboarding_mode;
  req.isLiveModeEnabled = userResult.live_onboarding_enabled;

  next();
};
