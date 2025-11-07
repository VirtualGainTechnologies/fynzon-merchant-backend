const {
  UserApiSettingModel,
} = require("../../models/user/userApiSettingModel");
const { UserKycModel } = require("../../models/user/userKycModel");
const { UserModel } = require("../../models/user/userModel");
const { UserWalletModel } = require("../../models/user/userWalletModel");
const AppError = require("../../utils/AppError");
const {
  pvtltdToPrivateLimitedConverter,
} = require("../../utils/pvtltdToPrivateLimitedConverter");

exports.createUser = (object) => {
  return UserModel.create(object);
};

exports.getUserById = (id, projections = null, options = {}) => {
  return UserModel.findById(id, projections, options);
};

exports.getUserByFilter = (filters = {}, projections = null, options = {}) => {
  return UserModel.findOne(filters, projections, options);
};

exports.getAllUserByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return UserModel.find(filters, projections, options);
};

exports.updateUserById = (id, updateObject, options = {}) => {
  return UserModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateUserByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return UserModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllUserByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return UserModel.updateMany(filters, updateObject, options);
};

exports.registerUser = async (req_body, session) => {
  try {
    //chekc merchant
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

    const userDetails = await this.getUserByFilter(
      filter,
      "_id email phone business_name",
      {
        lean: true,
      }
    );

    if (userDetails) {
      const message =
        userDetails.email === req_body.email
          ? "Email is alreday registered"
          : userDetails.phone === req_body.phone
          ? "Phone is alreday registered"
          : userDetails.business_name === req_body.businessName
          ? "Business name is already taken"
          : "Already registered";

      throw new AppError(400, message);
    }

    // create user instance
    let userInstance = new UserModel({
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
    userInstance.generateAuthToken();

    // create kyc instance
    const kycInstance = new UserKycModel({
      user_id: userInstance._id,
      email: userInstance.email,
      user_type: userInstance.merchant_type,
    });

    // create user developer instance
    const userApiSettingInstance = new UserApiSettingModel({
      user_id: userInstance._id,
      email: userInstance.email,
    });

    // create wallet instance
    const walletInstance = new UserWalletModel({
      user_id: userInstance._id,
      email: userInstance.email,
    });

    //update user instance
    userInstance.user_kyc_id = kycInstance._id;
    userInstance.user_wallet_id = walletInstance._id;
    userInstance.user_api_setting_id = userApiSettingInstance._id;

    // save all documents
    const userRes = await userInstance.save({ session });
    const kycRes = await kycInstance.save({ session });
    const walletRes = await walletInstance.save({ session });
    const apiSettingInstance = await userApiSettingInstance.save({ session });

    if (!apiSettingInstance) {
      throw new AppError(400, "Error in creating user developer");
    }

    if (!userRes) {
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
      data: userRes,
    };
  } catch (err) {
    return {
      message: err.message,
      error: true,
      data: null,
    };
  }
};
