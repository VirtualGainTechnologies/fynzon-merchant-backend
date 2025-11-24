const router = require("express").Router();
const { body, param } = require("express-validator");

const {
  getMerchantKYCData,
  getAllMerchant,
  updateMerchantData,
} = require("../../controllers/admin/manageMerchantsController");
const {
  verifyAdminToken,
} = require("../../middlewares/admin/verifyAdminToken");
const { catchAsync, catchAsyncWithSession } = require("../../utils/catchAsync");

const updateMerchantDataValidator = [
  param("merchantId").notEmpty().withMessage("Merchant id missing in path"),
  body("merchantStatus")
    .optional()
    .isString()
    .isIn(["ACTIVE", "BLOCKED"])
    .withMessage("Invalid merchant status"),
];

router.get(
  "/kycs",
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
  catchAsyncWithSession("updateMerchantData api", updateMerchantData)
);

module.exports = router;
