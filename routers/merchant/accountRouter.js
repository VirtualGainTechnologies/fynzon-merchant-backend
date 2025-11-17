const router = require("express").Router();
const { body } = require("express-validator");

const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");
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
const {
  verifyMerchantToken,
} = require("../../middlewares/merchant/verifyMerchantToken");

const verifyOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The otpId is required field"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The otp is required field")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
];

const sendMobileOtpForMobileChangeValidator = [
  body("phoneCode").notEmpty().trim().withMessage("Please provide phone code"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("The field phone is required")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),
];

const changeMobileNumberValidator = [
  ...verifyOtpValidator,
  ...sendMobileOtpForMobileChangeValidator,
];

const sendEmailOtpForEmailChangeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("The field email is required")
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
];

const changeEmailIdValidator = [
  ...verifyOtpValidator,
  ...sendEmailOtpForEmailChangeValidator,
];

const updatePasswordBodyValidator = [
  body("currentPassword")
    .notEmpty()
    .trim()
    .withMessage("The currentPassword is required field"),
  body("newPassword")
    .notEmpty()
    .trim()
    .withMessage("New Password is missing")
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters long")
    .custom((value) => {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/])[a-zA-Z\d!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/]{8,}$/;
      if (!regex.test(value)) {
        throw new Error(
          "New Password must contain at least one uppercase letter, one lowercase letter, one special character and one number"
        );
      } else {
        return true;
      }
    }),
];

const verifyOtpToChangePasswordValidator = [
  ...verifyOtpValidator,
  ...updatePasswordBodyValidator,
];      

// update mobile number
router
  .post(
    "/update-mobile/send-email-otp",
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendEmailOtpForMobileChange api", sendEmailOtpForMobileChange)
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
    sendMobileOtpForMobileChangeValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendMobileOtpForMobileChange api", sendMobileOtpForMobileChange)
  )
  .post(
    "/update-mobile",
    changeMobileNumberValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsyncWithSession("changeMobileNumber api", changeMobileNumber)
  );

// update email id
router
  .post(
    "/update-email/send-mobile-otp",
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
    sendEmailOtpForEmailChangeValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendEmailOtpForEmailChange api", sendEmailOtpForEmailChange)
  )
  .post(
    "/update-email",
    changeEmailIdValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("changeEmailId api", changeEmailId)
  );

// update-password
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

// get account data
router.get(
  "/get-account-details",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("getAccountDetails api", getAccountData)
);

module.exports = router;
