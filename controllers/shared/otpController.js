const AppError = require("../../utils/AppError");
const { sendOtpToMobile, sendOtpToEmail } = require("../../utils/sendOtp");

exports.resendOtp = async (req, res) => {
  const req_body = Object.assign({}, req.body);

  console.log("req_body", req_body);

  // send otp
  let response = {
    message: "Failed to send OTP",
    error: true,
    data: null,
  };

  if (req_body.mode === "PHONE") {
    const mobileData = await sendOtpToMobile({
      phoneCode: req_body.phoneCode,
      phone: req_body.phone,
    });

    if (mobileData.error) {
      throw new AppError(400, mobileData.message);
    }

    response = {
      message: `OTP sent to phone number`,
      error: false,
      data: mobileData?.data,
    };
  }

  if (req_body.mode === "EMAIL") {
    const emailObject = {
      type: req_body.type,
      email: req_body.email,
      userName: req_body.userName,
      title: req_body.title,
    };

    const emailData = await sendOtpToEmail(emailObject);

    if (emailData.error) {
      throw new AppError(400, emailData.message);
    }

    response = {
      message: `OTP sent to email`,
      error: false,
      data: emailData?.data,
    };
  }

  res.status(response.error === true ? 400 : 200).json(response);
};
