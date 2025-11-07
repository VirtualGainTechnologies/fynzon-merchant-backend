const { body } = require("express-validator");
const router = require("express").Router();

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
} = require("../../controllers/merchant/authController");
const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");
const {
  getIpAndLocation,
} = require("../../middlewares/shared/ipLocationMiddleware");

const sendRegistrationOtpValidator = [
  body("category")
    .notEmpty()
    .trim()
    .withMessage("Please provide category")
    .isIn(["INDIVIDUAL", "ENTITY"])
    .withMessage("Category must be either INDIVIDUAL or ENTITY"),
  body("email")
    .notEmpty()
    .trim()
    .withMessage("Please provide email id")
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("password").notEmpty().trim().withMessage("Please provide password"),

  body("businessName")
    .if(body("category").custom((value) => value === "ENTITY"))
    .notEmpty()
    .trim()
    .withMessage("Please provide business name")
    .toLowerCase(),
  body("businessCategory")
    .if(body("category").custom((value) => value === "ENTITY"))
    .notEmpty()
    .trim()
    .withMessage("Please provide business category"),

  body("fullName")
    .if(body("category").custom((value) => value === "INDIVIDUAL"))
    .notEmpty()
    .trim()
    .withMessage("Please provide full name"),
  body("profession")
    .if(body("category").custom((value) => value === "INDIVIDUAL"))
    .notEmpty()
    .trim()
    .withMessage("Please provide profession"),

  body("phoneCode").notEmpty().trim().withMessage("Please provide phone code"),
  body("phone")
    .notEmpty()
    .trim()
    .withMessage("Please provide phone number")
    .custom(async (val, { req }) => {
      if (/^[6-9]{1}[0-9]{9}$/.test(val)) {
        return true;
      } else {
        throw new Error("Invalid phone number");
      }
    }),
];

const verifyRegistrationOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otp is missing")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  ...sendRegistrationOtpValidator,
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

module.exports = router;
