const mongoose = require("mongoose");
const validator = require("validator");

const walletSchema = new mongoose.Schema(
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
    inr: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    btc: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    bch: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    bnb: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    eth: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    matic: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    trx: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    usdt: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    xrp: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    sol: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
    ltc: {
      name: {
        type: String,
      },
      image: {
        type: String,
      },
      balance: {
        type: Number,
      },
    },
  },
  { versionKey: false, timestamps: true }
);

walletSchema.index({ user_id: 1 });

const MerchantWalletModel = mongoose.model("wallet", walletSchema);
module.exports = {
  MerchantWalletModel,
};
