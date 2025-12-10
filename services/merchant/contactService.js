// conatct types realted services
const mongoose = require("mongoose");

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

//conatcts realted
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
        merchant_id: options.userId,
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
