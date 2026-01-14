const mongoose = require("mongoose");
const validator = require("validator");

const cryptoAddressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      refPath: "user_category",
      required: [true, "user_id is required field"],
    },
    user_category: {
      type: String,
      enum: ["merchant", "contact"],
      required: [true, "user_category is required field"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required field"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    account_type: {
      type: String,
      enum: {
        values: ["USER", "ADMIN"],
        message: "{value} is not supported",
      },
      default: "USER",
    },
    btc: {
      address: {
        type: String,
      },
      hex_address: {
        type: String,
      },
      mnemonic_phrase: {
        type: String,
      },
      private_key: {
        type: String,
      },
      public_key: {
        type: String,
      },
    },
    erc20: {
      address: {
        type: String,
      },
      hex_address: {
        type: String,
      },
      mnemonic_phrase: {
        type: String,
      },
      private_key: {
        type: String,
      },
      public_key: {
        type: String,
      },
    },
    trc20: {
      address: {
        type: String,
      },
      hex_address: {
        type: String,
      },
      mnemonic_phrase: {
        type: String,
      },
      private_key: {
        type: String,
      },
      public_key: {
        type: String,
      },
    },
  },
  { versionKey: false, timestamps: true }
);

cryptoAddressSchema.index({ userId: 1 });

const MerchantCryptoAddressModel = mongoose.model(
  "crypto-address",
  cryptoAddressSchema
);

module.exports = {
  MerchantCryptoAddressModel,
};
