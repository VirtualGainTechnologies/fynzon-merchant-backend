const mongoose = require("mongoose");

const recurringInvoiceSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "invoice",
      required: [true, "The field invoice_id is required"],
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
        values: ["TRC20"],
        message: "{value} is not supported",
      },
      required: [true, "The field deposit_network is required"],
    },
    deposit_address: {
      type: String,
      trim: true,
      required: [true, "The field deposit_address is required"],
    },
    issue_date: {
      type: String,
      required: [true, "The field issue_date is required"],
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: "Invalid issue_date format (YYYY-MM-DD)",
      },
    },
    due_date: {
      type: String,
      required: [true, "The field due_date is required"],
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: "Invalid due_date format (YYYY-MM-DD)",
      },
    },
    total_currency_amount: {
      type: Number,
      required: [true, "The field total_amount is required"],
    },
    total_crypto_amount: {
      type: Number,
      required: [true, "The field total_amount is required"],
    },
    discount_percentage: {
      type: Number,
      required: [true, "The field discount_percentage is required"],
    },
    tax_percentage: {
      type: Number,
      required: [true, "The field tax_percentage is required"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "SCHEDULED",
          "PENDING",
          "SUCCESS",
          "FAILED",
          "EXPIRED",
          "REJECTED",
          "PAUSED",
        ],
        message: "{value} is not supported",
      },
      default: "SCHEDULED",
    },
    date: {
      type: Number,
      default: new Date().getTime(),
    },
  },
  { versionKey: false, timestamps: true }
);

const RecurringInvoiceModel = mongoose.model(
  "recurring-invoice",
  recurringInvoiceSchema
);
module.exports = { RecurringInvoiceModel };
