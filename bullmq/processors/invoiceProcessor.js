const QRCode = require("qrcode");
const moment = require("moment-timezone");

const {
  getMerchantCryptoAddressByFilter,
} = require("../../services/merchant/cryptoAddressServices");
const {
  getInvoiceById,
  updateInvoiceById,
} = require("../../services/merchant/invoiceService");
const AppError = require("../../utils/AppError");
const { sendEmailWithAttachment } = require("../../utils/emailDispatcher");
const { generateInvoicePdfBuffer } = require("../../utils/invoicePdfGenerator");
const {
  scheduleRecurringInvoiceExpiry,
} = require("../schedulers/invoiceScheduler");

exports.handleIssueInvoice = async (jobData) => {
  try {
    const { _id, tz } = jobData;
    // get invoice
    const invoice = await getInvoiceById(
      _id,
      "due_date invoice_number invoice_type contact_name contact_type contact_email contact_phone address merchant_id merchant_email mode items discount_percentage tax_percentage total_amount base_currency recurring issue_date conversion_rate deposit_network deposit_crypto",
      { lean: true }
    );
    if (!invoice) {
      throw new AppError(400, "Failed to fetch invoice");
    }
    const {
      issue_date,
      due_date,
      recurring: { expiry_days },
      invoice_type,
      contact_email,
      deposit_network,
    } = invoice;

    // get crypto address
    const network = deposit_network.toLowerCase();
    const cryptoAddress = await getMerchantCryptoAddressByFilter(
      { email: contact_email },
      `${network}`,
      { lean: true }
    );
    if (!cryptoAddress || !cryptoAddress?.[network]?.address) {
      throw new AppError(400, "Merchant crypto address not found");
    }
    const qrCode = await QRCode.toDataURL(cryptoAddress?.[network]?.address);

    // generate pdf
    const pdfBuffer = await generateInvoicePdfBuffer({
      ...invoice,
      qrCode,
      newIssueDate: moment().tz(tz).format("YYYY-MM-DD"),
      newDueDate:
        invoice_type == "RECURRING"
          ? moment()
              .tz(tz)
              .add(expiry_days * 1, "days")
              .format("YYYY-MM-DD")
          : due_date,
      networkAddress: cryptoAddress?.[network]?.address,
      company_name: "fynzon",
    });
    const safePdfBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    // send email
    const sendEmail = await sendEmailWithAttachment({
      type: "invoice-email",
      email: contact_email,
      file: {
        buffer: safePdfBuffer,
        originalname: "invoice.pdf",
        mimetype: "application/pdf",
      },
    });
    if (sendEmail.error) {
      throw new AppError(400, sendEmail.message);
    }

    // schedule expiry job for recurring invoice
    if (invoice_type == "RECURRING") {
      await scheduleRecurringInvoiceExpiry({
        issue_date,
        _id,
        expiry_days,
      });
    }
  } catch (err) {
    throw err;
  }
};

exports.handleExpireInvoice = async (jobData) => {
  try {
    const updatedInvoice = await updateInvoiceById(
      jobData._id,
      { status: "EXPIRED" },
      { new: true }
    );
    if (!updatedInvoice) {
      throw new AppError(400, "Failed to update invoice");
    }
  } catch (err) {
    throw err;
  }
};
