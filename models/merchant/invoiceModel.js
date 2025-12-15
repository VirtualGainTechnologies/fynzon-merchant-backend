const mongoose = require("mongoose");
const validator = require("validator");

const invoiceSchema = new mongoose.Schema(
  {
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "merchant",
      required: [true, "The field merchant_id is required"],
    },
    merchant_email: {
      type: String,
      trim: true,
      required: [true, "The field user_email is required"],
      lowercase: true,
      validate: [validator.isEmail, "The field user_email is invalid"],
    },
    mode: {
      type: String,
      trim: true,
      enum: {
        values: ["TEST", "LIVE"],
        message: "{value} is not supported",
      },
      required: [true, "The field mode is required"],
    },
    deposit_crypto: {
      type: String,
      trim: true,
      enum: {
        values: ["USDT"],
        message: "{value} is not supported",
      },
      required: [true, "The field deposit_crypto is required"],
    },
    deposit_network: {
      type: String,
      trim: true,
      enum: {
        values: ["TRC-20"],
        message: "{value} is not supported",
      },
      required: [true, "The field deposit_network is required"],
    },
    deposit_address: {
      type: String,
      trim: true,
      required: [true, "The field deposit_address is required"],
    },
    contact_name: {
      type: String,
      trim: true,
      required: [true, "The field contact_name is required"],
    },
    contact_type: {
      type: String,
      trim: true,
      required: [true, "The field contact_type is required"],
    },
    contact_email: {
      type: String,
      trim: true,
      required: [true, "The field contact_email is required"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    contact_phone: {
      type: String,
      trim: true,
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number",
      ],
    },
    address: {
      city: {
        type: String,
        required: [true, "The field city is required"],
      },
      zip: {
        type: String,
        required: [true, "The field zip is required"],
      },
      state: {
        type: String,
        required: [true, "The field state is required"],
      },
      country: {
        type: String,
        required: [true, "The field country is required"],
      },
      country_code: {
        type: String,
        required: [true, "The field country_code is required"],
      },
      full_address: {
        type: String,
        required: [true, "The field full_address is required"],
      },
    },
    invoice_number: {
      type: String,
      trim: true,
      required: [true, "The field invoice_number is required"],
    },
    invoice_date: {
      type: Number,
      required: [true, "The field invoice_date is required"],
    },
    due_date: {
      type: Number,
      required: [true, "The field due_date is required"],
    },
    invoice_discription: {
      type: String,
      trim: true,
      required: [true, "The field invoice_number is required"],
      minlength: [10, "Invoice description must be at least 10 characters"],
      maxlength: [100, "Invoice description cannot exceed 100 characters"],
    },
    base_currency: {
      type: String,
      trim: true,
      enum: {
        values: ["AED", "INR"],
        message: "{value} is not supported",
      },
      required: [true, "The field base_currency is required"],
    },
    conversion_rate: {
      currency: {
        type: String,
        trim: true,
        required: [true, "The field currency is required"],
      },
      crypto: {
        type: String,
        trim: true,
        required: [true, "The field crypto is required"],
      },
      currency_amount: {
        type: Number,
        trim: true,
        required: [true, "The field currency_amount is required"],
      },
      crypto_amount: {
        type: Number,
        trim: true,
        required: [true, "The field crypto_amount is required"],
      },
    },
    items: [
      {
        name: {
          type: String,
          required: [true, "The field name is required"],
        },
        quantity: {
          type: Number,
          required: [true, "The field quantity is required"],
        },
        price: {
          type: Number,
          required: [true, "The field price is required"],
        },
        price_currency: {
          type: String,
          required: [true, "The field price_currency is required"],
        },
      },
    ],
    discount_percentage: {
      type: Number,
      required: [true, "The field discount_percentage is required"],
    },
    tax_percentage: {
      type: Number,
      required: [true, "The field tax_percentage is required"],
    },
    total_amount: {
      type: Number,
      required: [true, "The field total_amount is required"],
    },
    date: {
      type: Number,
      default: new Date().getTime(),
    },
  },
  { versionKey: false, timestamps: true }
);

const InvoiceModel = mongoose.model("invoice", invoiceSchema);
module.exports = { InvoiceModel };
