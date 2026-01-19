const QRCode = require("qrcode");
const moment = require("moment-timezone");

const {
  getInvoiceById,
  updateInvoiceById,
} = require("../../services/merchant/invoiceService");
const AppError = require("../../utils/AppError");
const {
  sendEmailWithAttachment,
  sendEmail,
} = require("../../utils/emailDispatcher");
const { generateInvoicePdfBuffer } = require("../../utils/invoicePdfGenerator");
const {
  scheduleRecurringInvoiceExpiry,
  scheduleInvoiceAlert,
} = require("../schedulers/invoiceScheduler");
const {
  createRecurringInvoiceDoc,
} = require("../../services/merchant/recurringInvoiceService");

exports.handleDispatchInvoice = async (jobData) => {
  try {
    const { _id, tz } = jobData;
    const invoice = await getInvoiceById(
      _id,
      "_id issue_date due_date recurring invoice_type company_logo company_name contact_name contact_phone contact_address invoice_number order_description conversion_rate items discount_percentage tax_percentage total_crypto_amount base_currency deposit_address contact_email",
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
      company_logo,
      contact_name,
      contact_phone,
      contact_address,
      invoice_number,
      order_description,
      conversion_rate,
      items,
      discount_percentage,
      tax_percentage,
      total_crypto_amount,
      base_currency,
      deposit_address,
      deposit_crypto,
      deposit_network,
      contact_email,
    } = invoice;

    // generate recurring invoice
    if (invoice_type == "RECURRING") {
      const recurringInvoice = await createRecurringInvoiceDoc({
        invoice_id: invoice._id,
        deposit_address,
        deposit_crypto,
        deposit_network,
        issue_date: moment().tz(tz).format("YYYY-MM-DD"),
        due_date: moment()
          .tz(tz)
          .add(recurring?.due_days * 1, "days")
          .format("YYYY-MM-DD"),
      });
      if (!recurringInvoice) {
        throw new AppError(400, "Failed to generate recurring invoice ");
      }
    }

    // generate pdf
    const pdfBuffer = await generateInvoicePdfBuffer({
      company_logo,
      contact_name,
      contact_email,
      contact_phone,
      contact_address,
      deposit_crypto,
      deposit_network,
      deposit_address,
      invoice_number,
      order_description,
      conversion_rate,
      items,
      discount_percentage,
      tax_percentage,
      total_crypto_amount,
      base_currency,
      qrCode: await QRCode.toDataURL(deposit_address),
      userCategory: items[0]?.category,
      companyName: "",
      issueDate: moment().tz(tz).format("YYYY-MM-DD"),
      dueDate:
        invoice_type == "RECURRING"
          ? moment()
              .tz(tz)
              .add(recurring?.due_days * 1, "days")
              .format("YYYY-MM-DD")
          : due_date,
    });

    // send email
    const sendEmail = await sendEmailWithAttachment({
      type: "invoice-email",
      email: contact_email,
      file: {
        buffer: pdfBuffer,
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

    // schedule invoice alert job
    if (invoice_type !== "RECURRING") {
      const dueDate = moment.tz(due_date, "YYYY-MM-DD", true, tz);
      const today = moment().tz(tz).startOf("day");
      const isToday = dueDate.isSame(today, "day");
      if (!isToday) {
        await scheduleInvoiceAlert({
          alert_date: dueDate,
          _id,
          tz,
        });
      }
    } else {
      if (recurring?.due_days !== 0) {
        await scheduleInvoiceAlert({
          alert_date: moment()
            .tz(tz)
            .add(recurring?.due_days * 1, "days")
            .format("YYYY-MM-DD"),
          _id,
          tz,
        });
      }
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

exports.handleAlertInvoice = async (jobData) => {
  try {
    // get invoice
    const invoice = await getInvoiceById(
      jobData?._id,
      "_id due_date contact_name invoice_number total_crypto_amount contact_email",
      { lean: true }
    );
    if (!invoice) {
      throw new AppError(400, "Failed to fetch invoice");
    }

    // send alert email
    const emailObject = {
      userName: invoice?.contact_name,
      invoiceNumber: invoice?.invoice_number,
      dueDate: invoice?.due_date,
      btnURL: `${process.env.CLIENT_BASE_URL1}/auth/login`,
      type: "invoice-alert",
      email: invoice?.contact_email,
    };

    const isEmailSent = await sendEmail(emailObject);
    if (isEmailSent.error) {
      throw new AppError(400, isEmailSent.message);
    }
  } catch (err) {
    throw err;
  }
};
