const router = require("express").Router();
const { body } = require("express-validator");

const {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changePassword,
} = require("../../controllers/admin/resetPasswordController");

const {
  getIpAndLocation,
} = require("../../middlewares/shared/ipLocationMiddleware");

const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");

const sendOtpValidator = [
  body("mode")
    .notEmpty()
    .trim()
    .withMessage("Please provide password change mode")
    .isIn(["EMAIL"])
    .withMessage("Mode must be EMAIL "),
    
  body("email")
    .if(body("mode").isIn(["EMAIL"]))
    .notEmpty()
    .withMessage("The field email id is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
];

const verifyOtpValidator = [
  body("otpId").notEmpty().trim().withMessage("Please provide OTP id"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("Please provide OTP to be verified")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
];

const changePasswordValidator = [
  body("mode")
    .notEmpty()
    .trim()
    .withMessage("Please provide password change mode")
    .isIn(["EMAIL", "PHONE"])
    .withMessage("Mode must be either EMAIL or PHONE"),
    
  body("email")
    .if(body("mode").isIn(["EMAIL"]))
    .notEmpty()
    .withMessage("The field email id is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),

  body("newPassword")
    .notEmpty()
    .trim()
    .withMessage("Please provide new password"),
];

router.post(
  "/forgot-password/send-otp",
  sendOtpValidator,
  catchAsync("sendForgotPasswordOtp api", sendForgotPasswordOtp)
);

router.post(
  "/forgot-password/verify-otp",
  verifyOtpValidator,
  catchAsync("verifyForgotPasswordOtp api", verifyForgotPasswordOtp)
);

router.post(
  "/forgot-password/change-password",
  changePasswordValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsyncWithSession("changePassword api", changePassword)
);

module.exports = router;
