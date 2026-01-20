const moment = require("moment-timezone");
const QRCode = require("qrcode");

const {
  createInvoiceDoc,
  getInvoiceByFilter,
} = require("../../services/merchant/invoiceService");
const AppError = require("../../utils/AppError");
const {
  handleDispatchInvoice,
} = require("../../bullmq/processors/invoiceProcessor");
const {
  scheduleInvoiceDispatch,
  scheduleRecurringInvoiceDispatch,
  scheduleInvoiceExpiry,
} = require("../../bullmq/schedulers/invoiceScheduler");
const {
  getContactByFilter,
} = require("../../services/merchant/contactService");
const { uploadPublicFile } = require("../../utils/imageUpload");
const { generateInvoicePdfBuffer } = require("../../utils/invoicePdfGenerator");
const { getMerchantById } = require("../../services/merchant/authService");

exports.createInvoice = async (req, res) => {
  const {
    contactAddress,
    contactName,
    contactType,
    contactEmail,
    contactPhone,
    depositCrypto,
    depositNetwork,
    depositAddress,
    invoiceNumber,
    orderDescription,
    conversionRate,
    issueDate,
    dueDate,
    discountPercentage,
    taxPercentage,
    items = [],
    mode,
    invoiceType,
    timezone,
    recurring = null,
  } = req.body;

  // upload logo
  let companyLogo = null;
  if (req.userType == "ENTITY") {
    if (!req.file) throw new AppError(400, "The field companyLogo is required");
    else {
      const imageData = await uploadPublicFile(req.file, req.fullName, 5);
      if (imageData.error) {
        throw new AppError(400, imageData.message);
      }
      companyLogo = imageData.data;
    }
  }

  // check if invoice number already exists
  const invoiceExists = await getInvoiceByFilter(
    { invoice_number: invoiceNumber },
    "_id",
    { lean: true },
  );
  if (invoiceExists) {
    throw new AppError(400, "Invoice number already exists");
  }

  // validate contact email
  const network = depositNetwork.toLowerCase();
  const contact = await getContactByFilter(
    {
      user_id: req.userId,
      contact_email: contactEmail,
    },
    "_id",
    {
      lean: true,
      populate: {
        path: "crypto_address_id",
        select: network,
      },
    },
  );
  if (!contact) {
    throw new AppError(400, "No contact found with this email");
  }

  // validate deposit crypto address
  const cryptoAddress = contact?.crypto_address_id?.[network];
  if (!cryptoAddress) {
    throw new AppError(400, `No ${network} address found for this contact`);
  }
  if (cryptoAddress.address !== depositAddress) {
    throw new AppError(
      400,
      "Deposit address does not match the contact address",
    );
  }

  // prepare item list and calculate total amount
  let totalCurrencyAmount = 0;
  const itemList = items.map((item) => {
    const category = req.userCategory.toLowerCase();
    if (category == "builder") {
      totalCurrencyAmount += item.price * 1;
      return {
        category: req.userCategory,
        project_name: item.projectName,
        unit_number: item.unitNumber,
        price: item.price,
      };
    } else {
      totalCurrencyAmount += item.pricePerQuantity * item.quantity;
      return {
        category: req.userCategory,
        name: item.name,
        quantity: item.quantity,
        price_per_quantity: item.pricePerQuantity,
      };
    }
  });
  const totalCryptoAmount =
    (totalCurrencyAmount * conversionRate.cryptoAmount) /
    conversionRate.currencyAmount;

  // create invoice
  const invoice = await createInvoiceDoc({
    user_id: req.userId,
    user_email: req.email,
    mode,
    ...(companyLogo && { company_logo: companyLogo }),
    contact_name: contactName,
    contact_type: contactType,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    contact_address: {
      city: contactAddress.city,
      zip: contactAddress?.zip || "N/A",
      state: contactAddress?.state || "N/A",
      country: contactAddress.country,
      country_code: contactAddress.countryCode,
      full_address: contactAddress.fullAddress,
    },
    deposit_crypto: depositCrypto,
    deposit_network: depositNetwork,
    deposit_address: depositAddress,
    invoice_number: invoiceNumber,
    invoice_type: invoiceType,
    order_description: orderDescription,
    conversion_rate: {
      currency: conversionRate.currency,
      crypto: conversionRate.crypto,
      currency_amount: conversionRate.currencyAmount,
      crypto_amount: conversionRate.cryptoAmount,
    },
    issue_date: invoiceType !== "RECURRING" ? issueDate : "N/A",
    due_date: invoiceType !== "RECURRING" ? dueDate : "N/A",
    ...(recurring && {
      recurring: {
        every: recurring.every,
        ...(recurring.every == "week"
          ? {
              day: recurring.day,
            }
          : recurring.every == "month"
            ? {
                date: recurring.date,
              }
            : {
                month: recurring.month,
                date: recurring.date,
              }),
        due_days: recurring.dueDays,
      },
    }),
    items: itemList,
    discount_percentage: discountPercentage,
    tax_percentage: taxPercentage,
    total_currency_amount: totalCurrencyAmount,
    total_crypto_amount: Math.round(Number(totalCryptoAmount) * 100) / 100,
    status: "PENDING",
  });

  if (!invoice) {
    throw new AppError(400, "Failed to create invoice");
  }
  const { issue_date, due_date, _id, invoice_type } = invoice;

  // schedule jobs
  switch (invoice_type) {
    case "SCHEDULED":
      const today = moment.tz(timezone).startOf("day");
      const issueDate = moment
        .tz(issue_date, "YYYY-MM-DD", true, timezone)
        .startOf("day");
      issueDate.isSame(today)
        ? await handleDispatchInvoice({ _id, tz: timezone })
        : await scheduleInvoiceDispatch({ issue_date, _id, tz: timezone });
      await scheduleInvoiceExpiry({ due_date, _id, tz: timezone });
      break;

    case "RECURRING":
      await scheduleRecurringInvoiceDispatch({
        recurring,
        _id,
        tz: timezone,
      });
      break;

    default:
      throw new AppError(400, "Invalid invoice type");
  }

  res.status(200).json({
    message: "Invoice created successfully",
    error: false,
    data: invoice,
  });
};

