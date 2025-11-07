const router = require("express").Router();
const { body } = require("express-validator");

const { catchAsync } = require("../../utils/catchAsync");
const { resendOtp } = require("../../controllers/shared/otpController");

const resendOtpValidator = [
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("Please provide OTP type")
    .isIn(["EMAIL", "PHONE"])
    .withMessage("OTP type must be either EMAIL or PHONE"),
  body("email")
    .if(body("mode").custom((value) => value === "EMAIL"))
    .notEmpty()
    .withMessage("Please provide email id")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("type")
    .if(body("mode").custom((value) => value === "EMAIL"))
    .notEmpty()
    .withMessage("The field type is missing"),
  body("userName")
    .if(body("mode").custom((value) => value === "EMAIL"))
    .notEmpty()
    .withMessage("The field userName is missing"),
  body("title")
    .if(body("mode").custom((value) => value === "EMAIL"))
    .notEmpty()
    .withMessage("The field title is missing"),
  body("phoneCode")
    .if(body("mode").custom((value) => value === "MOBILE"))
    .notEmpty()
    .trim()
    .withMessage("Please provide phone code"),
  body("phone")
    .if(body("mode").custom((value) => value === "MOBILE"))
    .notEmpty()
    .trim()
    .withMessage("Please provide phone number")
    .isMobilePhone()
    .withMessage("Invalid phone number"),
];

router.post("/", resendOtpValidator, catchAsync("resendOtp api", resendOtp));

module.exports = router;
