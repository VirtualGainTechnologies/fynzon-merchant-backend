const router = require("express").Router();
const { body, query } = require("express-validator");

const { catchAsync } = require("../../utils/catchAsync");
const {
  verifyMerchantToken,
} = require("../../middlewares/merchant/verifyMerchantToken");
const {
  createContactType,
  getContactTypes,
  getAllContacts,
  createOrUpdateContact,
} = require("../../controllers/merchant/contactController");

// validators
const createContactTypeValidator = [
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

const createOrUpdateContactValidator = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("The field action is required")
    .toUpperCase()
    .isIn(["CREATE", "UPDATE"])
    .withMessage("The field action must be either 'CREATE' or 'UPDATE'"),
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("The field mode is required")
    .toUpperCase()
    .isIn(["TEST", "LIVE"])
    .withMessage("The field mode must be either 'TEST' or 'LIVE'"),
  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("The field contactName is required")
    .withMessage(
      "contactName must be only letters or a combination of letters and numbers"
    )
    .isLength({ min: 2 })
    .withMessage("contactName must be at least 2 characters long"),
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
  body("email")
    .trim()
    .notEmpty()
    .withMessage("The field email is required")
    .isEmail()
    .withMessage("Invalid email id")
    .toLowerCase(),
  body("phone")
    .trim()
    .optional({ checkFalsy: true })
    .custom(async (val) => {
      if (/^[6-9]{1}[0-9]{9}$/.test(val)) {
        return true;
      } else {
        throw new Error("Invalid phone number");
      }
    }),
  body("note")
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 300 })
    .withMessage("note must be at most 300 characters long"),
  // required only for update
  body("taxId")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field taxId is required"),
  body("status")
    .trim()
    .optional({ checkFalsy: true })
    .toUpperCase()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("The field status must be either 'ACTIVE' or 'INACTIVE'"),
  body("address")
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The address object is required"),
  body("address.city")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field city is required"),
  body("address.zip")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field zip is required"),
  body("address.state")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field state is required"),
  body("address.country")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field country is required"),
  body("address.full_address")
    .trim()
    .if(body("action").equals("CREATE"))
    .notEmpty()
    .withMessage("The field full_address is required"),
];

const modeQueryValidator = [
  query("mode")
    .trim()
    .exists()
    .withMessage("The field mode is required as query")
    .isIn(["TEST", "LIVE"])
    .withMessage("Invalid mode"),
];

// contact type
router
  .post(
    "/create-contact-type",
    createContactTypeValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("createContactType api", createContactType)
  )
  .get(
    "/get-contact-types",
    modeQueryValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("getContactTypes api", getContactTypes)
  );

// contact
router
  .post(
    "/upsert-contact",
    createOrUpdateContactValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("createOrUpdateContact api", createOrUpdateContact)
  )
  .get(
    "/all-contacts",
    modeQueryValidator,
    catchAsync("verifyMerchantToken middleware", verifyMerchantToken),
    catchAsync("getAllContacts api", getAllContacts)
  );

module.exports = router;
