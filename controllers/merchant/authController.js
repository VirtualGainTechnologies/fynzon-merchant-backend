const { sendOtpToEmail } = require("../../utils/sendOtp");
const AppError = require("../../utils/AppError");

exports.sendRegistrationOtp = async (req, res) => {
  const emailObject = {
    type: "register-otp",
    email: req.body.email,
    userName: req.body.userName,
    title: "Registration",
  };
  const emailData = await sendOtpToEmail(emailObject);
  if (emailData.error) {
    throw new AppError(400, emailData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      otpId: emailData?.data.otpId,
      ...req.body,
    },
  });
};

exports.verifyRegistrationOtp = (req, session) => {};
