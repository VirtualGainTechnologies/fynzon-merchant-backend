const mongoose = require("mongoose");

const {
  getAllMerchantKycByFilter,
} = require("../../services/merchant/kycServices");
const {
  getAllMerchantByFilter,
  updateMerchantById,
  getAllMerchantDetails,
} = require("../../services/merchant/authServices");
const AppError = require("../../utils/AppError");

exports.getMerchantKYCData = async (req, res) => {
  if (req.role !== "SUPER-ADMIN") {
    throw new AppError(400, "Access Denied");
  }

  const kycData = await getAllMerchantKycByFilter(req.query);
  if (!kycData) {
    throw new AppError(400, "Failed to get users KYC data");
  }
  const [{ data, totalRecords }] = kycData;
  res.status(200).json({
    message: "Users KYC data fetched successfully",
    error: false,
    data: {
      totalRecords: totalRecords[0]?.count,
      result: data,
    },
  });
};

exports.getAllMerchant = async (req, res) => {
  const response = await getAllMerchantDetails(req.query);
  if (!response) {
    throw new AppError(400, "Failed to get merchants");
  }
  const [{ data, totalRecords }] = response;
  res.status(200).json({
    message: "Merchants data fetched successfully",
    error: false,
    data: {
      totalRecords,
      result: data,
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
