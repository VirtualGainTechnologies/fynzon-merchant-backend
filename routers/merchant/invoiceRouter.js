const router = require("express").Router();
const { body } = require("express-validator");
const moment = require("moment-timezone");

const { catchAsync } = require("../../utils/catchAsync");
const {
  createInvoice,
} = require("../../controllers/merchant/invoiceController");
const {
  verifyMerchantToken,
} = require("../../middlewares/merchant/verifyMerchantToken");

const createInvoiceValidator = [
  // merchant details
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be TEST or LIVE"),
  body("companyLogo").optional().trim(),

  // contact details
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
    .withMessage("Please provide a valid email address"),
  body("contactPhone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("contactAddress.city")
    .trim()
    .notEmpty()
    .withMessage("The field contactAddress.city is required"),
  body("contactAddress.zip").optional(),
  body("contactAddress.state").optional(),
  body("contactAddress.country")
    .trim()
    .notEmpty()
    .withMessage("The field contactAddress.country is required"),
  body("contactAddress.countryCode")
    .trim()
    .notEmpty()
    .withMessage("The field contactAddress.countryCode is required"),
  body("contactAddress.fullAddress")
    .trim()
    .notEmpty()
    .withMessage("The field contactAddress.fullAddress is required"),

  // wallet details
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

  // invoice details
  body("invoiceNumber")
    .trim()
    .notEmpty()
    .withMessage("The field invoiceNumber is required"),
  body("invoiceType")
    .trim()
    .notEmpty()
    .withMessage("The field invoiceType is required")
    .isIn(["SCHEDULED", "RECURRING"])
    .withMessage("The field invoiceType must be SCHEDULED or RECURRING"),
  body("orderDescription")
    .trim()
    .notEmpty()
    .withMessage("The field orderDescription is required")
    .isLength({ min: 5, max: 500 })
    .withMessage(
      "The field orderDescription must be between 5 and 500 characters"
    ),

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

  // scheduled invoice
  body("timezone")
    .notEmpty()
    .withMessage("The field timezone is required")
    .custom((value) => moment.tz.names().includes(value))
    .withMessage("The field timezone is invalid"),
  body("issueDate")
    .if((_value, { req }) => req.body.invoiceType !== "RECURRING")
    .notEmpty()
    .withMessage("The field issueDate is required")
    .custom((value, { req }) => {
      if (req.body.invoiceType == "RECURRING") return true;
      const tz = req.body.timezone || "Asia/Kolkata";
      const issue = moment.tz(value, "YYYY-MM-DD", true, tz);
      if (!issue.isValid()) {
        throw new Error("Invalid issueDate format (YYYY-MM-DD)");
      }
      const today = moment().tz(tz).startOf("day");

      // rule: issueDate ≥ today
      if (issue.isBefore(today, "day")) {
        throw new Error("Issue date must be today or a future date");
      }
      return true;
    }),

  body("dueDate")
    .if((_value, { req }) => req.body.invoiceType !== "RECURRING")
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

  // recurring invoice
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
  body("recurring.dueDays")
    .if((_, { req }) => req.body.invoiceType === "RECURRING")
    .notEmpty()
    .withMessage("Recurring due days is required")
    .isInt({ min: 1 })
    .withMessage("Recurring due days must be a positive number")
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

  // items
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.category")
    .trim()
    .notEmpty()
    .withMessage("The field items.category is required"),

  body("items.*").custom((item) => {
    const category = item.category?.toLowerCase();
    if (!category) {
      throw new Error("The field items.category is required");
    }

    // non-builder items
    if (category !== "builder") {
      if (!item?.name) {
        throw new Error("The field items.name is required");
      }
      if (!item?.quantity) {
        throw new Error("The field items.quantity is required");
      }
      if (!item?.pricePerQuantity) {
        throw new Error("The field items.pricePerQuantity is required");
      }
      if (isNaN(item?.quantity)) {
        throw new Error("The field items.quantity must be a number");
      }
      if (isNaN(item?.pricePerQuantity)) {
        throw new Error("The field items.pricePerQuantity must be a number");
      }
    }

    // builder items
    if (category === "builder") {
      if (!item.projectName) {
        throw new Error("The field items.projectName is required");
      }
      if (!item.unitNumber) {
        throw new Error("The field items.unitNumber is required");
      }
      if (!item.price) {
        throw new Error("The field items.price is required");
      }
      if (isNaN(item.price)) {
        throw new Error("The field items.price must be a number");
      }
    }

    return true;
  }),

  // percentages
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
    .withMessage("The field taxPercentage must be a number")
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error("The field taxPercentage must be between 0 and 100");
      }
      return true;
    }),
];

router.post(
  "/create-invoice",
  createInvoiceValidator,
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("createInvoice api", createInvoice)
);

module.exports = router;
