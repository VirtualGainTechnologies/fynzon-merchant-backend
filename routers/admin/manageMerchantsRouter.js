const router = require("express").Router();
const { body, param, query } = require("express-validator");

const {
  getMerchantKYCData,
  getAllMerchant,
  updateMerchantData,
} = require("../../controllers/admin/manageMerchantsController");
const {
  verifyAdminToken,
} = require("../../middlewares/admin/verifyAdminToken");
const { catchAsync } = require("../../utils/catchAsync");

const updateMerchantDataValidator = [
  param("merchantId").notEmpty().withMessage("Merchant id missing in path"),
  body("merchantStatus")
    .optional()
    .isString()
    .isIn(["ACTIVE", "BLOCKED"])
    .withMessage("Invalid merchant status"),
];

const getMerchantKYCDataQueryValidator = [
  query("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .trim(),

  query("businessName")
    .optional()
    .isString()
    .withMessage("Business Name must be a string")
    .trim(),

  query("fullName")
    .optional()
    .isString()
    .withMessage("Full Name must be a string")
    .trim(),

  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a number and >= 0")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a number and >= 1")
    .toInt(),
];

router.get(
  "/kycs",
  getMerchantKYCDataQueryValidator,
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("getMerchnatKYCData api", getMerchantKYCData)
);

router.get(
  "/merchants",
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("getAllMerchant api", getAllMerchant)
);

router.put(
  "/update/:merchantId",
  updateMerchantDataValidator,
  catchAsync("verifyAdminToken middleware", verifyAdminToken),
  catchAsync("updateMerchantData api", updateMerchantData)
);

module.exports = router;
