const {
  getContactTypeByFilter,
  updateContactTypeByFilter,
  getContactByFilter,
  createContact,
  updateContactByFilter,
  getAllContactTypesByMode,
  getAllSingleContacts,
  prepareContactsDataForExcel,
} = require("../../services/merchant/contactService");
const AppError = require("../../utils/AppError");

exports.createContactType = async (req, res) => {
  const { mode, contactType } = req.body;

  if (mode === "LIVE" && req.kycStatus !== "VERIFIED") {
    throw new AppError(401, "First complete the KYC");
  }

  //check contact doc already exist or not
  const contactTypeDoc = await getContactTypeByFilter(
    { merchant_id: req.userId },
    "_id contact_types",
    {
      lean: true,
    }
  );

  //chekc contactType already exist
  if (contactTypeDoc) {
    const existingNames = contactTypeDoc.contact_types.some(
      (item) => item.mode === mode && item.name === contactType
    );

    if (existingNames) {
      throw new AppError(400, "This contact type already exists");
    }
  }

  const contactTypeArray = contactTypeDoc?.contact_types.filter(
    (item) => item.mode === mode
  ).length
    ? [
        {
          mode,
          name: contactType,
        },
      ]
    : [
        //default
        {
          mode,
          name: "CUSTOMER",
        },
        {
          mode,
          name: "VENDOR",
        },
        {
          mode,
          name: "EMPLOYEE",
        },
        //custom
        {
          mode,
          name: contactType,
        },
      ];

  // Upsert: update if exists, insert if not
  const createdContact = await updateContactTypeByFilter(
    { merchant_id: req.userId },
    {
      merchant_id: req.userId,
      merchant_email: req.email,
      $push: {
        contact_types: {
          $each: contactTypeArray,
        },
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  if (!createdContact) {
    throw new AppError(400, "Contact type creation failed");
  }

  const contactTypesData = await getAllContactTypesByMode({
    mode,
    userId: req.userId,
  });

  if (!contactTypesData) {
    throw new AppError(400, "Error in fetching data");
  }

  res.status(200).json({
    message: "Created successfully",
    error: false,
    data: {
      contactTypes: contactTypesData[0]?.contact_types.length
        ? contactTypesData[0]?.contact_types
        : [],
    },
  });
};

exports.getContactTypes = async (req, res) => {
  const { mode } = req.query;

  const contactTypesData = await getAllContactTypesByMode({
    mode,
    userId: req.userId,
  });

  if (!contactTypesData) {
    throw new AppError(400, "Error in fetching data");
  }

  res.status(200).json({
    message: "Data fetched successfully",
    error: false,
    data: {
      contactTypes: contactTypesData[0]?.contact_types.length
        ? contactTypesData[0]?.contact_types
        : [],
    },
  });
};