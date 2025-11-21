const mongoose = require("mongoose");
const { getAllMerchantKycByFilter } = require("../../services/merchant/kycServices");

const {
  getAllMerchantByFilter,
  updateMerchantById,
} = require("../../services/merchant/authServices");
const AppError = require("../../utils/AppError");

exports.getMerchantKYCData = async (req, res) => {
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
  const users = await getAllMerchantByFilter(
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
      user_api_setting_id: 1,
    },
    {
      populate: {
        path: "user_api_setting_id",
        select: "test_ip live_ip test_api_key live_api_key",
      },
      lean: true,
    }
  );

  if (!users) {
    throw new AppError(400, "Failed to get users");
  }

  res.status(200).json({
    message: "Users data fetched successfully",
    error: false,
    data: {
      totalRecords: users.length,
      result: users,
    },
  });
};

exports.updateMerchantData = async (req, session) => {
  const { merchantStatus, liveOnboardingEnabled, ips, apiKeys } = req.body;

  // update Merchant data
  const updatedMerchantData = await updateMerchantById(
    new mongoose.Types.ObjectId(req.params?.merchantId),
    {
      ...(merchantStatus && {
        is_blocked: merchantStatus == "ACTIVE" ? false : true,
      }),
      ...(liveOnboardingEnabled && {
        live_onboarding_enabled: liveOnboardingEnabled,
      }),
    },
    {
      new: true,
      session,
    }
  );
  if (!updatedMerchantData) {
    throw new AppError(400, "Failed to update Merchnat data");
  }

  // update api setting
    let updateData = { $set: {} };
    let arrayFilters = [];

  // update ips
  if (ips && ips.length) {
    ips.forEach((x, i) => {
        const { mode, ip, status } = x;
        const ipField = `${mode.toLowerCase()}_ip`;

      // array filters
        arrayFilters.push({ [`elem${i}.ip_address`]: ip });
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

  return {
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
      live_onboarding_enabled: updatedMerchantData.live_onboarding_enabled,
      is_blocked: updatedMerchantData.is_blocked,
      createdAt: updatedMerchantData.createdAt,
    }
  };
}
