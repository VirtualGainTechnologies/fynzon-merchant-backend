// conatct types realted services
const {
  ContactTypeModel,
  ContactModel,
} = require("../../models/merchant/contactModel");

//conatct types realted
exports.createContactType = (object) => {
  return ContactTypeModel.create(object);
};

exports.getContactTypeById = (id, projections = null, options = {}) => {
  return ContactTypeModel.findById(id, projections, options);
};

exports.getContactTypeByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return ContactTypeModel.findOne(filters, projections, options);
};

exports.getAllContactTypesByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return ContactTypeModel.find(filters, projections, options);
};

exports.updateContactTypeById = (id, updateObject, options = {}) => {
  return ContactTypeModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateContactTypeByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return ContactTypeModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllContactTypesByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return ContactTypeModel.updateMany(filters, updateObject, options);
};

// conatcts realted
exports.createContact = (object) => {
  return ContactModel.create(object);
};

exports.getContactById = (id, projections = null, options = {}) => {
  return ContactModel.findById(id, projections, options);
};

exports.getContactByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return ContactModel.findOne(filters, projections, options);
};

exports.getAllContactsByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return ContactModel.find(filters, projections, options);
};

exports.updateContactById = (id, updateObject, options = {}) => {
  return ContactModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateContactByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return ContactModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllContactsByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return ContactModel.updateMany(filters, updateObject, options);
};

exports.bulkUpdateContactsData = (updateOperations = [], options = {}) => {
  return ContactModel.bulkWrite(updateOperations, options);
};

exports.getAllContactTypesByMode = (options) => {
  const pipeline = [
    {
      $match: {
        merchant_id: options.merchantId,
      },
    },
    {
      $project: {
        contact_types: {
          $filter: {
            input: "$contact_types",
            as: "type",
            cond: { $eq: ["$$type.mode", options.mode] },
          },
        },
      },
    },
  ];

  return ContactTypeModel.aggregate(pipeline).allowDiskUse(true);
};

exports.getAllSingleContacts = (options) => {
  // searchValue = user_email contact_name or user_phone
  let searchQuery = [];
  if (options?.searchValue) {
    searchQuery = [
      { user_email: { $regex: options.searchValue, $options: "i" } },
      { contact_name: { $regex: options.searchValue, $options: "i" } },
    ];
    // if input is a phone number (digits only)
    if (/^\d+$/.test(options.searchValue)) {
      searchQuery.push({ user_phone: { $regex: options.searchValue } });
    }
  }

  const filter = {
    merchant_id: options.merchant_id,
    mode: options.mode,
    ...(options?.contactType &&
      options?.contactType !== "ALL" && {
        contact_type: options.contactType,
      }),
    ...(options?.searchValue && {
      $or: searchQuery,
    }),
  };

  const pipeline = [
    {
      $match: filter,
    },
    {
      $facet: {
        metadata: [
          {
            $count: "total_records",
          },
        ],
        data: [
          {
            $project: {
              _id: 0,
              id: "$_id",
              mode: "$mode",
              email: "$user_email",
              phone: "$user_phone",
              taxId: "$tax_id",
              contactType: "$contact_type",
              contactName: "$contact_name",
              notes: "$notes",
              status: "$status",
              date: {
                $dateToString: {
                  format: "%d-%m-%Y %H:%M:%S",
                  date: { $toDate: { $add: ["$date", 19800000] } },
                },
              },
              address: "$address",
            },
          },
        ],
      },
    },
    {
      $project: {
        totalRecords: {
          $ifNull: [{ $arrayElemAt: ["$metadata.total_records", 0] }, 0],
        },
        data: "$data",
      },
    },
  ];

  return ContactModel.aggregate(pipeline).allowDiskUse(true);
};
