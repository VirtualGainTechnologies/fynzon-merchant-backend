const {
  MerchantApiSettingModel,
} = require("../../models/merchant/apisettingmodel");
const {
  MerchantCryptoAddressModel,
} = require("../../models/merchant/cryptoAddressModel");
const { MerchantKycModel } = require("../../models/merchant/kycModel");
const { MerchantModel } = require("../../models/merchant/merchantModel");
const { MerchantWalletModel } = require("../../models/merchant/walletModel");
const AppError = require("../../utils/AppError");
const {
  pvtltdToPrivateLimitedConverter,
} = require("../../utils/pvtltdToPrivateLimitedConverter");
const {
  generateMerchantCryptoAddressData,
} = require("./cryptoAddressServices");
const { merchantWalletData } = require("./walletServices");

exports.createMerchant = (object) => {
  return MerchantModel.create(object);
};

exports.getMerchantById = (id, projections = null, options = {}) => {
  return MerchantModel.findById(id, projections, options);
};

exports.getMerchantByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantModel.findOne(filters, projections, options);
};

exports.getAllMerchantByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantModel.find(filters, projections, options);
};

exports.updateMerchantById = (id, updateObject, options = {}) => {
  return MerchantModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateMerchantByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllMerchantByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantModel.updateMany(filters, updateObject, options);
};

exports.registerMerchant = async (req_body, session) => {
  try {
    //check merchant
    let filter = {
      $or: [
        ...(req_body.email && [{ email: req_body.email }]),
        ...(req_body.phoneCode &&
          req_body.phone && [
            {
              phone_code: req_body.phoneCode,
              phone: req_body.phone,
            },
          ]),
      ],
    };

    if (req_body.category == "ENTITY") {
      filter.$or.push({ business_name: req_body.businessName });
    }

    const merchantDetails = await this.getMerchantByFilter(
      filter,
      "_id email phone business_name",
      {
        lean: true,
      }
    );

    if (merchantDetails) {
      const message =
        merchantDetails.email === req_body.email
          ? "Email is alreday registered"
          : merchantDetails.phone === req_body.phone
          ? "Phone is alreday registered"
          : merchantDetails.business_name === req_body.businessName
          ? "Business name is already taken"
          : "Already registered";

      throw new AppError(400, message);
    }

    // create user instance
    let merchantInstance = new MerchantModel({
      merchant_type: req_body.category,
      full_name: req_body.fullName || "",
      profession: req_body.profession || "",
      business_name:
        pvtltdToPrivateLimitedConverter(req_body?.businessName) || "",
      business_category: req_body.businessCategory || "",
      email: req_body.email,
      phone_code: req_body.phoneCode,
      phone: req_body.phone,
      get_updates_on_whatsapp: req_body.whatsAppUpdates,
      password: req_body.password,
      last_login_ip: req_body.ipAddress,
      last_login_location: req_body.locationDetails,
      last_login_date: new Date().getTime(),
    });

    //generate JWT token
    merchantInstance.generateAuthToken();

    // create kyc instance
    const kycInstance = new MerchantKycModel({
      merchant_id: merchantInstance._id,
      email: merchantInstance.email,
      merchant_type: merchantInstance.merchant_type,
    });

    // create wallet instance
    const walletData = await merchantWalletData();
    if (walletData.error) throw new AppError(400, walletData.message);
    const walletInstance = new MerchantWalletModel({
      merchant_id: merchantInstance._id,
      email: merchantInstance.email,
      ...walletData.data,
    });

    // create merchant developer instance
    const apiSettingInstance = new MerchantApiSettingModel({
      merchant_id: merchantInstance._id,
      email: merchantInstance.email,
    });

    // create crypto address instance
    const cryptoAddressData = await generateMerchantCryptoAddressData();
    if (cryptoAddressData.error)
      throw new AppError(400, "Failed to generate crypto address");
    const cryptoAddressInstance = new MerchantCryptoAddressModel({
      merchant_id: merchantInstance._id,
      email: merchantInstance.email,
      ...cryptoAddressData.data,
    });

    // update merchant instance
    merchantInstance.kyc_id = kycInstance._id;
    merchantInstance.wallet_id = walletInstance._id;
    merchantInstance.api_setting_id = apiSettingInstance._id;
    merchantInstance.crypto_address_id = cryptoAddressInstance._id;

    // save all documents
    const merchantRes = await merchantInstance.save({ session });
    const kycRes = await kycInstance.save({ session });
    const walletRes = await walletInstance.save({ session });
    const cryptoAddressRes = await cryptoAddressInstance.save({ session });
    const apiSettingRes = await apiSettingInstance.save({
      session,
    });

    if (!cryptoAddressRes) {
      throw new AppError(400, "Error in creating merchant crypto address");
    }

    if (!apiSettingRes) {
      throw new AppError(400, "Error in creating merchant developer");
    }
    if (!merchantRes) {
      throw new AppError(400, "Error in creating merchant");
    }

    if (!kycRes) {
      throw new AppError(400, "Error in creating KYC");
    }

    if (!walletRes) {
      throw new AppError(400, "Error in creating wallet");
    }

    return {
      message: "Registration successfull",
      error: false,
      data: merchantRes,
    };
  } catch (err) {
    return {
      message: err?.message || "Error in registering merchant",
      error: true,
      data: null,
    };
  }
};

exports.getAllMerchantDetails = (options) => {
  const { email, businessName, fullName, page = 0, limit = 10 } = options;

  const filter = {
    ...(email && {
      email: { $regex: email, $options: "i" },
    }),
    ...(businessName && {
      business_name: { $regex: businessName, $options: "i" },
    }),
    ...(fullName && {
      full_name: { $regex: fullName, $options: "i" },
    }),
  };

  return MerchantModel.aggregate([
    { $match: filter },
    {
      $facet: {
        data: [
          { $skip: page * Number(limit) },
          { $limit: Number(limit) },
          {
            $lookup: {
              from: "api-settings",
              localField: "api_setting_id",
              foreignField: "_id",
              as: "api_setting_id",
            },
          },
          {
            $unwind: {
              path: "$api_setting_id",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              merchant_type: 1,
              email: 1,
              business_name: 1,
              business_category: 1,
              full_name: 1,
              profession: 1,
              phone_code: 1,
              phone: 1,
              is_blocked: 1,
              createdAt: 1,
              api_setting_id: {
                test_ip: 1,
                live_ip: 1,
                test_api_key: 1,
                live_api_key: 1,
              },
            },
          },
        ],
        totalRecords: [{ $count: "count" }],
      },
    },
  ]).allowDiskUse(true);
};
