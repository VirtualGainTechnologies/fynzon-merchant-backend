const {
  MerchantApiSettingModel,
} = require("../../models/merchant/apisettingmodel"); 

exports.createApiSetting = (object) => {
  return MerchantApiSettingModel.create(object);
};

exports.getApiSettingById = (id, projections = null, options = {}) => {
  return MerchantApiSettingModel.findById(id, projections, options);
};

exports.getApiSettingByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantApiSettingModel.findOne(filters, projections, options);
};

exports.getAllApiSettingByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantApiSettingModel.find(filters, projections, options);
};

exports.updateApiSettingById = (id, updateObject = {}, options = {}) => {
  return MerchantApiSettingModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateApiSettingByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantApiSettingModel.findOneAndUpdate(filters, updateObject, options);
};

exports.bulkUpdateApiSetting = (updateOperations = []) => {
  return MerchantApiSettingModel.bulkWrite(updateOperations);
};

exports.deleteApiSettingById = (id, options = {}) => {
  return MerchantApiSettingModel.findByIdAndDelete(id, options);
};
