const router = require("express").Router();
const { body } = require("express-validator");

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  sendLoginOtp,
  verifyLoginOtp,
} = require("../../controllers/merchant/authController");
const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");
const {
  getIpAndLocation,
} = require("../../middlewares/shared/ipLocationMiddleware");
const {
  checkMerchantLoginAttempts,
} = require("../../middlewares/merchant/checkLoginAttempts");

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
    .withMessage("The field password is required"),

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
    .withMessage("The field phoneCode is required")
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid phone number"),
];

const verifyRegistrationOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("The field otpID is required")
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
  ...sendLoginOtpValidator,
];

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

module.exports = router;
