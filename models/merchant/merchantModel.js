const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const merchantSchema = new mongoose.Schema(
  {
    merchant_type: {
      type: String,
      trim: true,
      enum: {
        values: ["INDIVIDUAL", "ENTITY"],
        message: "{value} is not suported",
      },
      required: [true, "User type is required field"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required field"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    business_name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [
        function () {
          return this.merchant_type === "ENTITY";
        },
        "Business name is required field",
      ],
    },
    business_category: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.user_type === "ENTITY";
        },
        "Business category is required field",
      ],
    },
    full_name: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.merchant_type === "INDIVIDUAL";
        },
        "Full name is required field",
      ],
    },
    profession: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.merchant_type === "INDIVIDUAL";
        },
        "Profession is required field",
      ],
    },
    phone_code: {
      type: String,
      trim: true,
      default: "91",
      required: [true, "Phone code is required field"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required field"],
      unique: [true, "Phone number must be unique"],
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required field"],
    },
    onboarding_mode: {
      type: String,
      enum: {
        values: ["TEST", "LIVE"],
        message: "{value} is not supported",
      },
      default: "TEST",
    },
    token: {
      type: String,
      trim: true,
      required: [true, "Token is required field"],
    },
    incorrect_login_count: {
      type: Number,
      default: 0,
    },
    last_failed_login_at: {
      type: Number,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    kyc_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kyc",
    },
    wallet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
    },
    last_login_ip: {
      type: String,
      default: "",
    },
    last_login_location: {
      country: String,
      region: String,
      eu: String,
      timezone: String,
      city: String,
      ll: [Number],
    },
    last_login_date: {
      type: Number,
      default: new Date().getTime(),
    },
  },
  { versionKey: false, timestamps: true }
);

// hash the password before saving to db
merchantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// compare password with hashed password in database
merchantSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// generate a JWT token
merchantSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.USER_JWT_SECRET, {
    expiresIn: process.env.USER_JWT_EXPIRES_IN,
  });
  this.token = token;
};

// increment login count when user logs in
merchantSchema.methods.incrementIncorrectLoginCount = function () {
  this.incorrect_login_count += 1;
  return this.save();
};

const MerchantModel = mongoose.model("merchant", merchantSchema);
module.exports = { MerchantModel };
