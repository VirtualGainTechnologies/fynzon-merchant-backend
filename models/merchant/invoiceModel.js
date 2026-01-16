const mongoose = require("mongoose");
const validator = require("validator");

const invoiceSchema = new mongoose.Schema(
  {
    // merchant details
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "merchant",
      required: [true, "The field user_id is required"],
    },
    user_email: {
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
    company_logo: {
      type: String,
    },

    // contact details
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
    contact_address: {
      city: {
        type: String,
        required: [true, "The field city is required"],
      },
      zip: {
        type: String,
      },
      state: {
        type: String
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

    // wallet details
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

    // invoice details
    invoice_number: {
      type: String,
      trim: true,
      required: [true, "The field invoice_number is required"],
    },
    invoice_type: {
      type: String,
      enum: ["SCHEDULED", "RECURRING"],
      required: [true, "The field invoice_type is required"],
    },
    order_description: {
      type: String,
      trim: true,
      required: [true, "The field order_description is required"],
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
    issue_date: {
      type: String,
      required: [
        function () {
          return this.invoice_type === "SCHEDULED";
        },
        "The field issue_date is required",
      ],
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
      required: [
        function () {
          return this.invoice_type === "SCHEDULED";
        },
        "The field due_date is required",
      ],
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: "Invalid due_date format (YYYY-MM-DD)",
      },
    },
    recurring: {
      every: {
        type: String,
        trim: true,
        enum: {
          values: ["week", "month", "year"],
          message: "{VALUE} is not supported",
        },
        required: [
          function () {
            return this.invoice_type === "RECURRING";
          },
          "Recurring interval (every) is required",
        ],
      },
      day: {
        type: Number,
        min: [0, "Recurring day must be between 0 (Sunday) and 6 (Saturday)"],
        max: [6, "Recurring day must be between 0 (Sunday) and 6 (Saturday)"],
        required: [
          function () {
            return (
              this.invoice_type === "RECURRING" &&
              this.recurring?.every === "week"
            );
          },
          "Recurring day is required when interval is weekly",
        ],
      },
      date: {
        type: Number,
        min: [1, "Recurring date must be between 1 and 31"],
        max: [31, "Recurring date must be between 1 and 31"],
        required: [
          function () {
            return (
              this.invoice_type === "RECURRING" &&
              ["month", "year"].includes(this.recurring?.every)
            );
          },
          "Recurring date is required when interval is monthly or yearly",
        ],
      },
      month: {
        type: Number,
        min: [1, "Recurring month must be between 1 and 12"],
        max: [12, "Recurring month must be between 1 and 12"],
        required: [
          function () {
            return (
              this.invoice_type === "RECURRING" &&
              this.recurring?.every === "year"
            );
          },
          "Recurring month is required when interval is yearly",
        ],
      },
      due_days: {
        type: Number,
        min: [1, "Recurring due days must be positive"],
        required: [
          function () {
            return this.invoice_type === "RECURRING";
          },
          "Recurring expiry days is required",
        ],
        validate: {
          validator: function (value) {
            if (!value) return true;
            const every = this.recurring?.every;
            if (!every) return true;

            // limits based on interval to prevent overlap
            const limits = {
              week: 6,
              month: 27,
              year: 363,
            };
            const max = limits[every];
            if (max && Number(value) > max) return false;
            return true;
          },
          message: function () {
            const every = this.recurring?.every;
            const limits = { week: 6, month: 27, year: 363 };
            return `Expiry days cannot exceed ${limits[every]} days for ${every} interval`;
          },
        },
      },
    },

    // item details
    items: [
      {
        category: {
          type: String,
          required: [true, "The field category is required"],
        },
        name: {
          type: String,
          required: [
            function () {
              return this.category?.toLowerCase() !== "builder";
            },
            "The field name is required",
          ],
        },
        quantity: {
          type: Number,
          required: [
            function () {
              return this.category?.toLowerCase() !== "builder";
            },
            "The field quantity is required",
          ],
        },
        price_per_quantity: {
          type: Number,
          required: [
            function () {
              return this.category?.toLowerCase() !== "builder";
            },
            "The field price_per_quantity is required",
          ],
        },

        project_name: {
          type: String,
          required: [
            function () {
              return this.category?.toLowerCase() == "builder";
            },
            "The field project_name is required",
          ],
        },
        unit_number: {
          type: String,
          required: [
            function () {
              return this.category?.toLowerCase() == "builder";
            },
            "The field unit_number is required",
          ],
        },
        price: {
          type: Number,
          required: [
            function () {
              return this.category?.toLowerCase() == "builder";
            },
            "The field price is required",
          ],
        },
      },
    ],
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
        values: ["PENDING", "SUCCESS", "FAILED","EXPIRED"],
        message: "{value} is not supported",
      },
      default: "PENDING",
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
