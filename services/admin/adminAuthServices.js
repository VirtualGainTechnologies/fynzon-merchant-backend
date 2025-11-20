const { AdminModel } = require("../../models/admin/adminModel");

exports.createAdmin = (data) => {
  return AdminModel.create(data);
};
exports.getAdminByFilter = (filter = {}, projections = null, options = {}) => {
  return AdminModel.findOne(filter, projections, options);
};
exports.updateAdminById = (id, updateObject = {}, options = {}) => {
  return AdminModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateAdminByFilter = (
  filter = {},
  updateObject = {},
  options = {}
) => {
  return AdminModel.findOneAndUpdate(filter, updateObject, options);
};

exports.getAllAdminByFilter = (
  filter = {},
  projections = null,
  options = {}
) => {
  return AdminModel.find(filter, projections, options);
};

exports.getAdminById = (id, projections = {}, options = {}) => {
  return AdminModel.findById(id, projections, options);
};
