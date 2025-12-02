const { MerchantWalletModel } = require("../../models/merchant/walletModel");

exports.getMerchantWalletByFilter = (
  filter = {},
  projection = null,
  options = {}
) => {
  return MerchantWalletModel.findOne(filter, projection, options);
};

exports.updateMerchantWalletByFilter = (
  filter = {},
  updatedObj = {},
  options = {}
) => {
  return MerchantWalletModel.findOneAndUpdate(filter, updatedObj, options);
};
