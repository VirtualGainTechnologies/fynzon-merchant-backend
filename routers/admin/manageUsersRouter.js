const router = require("express").Router();
const { body } = require("express-validator");

const {
  getMerchantKYCData,
  getAllMerchant,
  updateMerchantData,
} = require("../../controllers/admin/manageUsersController");
const {
  verifyAdminToken,
} = require("../../middlewares/admin/verifyAdminToken");
const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");

const updateMerchantDataValidator = [
  body("merchantStatus")
    .optional()
    .isString()
    .isIn(["ACTIVE", "BLOCKED"])
    .withMessage("Invalid merchant status"),
  body("liveOnboardingEnabled")
    .optional()
    .isBoolean()
    .withMessage("The field liveOnboardingEnabled must be a boolean"),
  body("ips")
    .optional()
    .isArray()
    .withMessage("The field ips must be an array"),
  body("ips.*.mode")
    .optional()
    .isString()
    .isIn(["TEST", "LIVE"])
    .withMessage("Invalid IP mode"),
  body("ips.*.status")
    .optional()
    .isString()
    .isIn(["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"])
    .withMessage("Invalid IP status"),
  body("apiKeys")
    .optional()
    .isArray()
    .withMessage("The field apiKeys must be an array"),
  body("apiKeys.*.mode")
    .optional()
    .isString()
    .isIn(["TEST", "LIVE"])
    .withMessage("Invalid API key mode"),
  body("apiKeys.*.status")
    .optional()
    .isString()
    .isIn(["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"])
    .withMessage("Invalid API key status"),
];

router.get(
  "/kycs",
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("getMerchnatKYCData api", getMerchantKYCData)
);

router.get(
  "/users",
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("getAllMerchant api", getAllMerchant)
);  

router.put(
  "/update/:merchantId",
  updateMerchantDataValidator,
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsyncWithSession("updateMerchantData api", updateMerchantData)
);

module.exports = router;
