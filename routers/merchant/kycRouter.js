const router = require("express").Router();
const { body } = require("express-validator");

const { catchAsync } = require("../../utils/catchAsync");
const {
  verifyMerchantToken,
} = require("../../middlewares/merchant/verifyMerchantToken");
const {
  verifyAadhaar,
  verifyIndividualPan,
  verifyBank,
  verifyGstin,
  verifyBusinessPan,
  verifySelfie,
} = require("../../controllers/merchant/kycController");
const { uploadImage } = require("../../utils/imageUpload");

const aadhaarBodyValidator = [
  body("aadhaarNumber")
    .notEmpty()
    .withMessage("The field aadhaarNumber is required")
    .trim()
    .custom((val) => /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/.test(val))
    .withMessage("Invalid aadhaar number"),
];

const panBodyValidator = [
  body("panNumber")
    .trim()
    .notEmpty()
    .withMessage("The field panNumber is required")
    .toUpperCase()
    .custom((val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val))
    .withMessage("Invalid pan number"),
];

const gstinBodyValidator = [
  body("gstinNumber")
    .trim()
    .notEmpty()
    .withMessage("The field gstinNumber is required")
    .custom((val) =>
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val)
    )
    .withMessage("Invalid GSTIN number"),
];

const bankBodyValidator = [
  body("ifscCode")
    .trim()
    .notEmpty()
    .withMessage("The field ifscCode is required")
    .custom((val) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val))
    .withMessage("Invalid IFSC code"),
  body("bankAccNo")
    .trim()
    .notEmpty()
    .withMessage("The field bankAccNo is required")
    .custom((val) => /^[0-9]{9,18}$/.test(val))
    .withMessage("Invalid account number"),
];

// aadhaar-verification
router.post(
  "/verify-aadhaar",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  uploadImage.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  aadhaarBodyValidator,
  verifyAadhaar
);

// verify gstin
router.post(
  "/verify-gstin",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  gstinBodyValidator,
  verifyGstin
);

// verify individual pan
router.post(
  "/verify-individual-pan",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  uploadImage.single("panImage"),
  panBodyValidator,
  verifyIndividualPan
);

// verify business pan
router.post(
  "/verify-business-pan",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  uploadImage.single("panImage"),
  panBodyValidator,
  verifyBusinessPan
);

// verify bank account
router.post(
  "/verify-bank",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  uploadImage.single("chequeImage"),
  bankBodyValidator,
  verifyBank
);

// verify user selfie
router.post(
  "/verify-selfie",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  uploadImage.single("selfieImage"),
  verifySelfie
);

module.exports = router;
