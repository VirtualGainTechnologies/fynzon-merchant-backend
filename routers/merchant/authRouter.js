const { body } = require("express-validator");
const router = require("express").Router();

const { sendOtpEmail } = require("../../controllers/merchant/authController");
const { catchAsync } = require("../../utils/catchAsync");

const emailOtpValidator = [
  body("userName")
    .notEmpty()
    .withMessage("Please provide user or business name"),
  body("email")
    .notEmpty()
    .withMessage("Please provide email id")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
];

router.post(
  "/send-email-otp",
  emailOtpValidator,
  catchAsync("sendOtpToEmail api", sendOtpEmail)
);

module.exports = router;
