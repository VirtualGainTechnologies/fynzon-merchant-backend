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
  options = {},
) => {
  return InvoiceModel.findOne(filter, projections, options);
};

exports.getInvoiceList = (options) => {
  const {
    status,
    invoiceNumber,
    contactEmail,
    startDate,
    endDate,
    page,
    limit,
    userId,
  } = options;

  const filter = {
    user_id: userId,
    ...(status !== "ALL" && { status }),
    ...(invoiceNumber && {
      invoice_number: { $regex: invoiceNumber, $options: "i" },
    }),
    ...(contactEmail && {
      contact_email: { $regex: contactEmail, $options: "i" },
    }),
    ...(startDate &&
      endDate && {
        $expr: {
          $and: [{ $gte: ["$date", startDate] }, { $lte: ["$date", endDate] }],
        },
      }),
  };
  return InvoiceModel.aggregate([
    {
      $match: filter,
    },
    {
      $facet: {
        data: [
          { $skip: page * limit },
          { $limit: limit * 1 },
          {
            $project: {
              _id: 1,
              user_id: 1,
              user_email: 1,
              mode: 1,
              contact_name: 1,
              contact_type: 1,
              contact_email: 1,
              contact_phone: 1,
              contact_address: 1,
              deposit_crypto: 1,
              deposit_network: 1,
              deposit_address: 1,
              invoice_number: 1,
              invoice_type: 1,
              order_description: 1,
              conversion_rate: 1,
              issue_date: 1,
              due_date: 1,
              items: 1,
              total_currency_amount: 1,
              total_crypto_amount: 1,
              discount_percentage: 1,
              tax_percentage: 1,
              status: 1,
              date: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        invoiceList: "$data",
        totalCount: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ]);
};
