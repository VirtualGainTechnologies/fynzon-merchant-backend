const mongoose = require("mongoose");
const validator = require("validator");

const cryptoAddressSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      refer: "merchants",
      required: true,
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
