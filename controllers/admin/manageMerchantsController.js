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
const {
  updateApiSettingById,
} = require("../../services/merchant/apiSettingService");

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
      totalRecords: totalRecords[0].count,
      result: data,
    },
  });
};


exports.updateMerchantData = async (req, session) => {
  const { merchantStatus, ips, apiKeys } = req.body;

  // update user data
  const updatedMerchantData = await updateMerchantById(
    new mongoose.Types.ObjectId(req.params?.merchantId),
    {
      ...(merchantStatus && {
        is_blocked: merchantStatus == "ACTIVE" ? false : true,
      }),
    },
    {
      new: true,
      session,
    }
  );
  if (!updatedMerchantData) {
    throw new AppError(400, "Failed to update merchant data");
  }

  // update api setting
  let updateData = {
    $set: {},
  };
  let arrayFilters = [];

  // update ips
  if (ips && ips.length) {
    ips.forEach((x, i) => {
      const { mode, ip, status } = x;
      const ipField = `${mode.toLowerCase()}_ip`;

      // array filters
      arrayFilters.push({
        [`elem${i}.ip_address`]: ip,
      });

      updateData.$set[`${ipField}.$[elem${i}].status`] = status;
    });
  }

  // update API keys
  if (apiKeys && apiKeys.length) {
    apiKeys.forEach((x) => {
      const { mode, status } = x;
      updateData.$set[`${mode.toLowerCase()}_api_key.status`] = status;
    });
  }

  const updatedMerchantApiSetting = await updateApiSettingById(
    updatedMerchantData.api_setting_id,
    updateData,
    {
      new: true,
      session,
      runValidators: true,
      ...(arrayFilters.length && { arrayFilters }),
    } 
  );
  if (!updatedMerchantApiSetting) {
    throw new AppError(400, "Failed to update merchant api setting");
  }
  return {
    message: "Merchant data updated successfully",
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
      api_setting_id: {
        _id: updatedMerchantApiSetting._id,
        test_ip: updatedMerchantApiSetting.test_ip,
        live_ip: updatedMerchantApiSetting.live_ip,
        test_api_key: updatedMerchantApiSetting.test_api_key,
        live_api_key: updatedMerchantApiSetting.live_api_key,
      },
    },
  };
};
