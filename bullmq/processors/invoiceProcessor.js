const QRCode = require("qrcode");
const moment = require("moment-timezone");

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

exports.handleDispatchInvoice = async (jobData) => {
  try {
    const { _id, tz } = jobData;
    // get invoice
    const invoice = await getInvoiceById(
      _id,
      {
        user_id: 1,
        user_email: 1,
        mode: 1,
        companyLogo: 1,
        contact_name: 1,
        contact_type: 1,
        contact_email: 1,
        contact_phone: 1,
        contact_address: 1,
        deposit_crypto: 1,
        deposit_network: 1,
        deposit_address: 1,
        invoice_number: 1,
        invoice_type: 1,
        order_description: 1,
        conversion_rate: 1,
        issue_date: 1,
        due_date: 1,
        recurring: 1,
        items: 1,
        discount_percentage: 1,
        tax_percentage: 1,
        total_currency_amount: 1,
        total_crypto_amount: 1,
        status: 1,
      },
      { lean: true }
    );
    if (!invoice) {
      throw new AppError(400, "Failed to fetch invoice");
    }
    const {
      issue_date,
      due_date,
      recurring,
      invoice_type,
      contact_email,
      deposit_address,
      items,
    } = invoice;

    // generate qr code
    const qrCode = await QRCode.toDataURL(deposit_address);

    // generate pdf
    const pdfBuffer = await generateInvoicePdfBuffer({
      ...invoice,
      userCategory: items[0]?.category,
      qrCode,
      newIssueDate: moment().tz(tz).format("YYYY-MM-DD"),
      newDueDate:
        invoice_type == "RECURRING"
          ? moment()
              .tz(tz)
              .add(due_days * 1, "days")
              .format("YYYY-MM-DD")
          : due_date,
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
        due_days: recurring?.due_days,
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
