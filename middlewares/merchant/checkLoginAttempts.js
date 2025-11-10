const {
  updateMerchantById,
  getMerchantByFilter,
} = require("../../services/merchant/authService");
const AppError = require("../../utils/AppError");
const { sendEmail } = require("../../utils/emailDispatcher");

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

const formatRemainingLockoutTime = (lockoutEndTime) => {
  const remainingMilliseconds = lockoutEndTime - new Date().getTime();

  if (remainingMilliseconds <= 0) return "0 minutes";

  const totalMinutes = Math.ceil(remainingMilliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let timeString = "";
  if (hours > 0) {
    timeString += `${hours} hour${hours > 1 ? "s" : ""}`;
    if (minutes > 0) {
      timeString += ` ${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
  } else {
    timeString = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return timeString;
};

exports.checkMerchantLoginAttempts = async (req, res, next) => {
  const merchant = await getMerchantByFilter(
    { email: req.body.email },
    "_id email phone_code phone is_blocked password incorrect_login_count last_failed_login_at full_name business_name merchant_type",
    {}
  );

  if (!merchant) {
    throw new AppError(400, `Email is not registered`);
  }

  if (merchant.is_blocked) {
    return res.status(400).json({
      message:
        "Your account has been temporarily restricted due to security concerns",
      error: true,
      errorCode: "BLOCKED",
      data: null,
    });
  }

  // check if account is temporarily locked due to too many attempts
  if (merchant.incorrect_login_count >= MAX_ATTEMPTS) {
    const lockoutEndTime =
      merchant.last_failed_login_at +
      (parseInt(process.env.LOCKOUT_DURATION_HOURS) || 24) * 60 * 60 * 1000;

    if (new Date().getTime() < lockoutEndTime) {
      const timeString = formatRemainingLockoutTime(lockoutEndTime);
      throw new AppError(
        400,
        `Too many incorrect attempts. Account locked for ${timeString}.`
      );
    } else {
      // reset attempts if lockout period has passed
      const resetIncorrectPassAttempts = await updateMerchantById(
        merchant._id,
        {
          incorrect_login_count: 0,
          last_failed_login_at: null,
        },
        {
          new: true,
        }
      );
      if (!resetIncorrectPassAttempts) {
        throw new AppError(400, "Failed to reset ncorrect pass count");
      }
    }
  }

  // check password
  if (req.body?.password) {
    const isPasswordMatched = await merchant.comparePassword(req.body.password);
    if (!isPasswordMatched) {
      // update last attempt time and count
      const updatedMerchant = await updateMerchantById(
        merchant._id,
        {
          $set: { last_failed_login_at: new Date().getTime() },
          $inc: { incorrect_login_count: 1 },
        },
        {
          new: true,
        }
      );
      if (!updatedMerchant) {
        throw new AppError(400, "Failed to update merchant data");
      }

      const attemptsLeft = MAX_ATTEMPTS - updatedMerchant.incorrect_login_count;

      if (attemptsLeft == 0) {
        const emailObject = {
          userName:
            updatedMerchant.merchant_type === "ENTITY"
              ? updatedMerchant.business_name
              : updatedMerchant.full_name,
          lockoutTime: parseInt(process.env.LOCKOUT_DURATION_HOURS) || 24,
          maxAttempts: MAX_ATTEMPTS,
          email: updatedMerchant.email,
          type: "login-lockout",
        };

        const isEmailSent = await sendEmail(emailObject);
        if (isEmailSent.error) {
          throw new AppError(400, isEmailSent.message);
        }
      }
      throw new AppError(
        400,
        `Incorrect password. ${
          attemptsLeft > 0
            ? `${attemptsLeft} attempt${
                attemptsLeft !== 1 ? "s" : ""
              } remaining`
            : "Account will be temporarily locked"
        }`
      );
    }
  }

  // update login data
  const updatedLoginData = await updateMerchantById(
    merchant._id,
    {
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
      last_login_date: new Date().getTime(),
    },
    { new: true }
  );

  if (!updatedLoginData) {
    throw new AppError(400, "Failed to update user data");
  }

  req.merchant = merchant;

  next();
};
