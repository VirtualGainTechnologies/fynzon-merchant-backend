const mongoose = require("mongoose");
const validator = require("validator");

const kycSchema = new mongoose.Schema(
  {
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "merchant",
      required: [true, "merchant_id is required field"],
    },

    merchant_type: {
      type: String,
      trim: true,
      enum: {
        values: ["INDIVIDUAL", "ENTITY"],
        message: "{value} is not suported",
      },
      required: [true, "merchant_type is required field"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required field"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    aadhaar: {
      front_image: {
        type: String,
      },
      back_image: {
        type: String,
      },
      name: {
        type: String,
      },
      parent_name: {
        type: String,
      },
      birth_date: {
        type: String,
      },
      issue_date: {
        type: String,
      },
      expiry_date: {
        type: String,
      },
      aadhaar_number: {
        type: String,
      },
      gender: {
        type: String,
      },
      address: {
        address_line: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        pin_code: {
          type: String,
        },
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "VERIFIED", "REJECTED"],
          message: "{value} is not supported",
        },
        default: "PENDING",
      },
      is_aadhaar_verified: {
        type: Boolean,
        default: false,
      },
    },
    pan: {
      type_of_holder: {
        type: String,
      },
      pan_image: {
        type: String,
      },
      name: {
        type: String,
      },
      parent_name: {
        type: String,
      },
      birth_date: {
        type: String,
      },
      issue_date: {
        type: String,
      },
      expiry_date: {
        type: String,
      },
      pan_number: {
        type: String,
      },
      gender: {
        type: String,
      },
      address: {
        address_line: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        pin_code: {
          type: String,
        },
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "VERIFIED", "REJECTED"],
          message: "{value} is not supported",
        },
        default: "PENDING",
      },
      is_pan_verified: {
        type: Boolean,
        default: false,
      },
    },
    bank: {
      bank_name: {
        type: String,
      },
      branch: {
        type: String,
      },
      ifsc: {
        type: String,
      },
      account_number: {
        type: String,
      },
      account_type: {
        type: String,
      },
      name: {
        type: String,
      },
      cancelled_cheque_image: {
        type: String,
      },
      cheque_number: {
        type: String,
      },
      cheque_issue_date: {
        type: String,
      },
      cheque_expiry_date: {
        type: String,
      },
      micr_code: {
        type: String,
      },
      testTransferRRN: {
        type: String,
      },
      address: {
        address_line: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        pin_code: {
          type: String,
        },
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "VERIFIED", "REJECTED"],
          message: "{value} is not supported",
        },
        default: "PENDING",
      },
      is_bank_verified: {
        type: Boolean,
        default: false,
      },
    },
    gstin: {
      gstin_number: {
        type: String,
      },
      constitution_of_business: {
        type: String,
      },
      legal_name_of_business: {
        type: String,
      },
      trade_name_of_business: {
        type: String,
      },
      centre_jurisdiction: {
        type: String,
      },
      state_jurisdiction: {
        type: String,
      },
      registration_date: {
        type: String,
      },
      tax_payer_date: {
        type: String,
      },
      tax_payer_type: {
        type: String,
      },
      gstin_status: {
        type: String,
      },
      cancellation_date: {
        type: String,
      },
      nature_of_business_activities: [String],
      address: {
        address_line: {
          type: String,
        },
        city: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        pin_code: {
          type: String,
        },
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "VERIFIED", "REJECTED"],
          message: "{value} is not supported",
        },
        default: "PENDING",
      },
      is_gstin_verified: {
        type: Boolean,
        default: false,
      },
    },
    selfie: {
      selfie_image: {
        type: String,
      },
      status: {
        type: String,
        enum: {
          values: ["PENDING", "VERIFIED", "REJECTED"],
          message: "{value} is not supported",
        },
        default: "PENDING",
      },
      is_selfie_verified: {
        type: Boolean,
        default: false,
      },
    },
    kyc_status: {
      type: String,
      enum: {
        values: ["PENDING", "VERIFIED", "REJECTED"],
        message: "{value} is not supported",
      },
      default: "PENDING",
    },
  },
  { versionKey: false, timestamps: true }
);

kycSchema.index({ userId: 1 });
kycSchema.index({ "bank. account_number": 1 });

const MerchantKycModel = mongoose.model("kyc", kycSchema);
module.exports = { MerchantKycModel };
