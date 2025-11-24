const { MerchantKycModel } = require("../../models/merchant/kycModel");

exports.createMerchantKyc = (object) => {
  return MerchantKycModel.create(object);
};

exports.getMerchantKycById = (id, projections = null, options = {}) => {
  return MerchantKycModel.findById(id, projections, options);
};

exports.getMerchantKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantKycModel.findOne(filters, projections, options);
};

exports.getAllMerchantKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantKycModel.find(filters, projections, options);
};

exports.updateMerchantKycById = (id, updateObject, options = {}) => {
  return MerchantKycModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateMerchantKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllMerchantKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.updateMany(filters, updateObject, options);
};
