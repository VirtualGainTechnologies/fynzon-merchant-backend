const { InvoiceModel } = require("../../models/merchant/invoiceModel");

exports.createInvoiceDoc = (object) => {
  return InvoiceModel.create(object);
};

exports.getInvoiceById = (id, projections = null, options = {}) => {
  return InvoiceModel.findById(id, projections, options);
};

exports.updateInvoiceById = (id, updateData, options = {}) => {
  return InvoiceModel.findById(id, updateData, options);
};

exports.getInvoiceByFilter = (
  filter = {},
  projections = null,
  options = {}
) => {
  return InvoiceModel.findOne(filter, projections, options);
};
