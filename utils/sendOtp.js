const otpGenerator = require("otp-generator");
const sgMail = require("@sendgrid/mail");

const AppError = require("./AppError");
const {
  createOtp,
  deleteManyOtp,
  makeHttpsRequestForOtp,
} = require("../services/shared/otpServices");
const { getOtpEmailTemplate } = require("./emailTemplates");
const { logger } = require("./winstonLogger");

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
        subject = `Fynzon-OTP is ${otp} for registeration`;
        break;
      case "login":
        subject = `Fynzon-OTP is ${otp} to login`;
        break;
      case "reset password":
        subject = `Fynzon-OTP is ${otp} to reset password`;
        break;
      case "update profile":
        subject = `Your OTP is ${otp} for updating profile`;
        break;
      case "update password":
        subject = `Fynzon-OTP is ${otp} for updating password`;
        break;
      case "add ip_address":
        subject = `OTP is ${otp} for adding IP address`;
        break;
      case "update-ip":
        subject = `OTP ${otp} for updating IP address`;
        break;
      case "remove-ip":
        subject = `OTP ${otp} for deleting IP address`;
        break;
      default:
        throw new AppError(400, "Invalid email type");
    }

    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL,
      to: emailData.email,
      subject: subject,
      html: body,
    });

    return {
      message: `OTP sent to email`,
      error: false,
      data: {
        otpId: otpRecord._id,
        email: otpRecord.email,
      },
    };
  } catch (err) {
    logger.error(
      `error in catch block of sendOtpEmail == > ${JSON.stringify(err)}`
    );
    return {
      message: err.message || "Failed to send OTP",
      error: true,
      data: null,
    };
  }
};

exports.sendOtpToMobile = async (phoneData) => {
  try {
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await deleteManyOtp({
      phone_code: phoneData.phoneCode,
      phone: phoneData.phone,
    });

    const otpRecord = await createOtp({
      otp: otp,
      phone_code: phoneData?.phoneCode,
      phone: phoneData?.phone,
      date: new Date().getTime(),
    });

    if (!otpRecord) {
      throw new AppError(400, "Failed to create OTP record");
    }

    const mobileNumber = `+${otpRecord.phone_code}${otpRecord.phone}`;
    const result = await makeHttpsRequestForOtp(mobileNumber, otp);

    if (result.status === "success") {
      return {
        message: `OTP sent to mobile`,
        error: false,
        data: {
          otpId: otpRecord._id,
          phoneCode: otpRecord?.phone_code,
          phone: otpRecord?.phone,
        },
      };
    } else {
      throw new AppError(400, "Failed to send OTP");
    }
  } catch (err) {
    logger.error(
      `error in catch block of sendOtpToMobile == > ${JSON.stringify(err)}`
    );
    return {
      message: err.message || "Failed to send otp",
      error: true,
      data: null,
    };
  }
};
