const router = require("express").Router();
const { body } = require("express-validator");
const validator = require("is-my-ip-valid");
const validate = validator();
const validate4 = validator({ version: 4 });
const validate6 = validator({ version: 6 });

const { catchAsync } = require("../../utils/catchAsync");
const { verifyMerchantToken } = require("../../middlewares/merchant/verifyMerchantToken");
const {
  generateApiKey,
  deleteApiKey,
  sendOtpToAddIp,
  verifyOtpToAddIp,
  verifyOtpToRemoveIp,
  sendOtpToRemoveIp,
  getDeveloperData,
  addWebHookUrl,
  removeWebHookUrl,
  updateWebHookURL,
  sendOtpToUpdateIp,
  verifyOtpToUpdateIp,
} = require("../../controllers/merchant/developerController");

// Validations
const generateApiKeyBodyValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either TEST or LIVE"),
  body("websiteURL")
    .notEmpty()
    .withMessage("The field websiteURL is required")
    .trim()
    .custom(async (val) => {
      if (!val.startsWith("https://")) {
        throw new Error("The field websiteURL must start with https://");
      }
      return true;
    }),
];

const deleteApiKeyBodyValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either TEST or LIVE"),
  body("apiKey").notEmpty().trim().withMessage("The field api key is required"),
];

const sendOtpToAddOrRemoveIpValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either TEST or LIVE"),
  body("ipAddress")
    .trim()
    .notEmpty()
    .withMessage("The field ipAddress is required")
    .custom((value, { req }) => {
      // Ensure spaces are not used instead of commas
      if (/\d+\.\d+\.\d+\.\d+\s+\d+\.\d+\.\d+\.\d+/.test(value)) {
        throw new Error("Each IP must be separated by a comma.");
      }

      // Ensure no consecutive, leading, or trailing commas
      if (/^,|,,|,$/.test(value)) {
        throw new Error("Invalid comma placement in input.");
      }

      const ipList = value.split(",").map((ip) => ip.trim());
      req.ipListArray = ipList;

      //chekc max 3 ip
      if (ipList.length > 3) {
        throw new Error("You can enter up to 3 IP addresses only.");
      }

      // Validate each IP address
      const uniqueIP = new Set();
      for (const [index, ip] of ipList.entries()) {
        if (!validate(ip)) throw new Error(`${ip} is invalid IP address`);

        if (validate6(ip)) throw new Error(`${ip} is not IPv4 format`);

        if (!validate4(ip))
          throw new AppError(400, `${val} is not a valid IPv4`);

        if (uniqueIP.has(ip)) {
          throw new Error(`${ip} appears more than once!`);
        }

        uniqueIP.add(ip);
      }

      return true;
    }),
];

const verifyOtpToAddOrRemoveIpValidator = [
  ...sendOtpToAddOrRemoveIpValidator,
  body("otpId").notEmpty().trim().withMessage("The field otpId is required"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otp is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("The field otp must be of 6 digit"),
];

const sendOtpToUpdateIpValidator = [
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("The field mode is missing")
    .bail()
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either 'TEST' or 'LIVE'"),
  body("ipAddress")
    .trim()
    .notEmpty()
    .withMessage("The field ipAddress is missing")
    .bail()
    .custom((ip) => {
      const ipList = ip.split(",").map((ip) => ip.trim());

      if (ipList.length > 1) {
        throw new Error("Only one IP is allowed to update at a time");
      }

      if (!validate(ip)) {
        throw new Error("Invalid IP address format");
      }

      if (validate6(ip)) {
        throw new Error(
          "IPv6 is not supported. Please provide a valid IPv4 address"
        );
      }

      if (!validate4(ip)) {
        throw new Error("The field ipAddress is not a valid IPv4 address");
      }

      return true;
    }),

  body("oldIpAddress")
    .trim()
    .notEmpty()
    .withMessage("The field oldIpAddress is missing"),
];

const verifyOtpToUpdateIpBodyValidator = [
  body("otpId").notEmpty().trim().withMessage("The field otpId is missing"),
  body("otp")
    .notEmpty()
    .trim()
    .withMessage("The field otp is missing")
    .isLength({ min: 6, max: 6 })
    .withMessage("The field otp must be of 6 digit"),
  ...sendOtpToUpdateIpValidator,
];

const webHookUrlBodyValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either TEST or LIVE"),
  body("url")
    .notEmpty()
    .withMessage("The field url is required")
    .trim()
    .custom(async (val) => {
      if (!val.startsWith("https://")) {
        throw new Error("URL must start with https://");
      }

      return true;
    }),
  body("event")
    .notEmpty()
    .withMessage("The field event is required")
    .isIn(["PAYIN", "PAYOUT"])
    .withMessage("The field event must be either PAYIN or PAYOUT"),
];

