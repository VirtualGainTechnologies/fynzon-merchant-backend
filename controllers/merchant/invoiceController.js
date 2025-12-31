const { createInvoiceDoc } = require("../../services/merchant/invoiceService");
const AppError = require("../../utils/AppError");
const { generateUniqueId } = require("../../utils/generateUniqueId");
const { sendEmailWithAttachment } = require("../../utils/emailDispatcher");

exports.createInvoice = async (req, res) => {
  const {
    mode,
    depositCrypto,
    depositNetwork,
    depositAddress,
    contactName,
    contactType,
    contactEmail,
    contactPhone,
    address,
    invoiceDate,
    dueDate,
    invoiceDescription,
    baseCurrency,
    conversionRate,
    items,
    discountPercentage,
    taxPercentage,
    totalAmount,
    isDrafted,
  } = req.body;

  const invoice = await createInvoiceDoc({
    merchant_id: req.merchantId,
    merchant_email: req.email,
    mode,
    deposit_crypto: depositCrypto,
    deposit_network: depositNetwork,
    deposit_address: depositAddress,
    contact_name: contactName,
    contact_type: contactType,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    address: {
      city: address.city,
      zip: address.zip,
      state: address.state,
      country: address.country,
      country_code: address.countryCode,
      full_address: address.fullAddress,
    },
    invoice_number: `FYN${generateUniqueId(12)}`,
    invoice_date: new Date(invoiceDate).getTime(),
    due_date: new Date(dueDate).getTime(),
    invoice_discription: invoiceDescription,
    base_currency: baseCurrency,
    conversion_rate: {
      currency: conversionRate.currency,
      crypto: conversionRate.crypto,
      currency_amount: conversionRate.currencyAmount,
      crypto_amount: conversionRate.cryptoAmount,
    },
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      price_currency: item.priceCurrency,
    })),
    discount_percentage: discountPercentage,
    tax_percentage: taxPercentage,
    total_amount: totalAmount,
    status: isDrafted ? "DRAFTED" : "PENDING",
  });

  if (!invoice) {
    throw new AppError(400, "Failed to create invoice");
  }

  res.status(200).json({
    message: "Invoice created successfully",
    error: false,
    data: invoice,
  });
};

exports.sendInvoiceEmail = async (req, res) => {
  if (!req.file) {
    throw new AppError(400, "Invoice PDF is required");
  }
  const sendEmail = await sendEmailWithAttachment({
    type: "invoice-email",
    email: req.body.email,
    file: req.file,
  });
  if (sendEmail.error) {
    throw new AppError(400, sendEmail.message);
  }

  res.status(200).json({
    message: "Invoice email sent successfully",
    error: false,
    data: null,
  });
};
