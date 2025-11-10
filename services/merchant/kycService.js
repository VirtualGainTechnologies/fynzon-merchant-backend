const { MerchantKycModel } = require("../../models/merchant/kycModel");

exports.createKyc = (object) => {
  return MerchantKycModel.create(object);
};

exports.getKycById = (id, projections = null, options = {}) => {
  return MerchantKycModel.findById(id, projections, options);
};

exports.getKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantKycModel.findOne(filters, projections, options);
};

exports.getAllKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantKycModel.find(filters, projections, options);
};

exports.updateKycById = (id, updateObject, options = {}) => {
  return MerchantKycModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.updateMany(filters, updateObject, options);
};
