const { UserKycModel } = require("../../models/user/userKycModel");

exports.createUserKyc = (object) => {
  return UserKycModel.create(object);
};

exports.getUserKycById = (id, projections = null, options = {}) => {
  return UserKycModel.findById(id, projections, options);
};

exports.getUserKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return UserKycModel.findOne(filters, projections, options);
};

exports.getAllUserKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return UserKycModel.find(filters, projections, options);
};

exports.updateUserKycById = (id, updateObject, options = {}) => {
  return UserKycModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateUserKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return UserKycModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllUserKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return UserKycModel.updateMany(filters, updateObject, options);
};
