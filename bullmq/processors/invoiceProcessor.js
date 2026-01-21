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
const { getMerchantById } = require("../../services/merchant/authService");
const {
  getContactByFilter,
} = require("../../services/merchant/contactService");
const { runTxnWithRetry } = require("../../services/shared/mongooseTxnService");

const handleRecurrentInvoice = async (data) => {
  try {
    await runTxnWithRetry(async (session) => {
      const {
        invoice_id,
        deposit_address,
        deposit_crypto,
        deposit_network,
        issue_date,
        due_date,
        due_days,
        tz,
      } = data;

      // generate recurring invoice
      const recurringInvoice = await createRecurringInvoiceDoc(
        {
          invoice_id,
          deposit_address,
          deposit_crypto,
          deposit_network,
          issue_date,
          due_date,
        },
        session,
      );
      if (!recurringInvoice) {
        throw new AppError(400, "Failed to generate recurring invoice ");
      }

      // update invoice issueDate & dueDate
      const updatedInvoice = await updateInvoiceById(
        invoice_id,
        {
          issue_date,
          due_date,
        },
        { new: true, session },
      );
      if (!updatedInvoice) {
        throw new AppError(400, "Failed to update invoice");
      }

      // schedule expiry job for recurring invoice
      await scheduleRecurringInvoiceExpiry({
        issue_date,
        _id: invoice_id.toString(),
        due_days,
      });

      // schedule invoice alert job
      if (due_days !== 0) {
        await scheduleInvoiceAlert({
          alert_date: moment()
            .tz(tz)
            .add(due_days * 1, "days")
            .format("YYYY-MM-DD"),
          _id: invoice_id.toString(),
          tz,
        });
      }
    });
  } catch (err) {
    throw err;
  }
};

exports.handleDispatchInvoice = async (jobData) => {
  try {
    const { _id, tz } = jobData;
    // get invoice
    const invoice = await getInvoiceById(
      _id,
      "_id user_id issue_date due_date recurring invoice_type company_logo contact_name contact_phone contact_address invoice_number order_description conversion_rate items discount_percentage tax_percentage total_currency_amount deposit_address contact_email deposit_crypto contact_type deposit_network",
      { lean: true },
    );
    if (!invoice) {
      throw new AppError(400, "Failed to fetch invoice");
    }
    const {
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
      total_currency_amount,
      deposit_address,
      deposit_crypto,
      deposit_network,
      contact_email,
      contact_type,
    } = invoice;

    // get merchant details
    const merchant = await getMerchantById(
      invoice.user_id,
      "user_type phone business_name full_name email",
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
        user_id: invoice.user_id,
        contact_email: contact_email,
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
      contact_type,
      discount_percentage,
      tax_percentage,
      qrCode: await QRCode.toDataURL(deposit_address),
      userCategory: items[0].category,
      companyName: "",
      total_currency_amount,
      merchant: {
        type: user_type,
        name: user_type == "INDIVIDUAL" ? full_name : business_name,
        email: email,
        phone: phone,
        address: merchantAddress,
      },
      issueDate: moment().tz(tz).format("YYYY-MM-DD"),
      dueDate:
        invoice_type == "RECURRING"
          ? moment()
              .tz(tz)
              .add(recurring?.due_days * 1, "days")
              .format("YYYY-MM-DD")
          : due_date,
      company_name: contact.company_name,
      tax_id: contact.tax_id,
    });

    // send email
    const sendEmail = await sendEmailWithAttachment({
      type: "invoice-email",
      email: contact_email,
      file: {
        buffer: pdfBuffer,
        originalname: `${"invoice-" + invoice_number}`,
        mimetype: "application/pdf",
      },
    });
    if (sendEmail.error) {
      throw new AppError(400, sendEmail.message);
    }

    // handle recurrent invoice
    if (invoice_type == "RECURRING") {
      await handleRecurrentInvoice({
        invoice_id: invoice._id,
        deposit_address,
        deposit_crypto,
        deposit_network,
        issue_date: moment().tz(tz).format("YYYY-MM-DD"),
        due_date: moment()
          .tz(tz)
          .add(recurring?.due_days * 1, "days")
          .format("YYYY-MM-DD"),
        due_days: recurring?.due_days,
        tz,
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
      { new: true },
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
      { lean: true },
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
