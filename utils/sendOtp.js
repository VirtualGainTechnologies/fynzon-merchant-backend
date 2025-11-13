const otpGenerator = require("otp-generator");
const sgMail = require("@sendgrid/mail");

const AppError = require("./AppError");
const { createOtp, deleteManyOtp } = require("../services/shared/otpServices");
const { getOtpEmailTemplate } = require("./emailTemplates");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendOtpToEmail = async (emailData) => {
  try {
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await deleteManyOtp({ email: emailData?.email });

    const otpRecord = await createOtp({
      otp: otp,
      email: emailData?.email,
      date: new Date().getTime(),
    });

    if (!otpRecord) {
      throw new AppError(400, "Failed to create OTP record");
    }

    let subject;
    let body = await getOtpEmailTemplate({ ...emailData, otp });

    switch (emailData?.type) {
      case "register":
        subject = `OTP to register in fynzon is ${otp}`;
        break;
      case "login":
        subject = `OTP to login in fynzon is ${otp}`;
        break;
      case "reset password":
        subject = `OTP to reset password in fynzon is ${otp}`;
        break;
      default:
        throw new AppError(400, "Invalid email type");
    }

    // await sgMail.send({
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   to: emailData.email,
    //   subject: subject,
    //   html: body,
    // });

    return {
      message: `OTP sent to email`,
      error: false,
      data: {
        otpId: otpRecord._id,
        email: otpRecord.email,
      },
    };
  } catch (err) {
    console.log("error in catch block of sendOtpEmail", err);
    return {
      message: err.message || "Failed to send OTP",
      error: true,
      data: null,
    };
  }
};
