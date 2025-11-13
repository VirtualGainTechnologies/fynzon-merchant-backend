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
