const moment = require("moment-timezone");

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

exports.createInvoice = async (req, res) => {
  const {
    companyLogo,
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
    items,
    mode,
    invoiceType,
    timezone,
    recurring,
  } = req.body;

  if (req.userType == "ENTITY" && !companyLogo) {
    throw new AppError(400, "The field companyLogo is required");
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
      totalCurrencyAmount += item.pricePerQuantity * Number(item.quantity);
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
      zip: contactAddress.zip,
      state: contactAddress.state,
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
    total_crypto_amount: totalCryptoAmount,
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
