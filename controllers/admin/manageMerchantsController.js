const mongoose = require("mongoose");

const {
  getAllMerchantKycByFilter,
} = require("../../services/merchant/kycServices");
const {
  getAllMerchantByFilter,
  updateMerchantById,
} = require("../../services/merchant/authServices");
const AppError = require("../../utils/AppError");

exports.getMerchantKYCData = async (req, res) => {
  const { email, businessName, fullName } = req.query;
  
  if (req.role !== "SUPER-ADMIN") {
    throw new AppError(400, "Access Denied");
  }

  const kycData = await getAllMerchantKycByFilter();
  if (!kycData) {
    throw new AppError(400, "Failed to get users KYC data");
  }
  res.status(200).json({
    message: "Users KYC data fetched successfully",
    error: false,
    data: {
      totalRecords: kycData.length,
      result: kycData,
    },
  });
};

exports.getAllMerchant = async (req, res) => {
  const merchants = await getAllMerchantByFilter(
    {},
    {
      merchant_type: 1,
      email: 1,
      business_name: 1,
      business_category: 1,
      full_name: 1,
      profession: 1,
      phone_code: 1,
      phone: 1,
      live_onboarding_enabled: 1,
      is_blocked: 1,
      createdAt: 1,
    },
    {
      lean: true,
    }
  );

  if (!merchants) {
    throw new AppError(400, "Failed to get merchants");
  }

  res.status(200).json({
    message: "Merchants data fetched successfully",
    error: false,
    data: {
      totalRecords: merchants.length,
      result: merchants,
    },
  });
};

exports.updateMerchantData = async (req, res) => {
  const { merchantStatus } = req.body;
  const updatedMerchantData = await updateMerchantById(
    new mongoose.Types.ObjectId(req.params?.merchantId),
    {
      ...(merchantStatus && {
        is_blocked: merchantStatus == "ACTIVE" ? false : true,
      }),
    },
    {
      new: true,
    }
  );
  if (!updatedMerchantData) {
    throw new AppError(400, "Failed to update Merchnat data");
  }

  res.status(200).json({
    message: "Users data updated successfully",
    error: false,
    data: {
      _id: updatedMerchantData._id,
      merchant_type: updatedMerchantData.merchant_type,
      email: updatedMerchantData.email,
      business_name: updatedMerchantData.business_name,
      business_category: updatedMerchantData.business_category,
      full_name: updatedMerchantData.full_name,
      profession: updatedMerchantData.profession,
      phone_code: updatedMerchantData.phone_code,
      phone: updatedMerchantData.phone,
      is_blocked: updatedMerchantData.is_blocked,
      createdAt: updatedMerchantData.createdAt,
    },
  });
};
