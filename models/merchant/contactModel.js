const mongoose = require("mongoose");
const validator = require("validator");

const contactTypeSchema = new mongoose.Schema(
  {
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      ref: "merchant",
      required: [true, "The field merchant_id is required"],
      unique: [true, "The field merchant_id must be unique"],
    },
    merchant_email: {
      type: String,
      trim: true,
      required: [true, "The field merchant_email is required"],
      lowercase: true,
      validate: [validator.isEmail, "The field merchant_email is invalid"],
      unique: [true, "The field merchant_email must be unique"],
    },
    contact_types: [
      {
        mode: {
          type: String,
          trim: true,
          enum: {
            values: ["TEST", "LIVE"],
            message: "{VALUE} is not supported",
          },
        },
        name: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

const ContactTypeModel = mongoose.model("contact-type", contactTypeSchema);

const contactSchema = new mongoose.Schema(
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
      required: [true, "The field  mode is required"],
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
    user_email: {
      type: String,
      trim: true,
      required: [true, "The field user_email is required"],
      unique: [true, "The field user_email must be unique"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    user_phone: {
      type: String,
      trim: true,
      unique: [true, "The field user_phone must be unique"],
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
      full_address: {
        type: String,
        required: [true, "The field full_address is required"],
      },
    },
    tax_id: {
      type: String,
      trim: true,
      required: [true, "The field tax_id is required"],
    },
    note: {
      type: String,
      trim: true,
      required: [true, "The field note is required"],
    },
    status: {
      type: String,
      trim: true,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "{value} is not supported",
      },
      default: "ACTIVE",
    },
    date: {
      type: Number,
      default: new Date().getTime(),
    },
  },
  { versionKey: false, timestamps: true }
);

// indexing for get contact api

const ContactModel = mongoose.model("contact", contactSchema);

module.exports = { ContactTypeModel, ContactModel };
