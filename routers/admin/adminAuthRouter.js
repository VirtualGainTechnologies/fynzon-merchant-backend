const router = require("express").Router();
const { body } = require("express-validator");

const {
  registerSuperAdmin,
  sendAdminLoginOtp,
  verifyAdminLoginOtp,
  registerSubAdmin,
  getAllSubAdmins,
  getAdminProfile,
  logout,
  validateAdmin,
} = require("../../controllers/admin/adminAuthController");

const {checkAdminLoginAttempts} = require("../../middlewares/admin/adminLoginAttempts");
const {getIpAndLocation} = require("../../middlewares/shared/ipLocationMiddleware");
const {verifyAdminToken} = require("../../middlewares/admin/verifyAdminToken");
const { catchAsync } = require("../../utils/catchAsync");


const validateAdminValidator = [
  body("email").optional({ nullable: true, checkFalsy: true }).toLowerCase(),
  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .custom(async (val, { req }) => {
      if (/^[6-9]{1}[0-9]{9}$/.test(val)) {
        return true;
      } else {
        throw new Error("Invalid phone number");
      }
    }),
];

const superAdminRegistrationBodyValidator = [
  body("userName")
    .notEmpty()
    .trim()
    .withMessage("The field userName is required")
    .isLength({ max: 15 })
    .withMessage("The field userName must be at most 15 characters"),
  body("phoneCode")
    .notEmpty()
    .trim()
    .withMessage("The field  phoneCode is required"),
  body("phone")
    .notEmpty()
    .trim()
    .withMessage("The field phone is required")
    .custom(async (val, { req }) => {
      const isIndian = /^[6-9]{1}[0-9]{9}$/.test(val);
      if (!isIndian) {
        throw new Error("Invalid phone number");
      }

      return true;
    }),
  body("email")
    .notEmpty()
    .trim()
    .withMessage("The field email is required")
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("password")
    .optional()
    .trim()
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
];

const adminLoginBodyValidator = [
  body("mode")
    .notEmpty()
    .trim()
    .withMessage("The field mode is required")
    .isIn(["EMAIL", "PHONE"])
    .withMessage("Login mode must be either EMAIL or PHONE"),
  body("email")
    .if(body("mode").isIn(["EMAIL"]))
    .notEmpty()
    .withMessage("The field email is required")
    .trim()
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("password")
    .if(body("mode").isIn(["EMAIL"]))
    .notEmpty()
    .trim()
    .withMessage("The field password is required"),
  body("phoneCode")
    .if(body("mode").isIn(["PHONE"]))
    .notEmpty()
    .trim()
    .withMessage("The field phoneCode is required"),
  body("phone")
    .if(body("mode").isIn(["PHONE"]))
    .notEmpty()
    .trim()
    .withMessage("The field phone is required")
    .custom(async (val) => {
      if (/^[6-9]{1}[0-9]{9}$/.test(val)) {
        return true;
      } else {
        throw new Error("Invalid phone number");
      }
    }),
];

const verifyOtpAfterAdminLoginBodyValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is required"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otp is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be of 6 digit"),
  ...adminLoginBodyValidator,
];

const subAdminRegistrationBodyValidator = [
  ...superAdminRegistrationBodyValidator,
  body("role")
    .notEmpty()
    .trim()
    .withMessage("The field role is required")
    .isIn(["SUB-ADMIN-LEVEL-1", "SUB-ADMIN-LEVEL-2", "SUB-ADMIN-LEVEL-3"])
    .withMessage("Choose the valid role"),
  body("userId")
    .optional()
    .isMongoId()
    .withMessage("The filed userId must be a valid MongoDB ObjectId"),
];


// Register Super Admin
router.post(
  "/admin-registration",
  superAdminRegistrationBodyValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("registerSuperAdmin", registerSuperAdmin)
);

// Register Sub Admin
router.post(
  "/upsert-sub-admin",
  subAdminRegistrationBodyValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("registerSubAdmin api", registerSubAdmin)
);

// Login Admin
router.post(
    "/send-login-otp",
    adminLoginBodyValidator,
    catchAsync("checkAdminLoginAttempts middleware", checkAdminLoginAttempts),
    catchAsync("sendAdminLoginOtp", sendAdminLoginOtp)
  );

// Verify login OTP
router.post(
  "/login",
  verifyOtpAfterAdminLoginBodyValidator,
  catchAsync("getIpAndLocation middleware", getIpAndLocation),
  catchAsync("verifyAdminLoginOtp", verifyAdminLoginOtp)
);

//logout
router.get(
    "/logout", 
    catchAsync("logout api", logout));

//get admin details
router.get(
    "/get-admin-profile",
    catchAsync("getAdminProfile api", getAdminProfile)
);

// Retrieve a list of all sub-admins
router.get(
  "/get-all-sub-admins",
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("getAllSubAdmins api", getAllSubAdmins)
);

//validate admin api
router.post(
  "/validate-admin",
  validateAdminValidator,
  catchAsync("validateUser api", validateAdmin)
);

module.exports = router;
