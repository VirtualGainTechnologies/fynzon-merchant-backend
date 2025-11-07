const {
  getUserByFilter,
  updateUserById,
} = require("../../services/user/userAuthService");
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

exports.checkUserLoginAttempts = async (req, res, next) => {
  const filter = {
    ...(req.body?.email && {
      email: req.body?.email,
    }),
    ...(req.body?.phone && {
      phone_code: req.body?.phoneCode,
      phone: req.body?.phone,
    }),
  };

  const user = await getUserByFilter(
    filter,
    "_id email phone_code phone is_blocked password auth_mode incorrect_login_count last_failed_login_at full_name business_name merchant_type",
    {}
  );

  if (!user) {
    throw new AppError(
      400,
      `${filter.email ? "Email" : "Phone number"} is not registered`
    );
  }

  if (user.is_blocked) {
    return res.status(400).json({
      message:
        "Your account has been temporarily restricted due to security concerns",
      error: true,
      errorCode: "BLOCKED",
      data: null,
    });
  }

  if (!user?.password) {
    throw new AppError(
      400,
      "You are registered with a Google account. Please sign in using Google."
    );
  }

  // check if account is temporarily locked due to too many attempts
  if (user.incorrect_login_count >= MAX_ATTEMPTS) {
    const lockoutEndTime =
      user.last_failed_login_at +
      (parseInt(process.env.LOCKOUT_DURATION_HOURS) || 24) * 60 * 60 * 1000;

    if (new Date().getTime() < lockoutEndTime) {
      const timeString = formatRemainingLockoutTime(lockoutEndTime);
      throw new AppError(
        400,
        `Too many incorrect attempts. Account locked for ${timeString}.`
      );
    } else {
      // reset attempts if lockout period has passed
      const resetIncorrectPassAttempts = await updateUserById(
        user._id,
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
    const isPasswordMatched = await user.comparePassword(req.body.password);
    if (!isPasswordMatched) {
      // update last attempt time and count
      const updatedUser = await updateUserById(
        user._id,
        {
          $set: { last_failed_login_at: new Date().getTime() },
          $inc: { incorrect_login_count: 1 },
        },
        {
          new: true,
        }
      );
      if (!updatedUser) {
        throw new AppError(400, "Failed to update user data");
      }

      const attemptsLeft = MAX_ATTEMPTS - updatedUser.incorrect_login_count;

      if (attemptsLeft == 0) {
        const emailObject = {
          userName:
            updatedUser.merchant_type === "ENTITY"
              ? updatedUser.business_name
              : updatedUser.full_name,
          lockoutTime: parseInt(process.env.LOCKOUT_DURATION_HOURS) || 24,
          maxAttempts: MAX_ATTEMPTS,
          email: updatedUser.email,
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
  const updatedLoginData = await updateUserById(
    user._id,
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

  req.user = user;
  req.authMode = user?.auth_mode;

  next();
};