const updateWebHookUrlBodyValidator = [
  body("mode")
    .notEmpty()
    .withMessage("The field mode is required")
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode value must be either TEST or LIVE"),
  body("oldUrl")
    .notEmpty()
    .withMessage("The field oldUrl is required")
    .trim()
    .custom(async (val) => {
      if (!val.startsWith("https://")) {
        throw new Error("New URL must start with https://");
      }
      return true;
    }),
  body("url")
    .notEmpty()
    .withMessage("The field url is required")
    .trim()
    .custom(async (val) => {
      if (!val.startsWith("https://")) {
        throw new Error("New URL must start with https://");
      }
      return true;
    }),

  body("event")
    .notEmpty()
    .withMessage("The field event is required")
    .isIn(["PAYIN", "PAYOUT"])
    .withMessage("The field event value must be either PAYIN or PAYOUT"),
];

/*
  API Routes for managing API keys
  - Generate a new API key
  - Retrieve all existing API keys
  - Delete an existing API key
*/
router
  .post(
    "/generate-api-key",
    generateApiKeyBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("generateApiKey api", generateApiKey)
  )
  .put(
    "/delete-api-key",
    deleteApiKeyBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("deleteApiKey api", deleteApiKey)
  );

/*
  API Routes for Managing IP Addresses
  - Send OTP to add a new IP address
  - Verify OTP to confirm adding the IP address
  - Send OTP to update an IP address
  - Verify OTP to confirm IP address updation
  - Send OTP to remove an IP address
  - Verify OTP to confirm IP address removal
*/
router
  .post(
    "/add-ip-address/send-otp",
    sendOtpToAddOrRemoveIpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendOtpToAddIp api", sendOtpToAddIp)
  )
  .post(
    "/add-ip-address/verify-otp",
    verifyOtpToAddOrRemoveIpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("verifyOtpToAddIp api", verifyOtpToAddIp)
  )
  .put(
    "/update-ip/send-otp",
    sendOtpToUpdateIpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendOtpToUpdateIp api", sendOtpToUpdateIp)
  )
  .put(
    "/update-ip/verify-otp",
    verifyOtpToUpdateIpBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("verifyOtpToUpdateIp api", verifyOtpToUpdateIp)
  )
  .put(
    "/remove-ip/send-otp",
    sendOtpToAddOrRemoveIpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("sendOtpToRemoveIp api", sendOtpToRemoveIp)
  )
  .put( 
    "/remove-ip/verify-otp",
    verifyOtpToAddOrRemoveIpValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("verifyOtpToRemoveIp api", verifyOtpToRemoveIp)
  );

/*  
  API Routes for Managing Webhook URLs  
  - Add a new webhook URL
  - Update an existing webhook URL
  - Remove an existing webhook URL
*/
router
  .post(
    "/add-webhook-url",
    webHookUrlBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("addWebHookUrl api", addWebHookUrl)
  )
  .put(
    "/update-webhook-url",
    updateWebHookUrlBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("updateWebHookUrl api", updateWebHookURL)
  )
  .put(
    "/remove-webhook-url",
    webHookUrlBodyValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("removeWebHookUrl api", removeWebHookUrl)
  );

//get developer data
router.get(
  "/get-developer-data",
  catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
  catchAsync("getDeveloperData api", getDeveloperData)
);

module.exports = router;
