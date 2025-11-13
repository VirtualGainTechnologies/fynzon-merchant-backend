const { body } = require("express-validator");
const router = require("express").Router();

const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");
const { verifyMerchantToken } = require("../../middlewares/merchant/verifyMerchantToken");
const {
  sendEmailOtpForMobileChange,
  verifyEmailOtpForMobileChange,
  sendMobileOtpForMobileChange,
  changeMobileNumber,
  sendMobileOtpForEmailChange,
  verifyMobileOtpForEmailChange,
  sendEmailOtpForEmailChange,
  changeEmailId,
  updatePassword,
  sendOtpToChangePassword,
  getAccountData,
} = require("../../controllers/merchant/accountController");

const otpValidator = [
  body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),

  body("type")
    .notEmpty()
    .withMessage("The field type is required")
    .trim()
    .isString()
    .withMessage("Type must be a string")
    .toLowerCase(),
];

const verifyOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The otpId is required field"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otpID is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  ...otpValidator,
];

const updatePasswordBodyValidator = [
  body("currentPassword")
    .notEmpty()
    .trim()
    .withMessage("The field currentPassword is required"),
  body("newPassword")
    .notEmpty()
    .trim()
    .withMessage("The field newPassword is required"),
];

const verifyOtpToChangePasswordValidator = [
  body("otpId").notEmpty().trim().withMessage("The otpId is required field"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otpId is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  ...updatePasswordBodyValidator,
];

//update mobile number
router
  .post(
    "/update-mobile/send-email-otp",
    otpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendEmailOtp api", sendEmailOtpForMobileChange)
  )
  .post(
    "/update-mobile/verify-email-otp",
    verifyOtpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync(
      "verifyEmailOtpForMobileChange api",
      verifyEmailOtpForMobileChange
    )
  )
  .post(
    "/update-mobile/send-mobile-otp",
    otpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendMobileOtpForMobileChange api", sendMobileOtpForMobileChange)
  )
  .post(
    "/update-mobile",
    verifyOtpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsyncWithSession("changeMobileNumber api", changeMobileNumber)
  );

//update email id
router
  .post(
    "/update-email/send-mobile-otp",
    otpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendMobileOtpForEmailChange api", sendMobileOtpForEmailChange)
  )
  .post(
    "/update-email/verify-mobile-otp",
    verifyOtpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync(
      "verifyMobileOtpForEmailChange api",
      verifyMobileOtpForEmailChange
    )
  )
  .post(
    "/update-email/send-email-otp",
    otpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendEmailOtpForEmailChange api", sendEmailOtpForEmailChange)
  )
  .post(
    "/update-email",
    verifyOtpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("changeEmailId api", changeEmailId)
  );

//update-password
router
  .post(
    "/update-password/send-email-otp",
    updatePasswordBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendOtpToChangePassword api", sendOtpToChangePassword)
  )
  .post(
    "/update-password",
    verifyOtpToChangePasswordValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("updatePassword api", updatePassword)
  );

router.get(
  "/get-account-details",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("getAccountDetails api", getAccountData)
);

module.exports = router;
