const AppError = require("../../utils/AppError");
const { sendOtpToEmail, sendOtpToMobile } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");
const {
  getMerchantByFilter,
  updateMerchantById,
} = require("../../services/merchant/authServices");
const {
  updateMerchantKycByFilter,
  getMerchantKycByFilter,
} = require("../../services/merchant/kycServices");
const {
  updateMerchantWalletByFilter,
} = require("../../services/merchant/walletServices");

// upadte mobile number
exports.sendEmailOtpForMobileChange = async (req, res) => {
  const otpData = await sendOtpToEmail({
    type: "update profile",
    email: req.email,
  });
  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: otpData?.data,
  });
};

exports.verifyEmailOtpForMobileChange = async (req, res) => {
  const req_body = { ...req.body };

  // verify email otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message);
  }

  res.status(200).json({
    message: verifiedOtp.message,
    error: false,
    data: null,
  });
};

exports.sendMobileOtpForMobileChange = async (req, res) => {
  const req_body = { ...req.body };

  // check phone number already exist or not
  const isPhoneExist = await getMerchantByFilter(
    { phone: req_body.phone },
    "_id",
    {
      lean: true,
    }
  );
  if (isPhoneExist) {
    throw new AppError(
      400,
      "This phone number already exists. Please try a different one."
    );
  }

  // send otp to mobile
  const otpData = await sendOtpToMobile({
    phoneCode: req_body.phoneCode,
    phone: req_body.phone,
  });
  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to phone number`,
    error: false,
    data: otpData?.data,
  });
};

exports.changeMobileNumber = async (req, session) => {
  const req_body = { ...req.body };

  // verify mobile otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message);
  }

  // upadte mobile
  const updatedMerchant = await updateMerchantById(
    req.merchantId,
    {
      phone_code: req_body.phoneCode,
      phone: req_body.phone,
    },
    { new: true, session }
  );

  if (!updatedMerchant) {
    throw new AppError(400, "Error in updating phone number");
  }

  let kycStatus = req.kycStatus;
  if (updatedMerchant.merchant_type === "INDIVIDUAL") {
    // update kyc
    const updateAaadharObj = {
      "aadhaar.front_image": "",
      "aadhaar.back_image": "",
      "aadhaar.name": "",
      "aadhaar.parent_name": "",
      "aadhaar.birth_date": "",
      "aadhaar.issue_date": "",
      "aadhaar.expiry_date": "",
      "aadhaar.aadhaar_number": "",
      "aadhaar.gender": "",
      "aadhaar.address.address_line": "",
      "aadhaar.address.city": "",
      "aadhaar.address.district": "",
      "aadhaar.address.state": "",
      "aadhaar.address.country": "",
      "aadhaar.address.pin_code": "",
      "aadhaar.status": "PENDING",
      "aadhaar.isAadhaarVerified": false,
    };

    const updatePanObj = {
      "pan.type_of_holder": "",
      "pan.pan_image": "",
      "pan.name": "",
      "pan.parent_name": "",
      "pan.birth_date": "",
      "pan.issue_date": "",
      "pan.expiry_date": "",
      "pan.pan_number": "",
      "pan.gender": "",
      "pan.address.address_line": "",
      "pan.address.city": "",
      "pan.address.district": "",
      "pan.address.state": "",
      "pan.address.country": "",
      "pan.address.pin_code": "",
      "pan.status": "PENDING",
      "pan.isPanVerified": false,
    };

    const updateBankObj = {
      "bank.bank_name": "",
      "bank.ifsc": "",
      "bank.account_number": "",
      "bank.account_type": "",
      "bank.testTransferRRN": "",
      "bank.status": "PENDING",
      "bank.isBankVerified": false,
    };

    const updateSelfieObj = {
      "selfie.selfie_image": "",
      "selfie.status": "PENDING",
      "selfie.isSelfieVerified": false,
    };

    const updatedKyc = await updateMerchantKycByFilter(
      { merchant_id: req.merchantId },
      {
        ...updateAaadharObj,
        ...updatePanObj,
        ...updateBankObj,
        ...updateSelfieObj,
        kyc_status: "PENDING",
      },
      { new: true, session }
    );

    if (!updatedKyc) {
      throw new AppError(400, "Failed to update KYC");
    }
    kycStatus = updatedKyc.kyc_status;
  }

  const response = {
    merchantType: updatedMerchant.merchant_type,
    businessName: updatedMerchant.business_name,
    businessCategory: updatedMerchant.business_category,
    fullName: updatedMerchant.full_name,
    profession: updatedMerchant.profession,
    email: updatedMerchant.email,
    phoneCode: updatedMerchant.phone_code,
    phone: updatedMerchant.phone,
    kycStatus,
    onboardingMode: updatedMerchant.onboarding_mode,
  };

  return {
    message: "Phone number updated successfully",
    error: false,
    data: response,
  };
};

// update email id
exports.sendMobileOtpForEmailChange = async (req, res) => {
  const otpData = await sendOtpToMobile({
    phoneCode: req.phoneCode,
    phone: req.phone,
  });
  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to phone number`,
    error: false,
    data: otpData?.data,
  });
};

