const { InvoiceModel } = require("../../models/merchant/invoiceModel");

exports.createInvoice = (object) => {
  return InvoiceModel.create(object);
};

exports.getInvoiceById = (id, projections = null, options = {}) => {
  return InvoiceModel.findById(id, projections, options);
};
