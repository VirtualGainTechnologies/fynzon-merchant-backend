const router = require("express").Router();
const { body } = require("express-validator");
const moment = require("moment-timezone");

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
    .trim()
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either TEST or LIVE"),
  body("depositCrypto")
    .trim()
    .notEmpty()
    .withMessage("The field depositCrypto is required")
    .isIn(["USDT"])
    .withMessage("The field depositCrypto must be USDT"),
  body("depositNetwork")
    .trim()
    .notEmpty()
    .withMessage("The field depositNetwork is required")
    .isIn(["TRC20"])
    .withMessage("The field depositNetwork must be TRC20"),
  body("depositAddress")
    .trim()
    .notEmpty()
    .withMessage("The field depositAddress is required"),
  // contact info
  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("The field contactName is required"),
  body("contactType")
    .trim()
    .notEmpty()
    .withMessage("The field contactType is required"),
  body("contactEmail")
    .trim()
    .notEmpty()
    .withMessage("The field contactEmail is required")
    .isEmail()
    .withMessage("The field contactEmail must be a valid email address"),
  body("contactPhone")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("The field contactPhone must be a valid phone number"),
  // address (nested)
  body("address.city")
    .trim()
    .notEmpty()
    .withMessage("The field address.city is required"),
  body("address.zip")
    .trim()
    .notEmpty()
    .withMessage("The field address.zip is required"),
  body("address.state")
    .trim()
    .notEmpty()
    .withMessage("The field address.state is required"),
  body("address.country")
    .trim()
    .notEmpty()
    .withMessage("The field address.country is required"),
  body("address.countryCode")
    .trim()
    .notEmpty()
    .withMessage("The field address.countryCode is required")
    .isLength({ min: 2, max: 3 })
    .withMessage("The field address.countryCode must be 2 or 3 characters"),
  body("address.fullAddress")
    .trim()
    .notEmpty()
    .withMessage("The field address.fullAddress is required"),
  body("invoiceType")
    .trim()
    .notEmpty()
    .withMessage("The field invoiceType is required")
    .isIn(["INSTANT", "SCHEDULED", "RECURRING"])
    .withMessage(
      "The field invoiceType must be INSTANT, SCHEDULED or RECURRING"
    ),
  // invoice info
  body("issueDate")
    .if((_value, { req }) =>
      ["INSTANT", "SCHEDULED"].includes(req.body.invoiceType)
    )
    .notEmpty()
    .withMessage("The field issueDate is required")
    .custom((value, { req }) => {
      if (req.body.invoiceType == "RECURRING") return true;
      // validate issue date
      const tz = req.body.timezone || "Asia/Kolkata";
      const issue = moment.tz(value, "YYYY-MM-DD", true, tz);
      if (!issue.isValid()) {
        throw new Error("Invalid issueDate format (YYYY-MM-DD)");
      }
      const today = moment().tz(tz).startOf("day");

      // instant invoice rule
      if (req.body.invoiceType == "INSTANT") {
        if (!issue.isSame(today, "day")) {
          throw new Error("Issue date must be today for instant invoice");
        }
      }

      // scheduled invoice rule
      if (req.body.invoiceType == "SCHEDULED") {
        if (!issue.isAfter(today, "day")) {
          throw new Error(
            "Issue date must be a future date for scheduled invoice"
          );
        }
      }
      return true;
    }),

  body("dueDate")
    .if((_value, { req }) =>
      ["INSTANT", "SCHEDULED"].includes(req.body.invoiceType)
    )
    .notEmpty()
    .withMessage("The field dueDate is required")
    .custom((value, { req }) => {
      if (req.body.invoiceType == "RECURRING") return true;

      const tz = req.body.timezone || "Asia/Kolkata";
      const issue = moment.tz(req.body.issueDate, "YYYY-MM-DD", tz);
      const due = moment.tz(value, "YYYY-MM-DD", true, tz);
      if (!due.isValid()) {
        throw new Error("Invalid dueDate format (YYYY-MM-DD)");
      }
      // rule: dueDate ≥ issueDate
      if (due.isBefore(issue, "day")) {
        throw new Error("Due date must be on or after issue date");
      }
      return true;
    }),

  body("timezone")
    .optional()
    .trim()
    .custom((value) => moment.tz.names().includes(value))
    .withMessage("The field timezone is invalid"),

  body("invoiceDiscription")
    .trim()
    .notEmpty()
    .withMessage("The field invoiceDiscription is required")
    .isLength({ min: 10, max: 100 })
    .withMessage(
      "The field invoiceDiscription must be between 10 and 100 characters"
    ),
  body("baseCurrency")
    .trim()
    .notEmpty()
    .withMessage("The field baseCurrency is required")
    .isIn(["AED", "INR"])
    .withMessage("The field baseCurrency must be AED or INR"),

  // conversion rate
  body("conversionRate.currency")
    .trim()
    .notEmpty()
    .withMessage("The field conversionRate.currency is required"),
  body("conversionRate.crypto")
    .trim()
    .notEmpty()
    .withMessage("The field conversionRate.crypto is required"),
  body("conversionRate.currencyAmount")
    .notEmpty()
    .withMessage("The field conversionRate.currencyAmount is required")
    .isNumeric()
    .withMessage("The field conversionRate.currencyAmount must be a number"),
  body("conversionRate.cryptoAmount")
    .notEmpty()
    .withMessage("The field conversionRate.cryptoAmount is required")
    .isNumeric()
    .withMessage("The field conversionRate.cryptoAmount must be a number"),

  // items array
  body("items")
    .isArray({ min: 1 })
    .withMessage("The field items must contain at least one item"),
  body("items.*.name")
    .trim()
    .notEmpty()
    .withMessage("The field items[].name is required"),
  body("items.*.quantity")
    .notEmpty()
    .withMessage("The field items[].quantity is required")
    .isInt({ min: 1 })
    .withMessage("The field items[].quantity must be a positive integer"),

  body("items.*.price")
    .notEmpty()
    .withMessage("The field items[].price is required")
    .isNumeric()
    .withMessage("The field items[].price must be a number"),

  body("items.*.priceCurrency")
    .trim()
    .notEmpty()
    .withMessage("The field items[].priceCurrency is required"),

  // amounts & postercentages
  body("discountPercentage")
    .notEmpty()
    .withMessage("The field discountPercentage is required")
    .isNumeric()
    .withMessage("The field discountPercentage must be a number")
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error(
          "The field discountPercentage must be between 0 and 100"
        );
      }
      return true;
    }),

  body("taxPercentage")
    .notEmpty()
    .withMessage("The field taxPercentage is required")
    .isNumeric()
    .withMessage("The field taxPercentage must be a number"),
  body("totalAmount")
    .notEmpty()
    .withMessage("The field totalAmount is required")
    .isNumeric()
    .withMessage("The field totalAmount must be a number"),

  // recurring
  body("recurring.every")
    .if((_, { req }) => req.body.invoiceType === "RECURRING")
    .notEmpty()
    .withMessage("Recurring interval is required")
    .isIn(["week", "month", "year"])
    .withMessage("Recurring interval must be week, month, or year"),
  body("recurring.date")
    .if(
      (_, { req }) =>
        req.body.invoiceType === "RECURRING" &&
        ["month", "year"].includes(req.body.recurring?.every)
    )
    .notEmpty()
    .withMessage("Recurring date is required")
    .isInt({ min: 1, max: 31 })
    .withMessage("Recurring date must be between 1 and 31"),
  body("recurring.day")
    .if(
      (_, { req }) =>
        req.body.invoiceType === "RECURRING" &&
        req.body.recurring?.every === "week"
    )
    .notEmpty()
    .withMessage("Recurring day is required")
    .isInt({ min: 0, max: 6 })
    .withMessage("Recurring day must be between 0 (Sunday) and 6 (Saturday)"),
  body("recurring.month")
    .if(
      (_, { req }) =>
        req.body.invoiceType === "RECURRING" &&
        req.body.recurring?.every === "year"
    )
    .notEmpty()
    .withMessage("Recurring month is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Recurring month must be between 1 and 12"),

  body("recurring.expiryDays")
    .if((_, { req }) => req.body.invoiceType === "RECURRING")
    .notEmpty()
    .withMessage("Recurring expiry days is required")
    .isInt({ min: 1 })
    .withMessage("Recurring expiry days must be a positive number")
    .custom((value, { req }) => {
      const every = req.body.recurring?.every;
      if (!every) return true;
      const limits = {
        week: 6,
        month: 27,
        year: 363,
      };
      const max = limits[every];
      if (!max) return true;
      if (Number(value) > max) {
        throw new Error(
          `Expiry days cannot exceed ${max} days for ${every} interval`
        );
      }
      return true;
    }),
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