exports.verifyMobileOtpForEmailChange = async (req, res) => {
  const req_body = { ...req.body };

  // verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message);
  }

  res.status(200).json({
    message: verifiedOtp.message,
    error: false,
    data: null,
  });
};

exports.sendEmailOtpForEmailChange = async (req, res) => {
  const req_body = { ...req.body };

  // check email already exist or not
  const isEmailExist = await getMerchantByFilter(
    { email: req_body.email },
    "_id merchant_type full_name phone",
    {
      lean: true,
    }
  );

  if (isEmailExist) {
    throw new AppError(
      400,
      "This email already exists. Please try a different one."
    );
  }

  const otpData = await sendOtpToEmail({
    type: "update profile",
    email: req_body.email,
  });
  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: otpData?.data,
  });
};

exports.changeEmailId = async (req, session) => {
  const req_body = { ...req.body };

  // verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message);
  }

  // upadte merchant
  const updatedMerchant = await updateMerchantById(
    req.merchantId,
    {
      email: req_body.email,
    },
    { new: true, session }
  );

  if (!updatedMerchant) {
    throw new AppError(400, "Failed to update email");
  }

  // update wallet
  const updatedWallet = await updateMerchantWalletByFilter(
    {
      merchant_id: req.merchantId,
    },
    { email: req_body.email },
    { new: true, session }
  );

  if (!updatedWallet) {
    throw new AppError(400, "Failed to update wallet");
  }

  // update kyc
  const updatedKyc = await updateMerchantKycByFilter(
    {
      merchant_id: req.merchantId,
    },
    { email: req_body.email },
    { new: true, session }
  );

  if (!updatedKyc) {
    throw new AppError(400, "Failed to update Kyc");
  }

  return {
    message: "Email updated successfully",
    error: false,
    data: {
      merchantType: updatedMerchant.merchant_type,
      businessName: updatedMerchant.business_name,
      businessCategory: updatedMerchant.business_category,
      fullName: updatedMerchant.full_name,
      profession: updatedMerchant.profession,
      email: updatedMerchant.email,
      phoneCode: updatedMerchant.phone_code,
      phone: updatedMerchant.phone,
      kycStatus: req.kycStatus,
      onboardingMode: updatedMerchant.onboarding_mode,
    },
  };
};

// update password
exports.sendOtpToChangePassword = async (req, res) => {
  const req_body = { ...req.body };

  // check current password is correct or not
  const merchantData = await getMerchantByFilter(
    { email: req.email },
    "_id password ",
    {}
  );

  if (!merchantData) {
    throw new AppError(400, "Unauthorized!!");
  }

  const isPasswordMatched = await merchantData.comparePassword(
    req_body.currentPassword
  );

  if (!isPasswordMatched) {
    throw new AppError(400, "The current password you entered is incorrect");
  }

  // check if current password and new password is same
  if (req_body.newPassword === req_body.currentPassword) {
    throw new AppError(
      400,
      "This current password and new password is same. Please choose a different one."
    );
  }

  // send otp to email
  const otpData = await sendOtpToEmail({
    type: "update password",
    email: req.email,
  });

  if (otpData.error) {
    throw new AppError(400, otpData.message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      ...otpData?.data,
      ...req_body,
    },
  });
};

exports.updatePassword = async (req, res) => {
  const req_body = { ...req.body };

  // verify email otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message);
  }

  // change password
  const merchantData = await getMerchantByFilter(
    { email: req.email },
    "email password loginCount",
    {}
  );

  if (!merchantData) {
    throw new AppError(400, "Unauthorized!!");
  }

  merchantData.password = req_body.newPassword;
  const updatedPassword = await merchantData.save();
  if (!updatedPassword) {
    throw new AppError(400, "Failed to change password");
  }

  res.status(200).json({
    message: `Password updated successfully`,
    error: false,
    data: null,
  });
};

