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

  // parse data
  const conversion_rate = JSON.parse(conversionRate);
  const contact_address = JSON.parse(contactAddress);
  const recurringValues = recurring ? JSON.parse(recurring) : null;

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
    { lean: true }
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
    }
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
      "Deposit address does not match the contact address"
    );
  }

  // prepare item list and calculate total amount
  let totalCurrencyAmount = 0;
  const itemList = JSON.parse(items).map((item) => {
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
    (totalCurrencyAmount * conversion_rate.cryptoAmount) /
    conversion_rate.currencyAmount;

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
      city: contact_address.city,
      zip: contact_address?.zip || "N/A",
      state: contact_address?.state || "N/A",
      country: contact_address.country,
      country_code: contact_address.countryCode,
      full_address: contact_address.fullAddress,
    },
    deposit_crypto: depositCrypto,
    deposit_network: depositNetwork,
    deposit_address: depositAddress,
    invoice_number: invoiceNumber,
    invoice_type: invoiceType,
    order_description: orderDescription,
    conversion_rate: {
      currency: conversion_rate.currency,
      crypto: conversion_rate.crypto,
      currency_amount: conversion_rate.currencyAmount,
      crypto_amount: conversion_rate.cryptoAmount,
    },
    issue_date: invoiceType !== "RECURRING" ? issueDate : "N/A",
    due_date: invoiceType !== "RECURRING" ? dueDate : "N/A",
    ...(recurringValues && {
      recurring: {
        every: recurringValues.every,
        ...(recurringValues.every == "week"
          ? {
              day: recurringValues.day,
            }
          : recurringValues.every == "month"
          ? {
              date: recurringValues.date,
            }
          : {
              month: recurringValues.month,
              date: recurringValues.date,
            }),
        due_days: recurringValues.dueDays,
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
        recurring: recurringValues,
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
    baseCurrency,
    issueDate,
    dueDate,
  } = req.body;

  // parse data
  const conversion_rate = JSON.parse(conversionRate);
  const contact_address = JSON.parse(contactAddress);

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
  const itemList = JSON.parse(items).map((item) => {
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
    (totalCurrencyAmount * conversion_rate.cryptoAmount) /
    conversion_rate.currencyAmount;

  // generate pdf
  const pdfBuffer = await generateInvoicePdfBuffer({
    company_logo: companyLogo || "",
    contact_name: contactName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    contact_address: {
      city: contact_address.city,
      zip: contact_address?.zip || "N/A",
      state: contact_address?.state || "N/A",
      country: contact_address.country,
      country_code: contact_address.countryCode,
      full_address: contact_address.fullAddress,
    },
    deposit_crypto: depositCrypto,
    deposit_network: depositNetwork,
    deposit_address: depositAddress,
    invoice_number: invoiceNumber,
    order_description: orderDescription,
    conversion_rate: {
      currency: conversion_rate.currency,
      crypto: conversion_rate.crypto,
      currency_amount: conversion_rate.currencyAmount,
      crypto_amount: conversion_rate.cryptoAmount,
    },
    items: itemList,
    discount_percentage: discountPercentage,
    tax_percentage: taxPercentage,
    total_crypto_amount: totalCryptoAmount,
    base_currency: baseCurrency,
    qrCode: await QRCode.toDataURL(depositAddress),
    userCategory: req.userCategory,
    companyName: "",
    issueDate: issueDate || "",
    dueDate: dueDate || "",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="report.pdf"');
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
};