exports.downloadInvoice = async (req, res) => {
  const {
    contactName,
    contactEmail,
    contactPhone,
    contactAddress,
    depositCrypto,
    depositNetwork,
    depositAddress,
    invoiceNumber,
    orderDescription,
    conversionRate,
    items,
    discountPercentage,
    taxPercentage,
    issueDate,
    dueDate,
    contactType,
  } = req.body;

  // upload logo
  let companyLogo = null;
  if (req.userType == "ENTITY") {
    if (!req.file) throw new AppError(400, "The field companyLogo is required");
    else {
      const imageData = await uploadPublicFile(req.file, req.fullName, 5);
      if (imageData.error) {
        throw new AppError(400, imageData.message);
      }
      companyLogo = imageData.data;
    }
  }

  // prepare item list and calculate total amount
  let totalCurrencyAmount = 0;
  const itemList = items.map((item) => {
    const category = req.userCategory.toLowerCase();
    if (category == "builder") {
      totalCurrencyAmount += item.price * 1;
      return {
        category: req.userCategory,
        project_name: item.projectName,
        unit_number: item.unitNumber,
        price: item.price,
      };
    } else {
      totalCurrencyAmount += item.pricePerQuantity * item.quantity;
      return {
        category: req.userCategory,
        name: item.name,
        quantity: item.quantity,
        price_per_quantity: item.pricePerQuantity,
      };
    }
  });

  // get merchant details
  const merchant = await getMerchantById(
    req.userId,
    "user_type phone full_name business_name email",
    {
      populate: {
        path: "kyc_id",
        select: "aadhaar gstin",
      },
      lean: true,
    },
  );
  const { kyc_id, user_type, full_name, business_name, email, phone } =
    merchant;
  const merchantAddress =
    user_type == "INDIVIDUAL"
      ? kyc_id.aadhaar?.address?.address_line
        ? `${kyc_id.aadhaar?.address?.address_line} ${kyc_id.aadhaar?.address?.city} ${kyc_id.aadhaar?.address?.district} ${kyc_id.aadhaar?.address?.state} ${kyc_id.aadhaar?.address?.country} pin-${kyc_id.aadhaar?.address?.pin_code}`
        : "N/A"
      : kyc_id.gstin?.address?.address_line
        ? `${kyc_id.gstin?.address?.address_line} ${kyc_id.gstin?.address?.city} ${kyc_id.gstin?.address?.district} ${kyc_id.gstin?.address?.state} ${kyc_id.gstin?.address?.country} pin-${kyc_id.gstin?.address?.pin_code}`
        : "N/A";

  // get contact details
  const contact = await getContactByFilter(
    {
      user_id: req.userId,
      contact_email: contactEmail,
    },
    "_id company_name tax_id",
    {
      lean: true,
    },
  );
  if (!contact) {
    throw new AppError(400, "No contact found with this email");
  }

  // generate pdf
  const pdfBuffer = await generateInvoicePdfBuffer({
    company_logo: companyLogo || "",
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    contact_address: {
      city: contactAddress.city,
      zip: contactAddress?.zip || "N/A",
      state: contactAddress?.state || "N/A",
      country: contactAddress.country,
      country_code: contactAddress.countryCode,
      full_address: contactAddress.fullAddress,
    },
    deposit_crypto: depositCrypto,
    deposit_network: depositNetwork,
    deposit_address: depositAddress,
    invoice_number: invoiceNumber,
    order_description: orderDescription,
    contact_type: contactType,
    conversion_rate: {
      currency: conversionRate.currency,
      crypto: conversionRate.crypto,
      currency_amount: conversionRate.currencyAmount,
      crypto_amount: conversionRate.cryptoAmount,
    },
    items: itemList,
    discount_percentage: discountPercentage,
    tax_percentage: taxPercentage,
    qrCode: await QRCode.toDataURL(depositAddress),
    userCategory: req.userCategory,
    companyName: "",
    issueDate: issueDate || "",
    dueDate: dueDate || "",
    total_currency_amount: totalCurrencyAmount,
    merchant: {
      type: user_type,
      name: user_type == "INDIVIDUAL" ? full_name : business_name,
      email: email,
      phone: phone,
      address: merchantAddress,
    },
    company_name: contact.company_name,
    tax_id: contact.tax_id,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${"invoice-" + invoiceNumber}`,
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
};