// get account data
exports.getAccountData = async (req, res) => {
  const kycData = await getMerchantKycByFilter(
    {
      merchant_id: req.merchantId,
    },
    "aadhaar pan bank gstin selfie kyc_status",
    { lean: true }
  );
  if (!kycData) {
    throw new AppError(400, "Failed to get kyc details");
  }

  const kycDetails = {
    aadhaar: {
      registeredName: kycData.aadhaar?.name || "N/A",
      aadhaarNumber: kycData.aadhaar?.aadhaar_number || "N/A",
      dateOfBirth: kycData.aadhaar?.birth_date || "N/A",
      registeredAddress: kycData.aadhaar?.address?.address_line
        ? `${kycData.aadhaar?.address?.address_line} ${kycData.aadhaar?.address?.city} ${kycData.aadhaar?.address?.district} ${kycData.aadhaar?.address?.state} ${kycData.aadhaar?.address?.country} pin-${kycData.aadhaar?.address?.pin_code}`
        : "N/A",
      frontImage: kycData.aadhaar?.front_image?.split("/")[3] || "N/A",
      backImage: kycData.aadhaar?.back_image?.split("/")[3] || "N/A",
      status: kycData.aadhaar?.status || "PENDING",
      kycStatus: kycData.kyc_status || "PENDING",
    },
    pan: {
      registeredName: kycData.pan?.name || "N/A",
      panNumber: kycData.pan?.pan_number || "N/A",
      typeOfHolder: kycData.pan?.type_of_holder || "N/A",
      dateOfBirth: kycData.pan?.birth_date || "N/A",
      registeredAddress: kycData.pan?.address?.addres_line
        ? `${kycData.pan?.address?.address_line} ${kycData.pan?.address?.city} ${kycData.pan?.address?.district} ${kycData.pan?.address?.state} ${kycData.pan?.address?.country} pin-${kycData.pan?.address?.pin_code}`
        : "N/A",
      panImage: kycData.pan?.pan_image?.split("/")[3] || "N/A",
      status: kycData.pan?.status || "PENDING",
      kycStatus: kycData.kyc_status || "PENDING",
    },
    gst: {
      gstinNumber: kycData.gstin?.gstin_number || "N/A",
      businessName: kycData.gstin?.legal_name_of_business
        ? kycData.gstin?.legal_name_of_business
        : kycData.gstin?.trade_name_of_business
        ? kycData.gstin?.trade_name_of_business
        : "N/A",
      businessType: kycData.gstin?.nature_of_business_activities
        ? kycData.gstin?.nature_of_business_activities.join(",")
        : "N/A",
      registeredAddress: kycData.gstin?.address?.address_line
        ? `${kycData.gstin?.address?.address_line} ${kycData.gstin?.address?.city} ${kycData.gstin?.address?.district} ${kycData.gstin?.address?.state} ${kycData.gstin?.address?.country} pin-${kycData.gstin?.address?.pin_code}`
        : "N/A",
      status: kycData.gstin?.status || "PENDING",
      kycStatus: kycData.kyc_status || "PENDING",
    },
    bank: {
      bankName: kycData.bank?.bank_name || "N/A",
      branch: kycData.bank?.branch || "N/A",
      ifscCode: kycData.bank?.ifsc || "",
      accountNumber: kycData.bank?.account_number || "",
      accountType: kycData.bank?.account_type || "N/A",
      registeredAddress: kycData.bank?.address?.address_line
        ? `${kycData.bank?.address?.address_line} ${kycData.bank?.address?.city} ${kycData.bank?.address?.district} ${kycData.bank?.address?.state} ${kycData.bank?.address?.country} pin-${kycData.bank?.address?.pin_code}`
        : "N/A",
      chequeImage: kycData.bank?.cancelled_cheque_image?.split("/")[3] || "N/A",
      status: kycData.bank?.status || "PENDING",
      kycStatus: kycData.kyc_status || "PENDING",
    },
    selfie: {
      selfieImage: kycData.selfie?.selfie_image || "",
      status: kycData.selfie?.status || "PENDING",
      kycStatus: kycData.kyc_status || "PENDING",
    },
    kycStatus: kycData.kyc_status || "PENDING",
  };

  res.status(200).json({
    message: "Data fetched successfully",
    error: false,
    data: kycDetails,
  });
};
