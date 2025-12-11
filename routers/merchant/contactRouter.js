//contact-types related
// 1] createContactType
// 2] getContactTypes

const router = require("express").Router();
const { body, query } = require("express-validator");
const { catchAsync} = require("../../utils/catchAsync");
const { verifyMerchantToken } = require("../../middlewares/merchant/verifyMerchantToken");
const {
  createContactType,
  getContactTypes
} = require("../../controllers/merchant/contactController");

const contactTypeValidator = [
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("The field mode is required")
    .toUpperCase()
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either 'TEST' or 'LIVE'"),
  body("contactType")
    .trim()
    .notEmpty()
    .withMessage("The field contactType is required")
    .matches(/^(?!^\d+$)[A-Za-z\d]+$/)
    .withMessage(
      "contactType must be only letters or a combination of letters and numbers"
    )
    .isLength({ min: 2 })
    .withMessage("contactType must be at least 2 characters long")
    .toUpperCase(),
];

router
  .post(
    "/create-contact-type",
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    contactTypeValidator,
    catchAsync("createContactType api", createContactType)
  )
  .get(
    "/get-contact-types",
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    [
      query("mode")
        .trim()
        .exists()
        .withMessage("The field mode is required as query")
        .isIn(["TEST", "LIVE"])
        .withMessage("Invalid mode"),
    ],
    catchAsync("getContactTypes api", getContactTypes)
  );

module.exports = router;