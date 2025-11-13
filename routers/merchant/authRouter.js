const router = require("express").Router();
const { body } = require("express-validator");

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendLoginOtp,
  verifyLoginOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
  validateMerchant,
} = require("../../controllers/merchant/authController");
const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");
const {
  getIpAndLocation,
} = require("../../middlewares/shared/ipLocationMiddleware");
const {
  checkMerchantLoginAttempts,
} = require("../../middlewares/merchant/checkLoginAttempts");

const validateMerchantValidator = [
  body("email").optional({ nullable: true, checkFalsy: true }).toLowerCase(),
  body("businessName")
    .optional({ nullable: true, checkFalsy: true })
    .toLowerCase(),
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),
];

const sendRegistrationOtpValidator = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("The field category is required")
    .isIn(["INDIVIDUAL", "ENTITY"])
    .withMessage("Category must be either INDIVIDUAL or ENTITY"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("The field email is required")
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("password")
    .notEmpty()
    .trim()
    .withMessage("Password is missing")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value) => {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/])[a-zA-Z\d!@#$%^&*()_\-+={}[\]\\|:;'<>,.?/]{8,}$/;
      if (!regex.test(value)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number"
        );
      } else {
        return true;
      }
    }),

  body("businessName")
    .if(body("category").custom((value) => value === "ENTITY"))
    .trim()
    .notEmpty()
    .withMessage("The field businessName is required")
    .toLowerCase(),
  body("businessCategory")
    .if(body("category").custom((value) => value === "ENTITY"))
    .trim()
    .notEmpty()
    .withMessage("The field businessCategory is required"),

  body("fullName")
    .if(body("category").custom((value) => value === "INDIVIDUAL"))
    .trim()
    .notEmpty()
    .withMessage("The field fullName is required"),
  body("profession")
    .if(body("category").custom((value) => value === "INDIVIDUAL"))
    .trim()
    .notEmpty()
    .withMessage("The field profession is required"),

  body("phoneCode").notEmpty().trim().withMessage("Please provide phone code"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("The field phone is required")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),
];

const verifyRegistrationOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("The field otp is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  ...sendRegistrationOtpValidator,
];

const sendLoginOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("password")
    .notEmpty()
    .trim()
    .withMessage("The field password is required"),
];

const verifyLoginOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("The field otpID is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
];

const sendForgotPasswordOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
];

const verifyForgotPasswordOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("The field otpID is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
];

const changePasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("newPassword")
    .notEmpty()
    .trim()
    .withMessage("Please provide new password"),
];

// Validate merchant
router.post(
  "/validate-merchant",
  validateMerchantValidator,
  catchAsync("validateMerchant api", validateMerchant)
);

// Registration
router.post(
  "/registration/send-otp",
  sendRegistrationOtpValidator,
  catchAsync("sendRegistrationOtp api", sendRegistrationOtp)
);

router.post(
  "/registration/verify-otp",
  verifyRegistrationOtpValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsyncWithSession("verifyRegistrationOtp api", verifyRegistrationOtp)
);

// login
router.post(
  "/login/send-otp",
  sendLoginOtpValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("checkMerchantLoginAttempts api", checkMerchantLoginAttempts),
  catchAsync("sendLoginOtp api", sendLoginOtp)
);

router.post(
  "/login/verify-otp",
  verifyLoginOtpValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("verifyLoginOtp api", verifyLoginOtp)
);

// Forgot password
router.post(
  "/forgot-password/send-otp",
  sendForgotPasswordOtpValidator,
  catchAsync("sendForgotPasswordOtp api", sendForgotPasswordOtp)
);

router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOtpValidator,
  catchAsync("verifyForgotPasswordOtp api", verifyForgotPasswordOtp)
);

router.post(
  "/forgot-password",
  changePasswordValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("changePassword api", changePassword)
);
module.exports = router;
