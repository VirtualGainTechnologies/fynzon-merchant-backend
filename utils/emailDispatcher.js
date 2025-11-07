require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const AppError = require("./AppError");
const {
  getWelcomeRegistartionTemplate,
  getWelcomeLoginTemplate,
  getPasswordResetSuccessTemplate,
  getFailedLoginLockoutEmailTemplate,
} = require("./emailTemplates");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.sendEmail = async (emailData) => {
  try {
    let subject, body;

    switch (emailData?.type) {
      case "registration-success":
        subject = "Pezon-registration is successful";
        body = await getWelcomeRegistartionTemplate(emailData);
        break;
      case "login-success":
        subject = "Welcome back to Pezon!";
        body = await getWelcomeLoginTemplate(emailData);
        break;
      case "reset-password-success":
        subject = "Security Alert: Password Changed on Your Pezon Account";
        body = await getPasswordResetSuccessTemplate(emailData);
        break;
      case "login-lockout":
        subject =
          "Suspicious Activity Detected — Your Pezon Account Is Temporarily Locked";
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
    console.log("error in catch block of sendEmail", err);
    return {
      message: err.message || "Failed to send email",
      error: false,
      data: null,
    };
  }
};
