const https = require("https");
const queryString = require("querystring");

const { OtpModel } = require("../../models/shared/otpModel");

exports.createOtp = (object) => {
  return OtpModel.create(object);
};

exports.getOtpById = (id, projections = null, options = {}) => {
  return OtpModel.findById(id, projections, options);
};

exports.getOtpByFilter = (filters = {}, projections = null, options = {}) => {
  return OtpModel.findOne(filters, projections, options);
};

exports.getAllOtpByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return OtpModel.find(filters, projections, options);
};

exports.updateOtpById = (id, updateObject = {}, options = {}) => {
  return OtpModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateOtpByFilter = (filters = {}, updateObject = {}, options = {}) => {
  return OtpModel.findOneAndUpdate(filters, updateObject, options);
};

exports.deleteOtpById = () => {
  return OtpModel.indByIdAndDelete(id);
};

exports.deleteAllOtpByFilter = (filters = {}) => {
  return OtpModel.deleteMany(filters);
};

exports.deleteManyOtp = (filter = {}) => {
  return OtpModel.deleteMany(filter);
};
