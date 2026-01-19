const { RecurringInvoiceModel } = require("../../models/merchant/recurringInvoiceModel");

exports.createRecurringInvoiceDoc = (object) => {
  return RecurringInvoiceModel.create(object);
};

exports.getRecurringInvoiceById = (id, projections = null, options = {}) => {
  return RecurringInvoiceModel.findById(id, projections, options);
};

exports.updateRecurringInvoiceById = (id, updateData, options = {}) => {
  return RecurringInvoiceModel.findById(id, updateData, options);
};

exports.getRecurringInvoiceByFilter = (
  filter = {},
  projections = null,
  options = {}
) => {
  return RecurringInvoiceModel.findOne(filter, projections, options);
};
