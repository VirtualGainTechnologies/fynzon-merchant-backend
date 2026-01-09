require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const AppError = require("./AppError");
const {
  getWelcomeRegistartionTemplate,
  getWelcomeLoginTemplate,
  getFailedLoginLockoutEmailTemplate,
  kycCompletionEmailTemplate,
} = require("./emailTemplates");
const { logger } = require("./winstonLogger");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.sendEmail = async (emailData) => {
  try {
    let subject, body;

    switch (emailData?.type) {
      case "registration-success":
        subject = "Fynzon-registration is successful";
        body = await getWelcomeRegistartionTemplate(emailData);
        break;
      case "login-success":
        subject = "Login is successful";
        body = await getWelcomeLoginTemplate(emailData);
        break;

      case "kyc-approved":
        subject = "Your KYC Verification is Complete";
        body = await kycCompletionEmailTemplate(emailData);
        break;
      case "login-lockout":
        subject =
          "Suspicious Activity Detected — Your Fynzon Account Is Temporarily Locked";
        body = await getFailedLoginLockoutEmailTemplate(emailData);
        break;
      default:
        throw new AppError(400, "Invalid email type");
    }

    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL,
      to: emailData?.email,
      subject: subject,
      html: body,
    });

    return {
      message: "Email sent successfully",
      error: false,
      data: null,
    };
  } catch (err) {
    logger.error(
      `error in catch block of sendEmail == > ${JSON.stringify(err)}`
    );
    return {
      message: err.message || "Failed to send email",
      error: false,
      data: null,
    };
  }
};

exports.sendEmailWithAttachment = async (emailData) => {
  try {
    let subject, text;

    switch (emailData?.type) {
      case "invoice-email":
        subject = "Your Invoice";
        text = "Please find the attached document";
        break;

      default:
        throw new AppError(400, "Invalid email type");
    }

    if (!emailData?.file) {
      throw new AppError(400, "Email attachment is required");
    }

    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL,
      to: emailData?.email,
      subject,
      text,
      attachments: [
        {
          content: emailData.file.buffer.toString("base64"),
          filename: emailData.file.originalname,
          type: emailData.file.mimetype,
          disposition: "attachment",
        },
      ],
    });

    return {
      message: "Email sent successfully",
      error: false,
      data: null,
    };
  } catch (err) {
    logger.error(
      `error in catch block of sendEmailWithAttachment ==> ${JSON.stringify(
        err
      )}`
    );
    return {
      message: err.message || "Failed to send email",
      error: true,
      data: null,
    };
  }
};
