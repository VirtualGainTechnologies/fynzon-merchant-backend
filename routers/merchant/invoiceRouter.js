const router = require("express").Router();
const { body } = require("express-validator");
const { catchAsync } = require("../../utils/catchAsync");
const {
  createInvoice,
  sendInvoiceEmail,
} = require("../../controllers/merchant/invoiceController");
const {
  verifyMerchantToken,
} = require("../../middlewares/merchant/verifyMerchantToken");
const { uploadPdf } = require("../../utils/imageUpload");

const createInvoiceValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("Invalid mode"),
  body("depositCrypto")
    .notEmpty()
    .withMessage("The field depositCrypto is required")
    .isIn(["USDT"])
    .withMessage("Invalid depositCrypto"),
  body("depositNetwork")
    .notEmpty()
    .withMessage("The field depositNetwork is required")
    .isIn(["TRC-20"])
    .withMessage("Invalid depositNetwork"),
  body("depositAddress")
    .notEmpty()
    .withMessage("The field depositAddress is required"),
  body("contactName")
    .notEmpty()
    .withMessage("The field contactName is required"),
  body("contactType")
    .notEmpty()
    .withMessage("The field contactType is required"),
  body("contactEmail")
    .notEmpty()
    .withMessage("The field contactEmail is required")
    .isEmail()
    .withMessage("Invalid contactEmail"),
  body("contactPhone")
    .trim()
    .optional({ checkFalsy: true })
    .custom(async (val) => {
      if (/^[6-9]{1}[0-9]{9}$/.test(val)) {
        return true;
      } else {
        throw new Error("Invalid phone number");
      }
    }),
  body("address.city")
    .notEmpty()
    .withMessage("The field address.city is required"),
  body("address.zip")
    .notEmpty()
    .withMessage("The field address.zip is required"),
  body("address.state")
    .notEmpty()
    .withMessage("The field address.state is required"),
  body("address.country")
    .notEmpty()
    .withMessage("The field address.country is required"),
  body("address.countryCode")
    .notEmpty()
    .withMessage("The field address.countryCode is required"),
  body("address.fullAddress")
    .notEmpty()
    .withMessage("The field address.fullAddress is required"),
  body("invoiceDate")
    .notEmpty()
    .withMessage("The field invoiceDate is required")
    .custom(async (val) => {
      if (new Date(val).getTime()) {
        return true;
      } else {
        throw new Error("Invalid invoice date");
      }
    }),
  body("dueDate")
    .notEmpty()
    .withMessage("The field dueDate is required")
    .custom(async (val) => {
      if (new Date(val).getTime()) {
        return true;
      } else {
        throw new Error("Invalid due date");
      }
    }),
  body("invoiceDescription")
    .notEmpty()
    .withMessage("The field invoiceDescription is required")
    .isLength({ min: 10, max: 100 })
    .withMessage("invoiceDescription must be between 10 and 100 characters"),
  body("baseCurrency")
    .notEmpty()
    .withMessage("The field baseCurrency is required")
    .isIn(["AED", "INR"])
    .withMessage("Invalid baseCurrency"),
  body("conversionRate.currency")
    .notEmpty()
    .withMessage("The field conversionRate.currency is required"),
  body("conversionRate.crypto")
    .notEmpty()
    .withMessage("The field conversionRate.crypto is required"),
  body("conversionRate.currencyAmount")
    .notEmpty()
    .withMessage("The field conversionRate.currencyAmount is required")
    .isNumeric()
    .withMessage("Invalid currencyAmount"),
  body("conversionRate.cryptoAmount")
    .notEmpty()
    .withMessage("The field conversionRate.cryptoAmount is required")
    .isNumeric()
    .withMessage("Invalid cryptoAmount"),
  body("items").isArray({ min: 1 }).withMessage("The field items is required"),
  body("items.*.name")
    .notEmpty()
    .withMessage("The field items.name is required"),
  body("items.*.quantity")
    .notEmpty()
    .withMessage("The field items.quantity is required")
    .isNumeric()
    .withMessage("Invalid items.quantity"),
  body("items.*.price")
    .notEmpty()
    .withMessage("The field items.price is required")
    .isNumeric()
    .withMessage("Invalid items.price"),
  body("items.*.priceCurrency")
    .notEmpty()
    .withMessage("The field items.priceCurrency is required"),
  body("discountPercentage")
    .notEmpty()
    .withMessage("The field discountPercentage is required")
    .isNumeric()
    .withMessage("Invalid discountPercentage"),
  body("taxPercentage")
    .notEmpty()
    .withMessage("The field taxPercentage is required")
    .isNumeric()
    .withMessage("Invalid taxPercentage"),
  body("totalAmount")
    .notEmpty()
    .withMessage("The field totalAmount is required")
    .isNumeric()
    .withMessage("Invalid totalAmount"),
  body("isDrafted")
    .optional()
    .isBoolean()
    .withMessage("The field isDrafted vlaue must be boolean"),
];

const sendInvoiceEmailValidator = [
   body("email")
    .notEmpty()
    .withMessage("The field email is required")
    .isEmail()
    .withMessage("Invalid email"),
];

router.post(
  "/create-invoice",
  createInvoiceValidator,
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("createInvoice api", createInvoice)
);

router.post(
  "/send-invoice-email",
  uploadPdf.single("invoice"),
  sendInvoiceEmailValidator,
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("sendInvoiceEmail api", sendInvoiceEmail)
);

module.exports = router;
