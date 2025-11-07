const { verifyOtp } = require("../../utils/verifyOtp");
const { sendOtpToEmail } = require("../../utils/sendOtp")

exports.sendOtpEmail = async (req, res) => {
    console.log("Hello")
  const req_body = Object.assign({}, req.body);

  const emailObject = {
    type: "register-otp",
    email: req_body.email,
    userName: req_body.userName,
    title: "Registration",
  };
    const emailData = await sendOtpToEmail(emailObject);
  if (emailData.error) {
    throw new AppError(400, emailData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: emailData?.data,
  });
}