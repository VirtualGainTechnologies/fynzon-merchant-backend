const mongoose = require("mongoose");

const {
  getOtpById,
  deleteAllOtpByFilter,
} = require("../services/shared/otpServices");

exports.verifyOtp = async (id, otp) => {
  try {
    const otpRecordId = mongoose.Types.ObjectId.createFromHexString(id);

    let date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    const time = date.getTime();

    const otpRecord = await getOtpById(
      otpRecordId,
      "_id email otp phone phone_code date",
      {
        lean: true,
      }
    );

    if (!otpRecord || otpRecord.date < time || otpRecord.otp !== otp) {
      return {
        message: otpRecord?.date < time ? "OTP expired" : "Invalid OTP",
        error: true,
        data: null,
      };
    }

    const filter = {
      ...(otpRecord.email && {
        email: otpRecord.email,
      }),
      ...(otpRecord.phone && {
        phone: otpRecord.phone,
      }),
    };

    // delete otp
    await deleteAllOtpByFilter(filter);

    return {
      message: "OTP verified successfully",
      error: false,
      data: otpRecord,
    };
  } catch (err) {
    return {
      message: err.message || "OTP Verification Failed",
      error: true,
      data: null,
    };
  }
};
