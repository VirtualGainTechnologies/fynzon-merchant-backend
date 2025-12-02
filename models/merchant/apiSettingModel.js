const mongoose = require("mongoose");
const validator = require("validator");

const MerchantApiSettingSchema = new mongoose.Schema(
  {
    Merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      refer: "Merchant",
      required: [true, "Merchant_id is required field"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required field"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    test_api_key: {
      api_key: {
        type: String,
        trim: true,
      },
      secret_key: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"],
        default: "PENDING",
      },
      url: {
        type: String,
        trim: true,
      },
      created_at: {
        type: Number,
        trim: true,
      },
    },
    live_api_key: {
      api_key: {
        type: String,
        trim: true,
      },
      secret_key: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"],
        default: "PENDING",
      },
      url: {
        type: String,
        trim: true,
      },
      created_at: {
        type: Number,
        trim: true,
      },
    },
    test_ip: [
      {
        _id: false,
        ip_address: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"],
          default: "PENDING",
        },
        created_at: {
          type: Number,
          trim: true,
        },
      },
    ],
    live_ip: [
      {
        _id: false,
        ip_address: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "ACTIVE", "BLOCKED"],
          default: "PENDING",
        },
        created_at: {
          type: Number,
          trim: true,
        },
      },
    ],
    test_webhook_url: [
      {
        _id: false,
        url: {
          type: String,
          trim: true,
        },
        event: {
          type: String,
          trim: true,
          enum: {
            values: ["PAYIN", "PAYOUT"],
            message: "{value} is not supported",
          },
        },
        created_at: {
          type: Number,
          trim: true,
        },
      },
    ],
    live_webhook_url: [
      {
        _id: false,
        url: {
          type: String,
          trim: true,
        },
        event: {
          type: String,
          trim: true,
          enum: {
            values: ["PAYIN", "PAYOUT"],
            message: "{value} is not supported",
          },
        },
        created_at: {
          type: Number,
          trim: true,
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const MerchantApiSettingModel = mongoose.model(
  "api-settings",
  MerchantApiSettingSchema
);

module.exports = { MerchantApiSettingModel };
