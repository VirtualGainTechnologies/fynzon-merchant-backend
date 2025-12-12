const {
  getContactTypeByFilter,
  updateContactTypeByFilter,
  getContactByFilter,
  createContact,
  updateContactByFilter,
  getAllContactTypesByMode,
  getAllSingleContacts,
} = require("../../services/merchant/contactService");
const AppError = require("../../utils/AppError");

// contact type
exports.createContactType = async (req, res) => {
  const { mode, contactType } = req.body;

  // kyc check
  if (mode === "LIVE" && req.kycStatus !== "VERIFIED") {
    throw new AppError(401, "First complete the KYC");
  }

  // fetch merchant document first
  const contactTypes = await getContactTypeByFilter(
    { merchant_id: req.merchantId },
    "_id contact_types",
    { lean: true }
  );
  if (contactTypes) {
    // check if contact type already exists inside the array
    const isContactTypeExists = contactTypes.contact_types?.some(
      (item) => item.mode === mode && item.name === contactType
    );
    if (isContactTypeExists) {
      throw new AppError(400, "This contact type already exists");
    }
  }
  const contactTypeArray = contactTypes?.contact_types.filter(
    (item) => item.mode === mode
  ).length
    ? [
        {
          mode,
          name: contactType,
        },
      ]
    : [
        // default
        {
          mode,
          name: "CUSTOMER",
        },
        {
          mode,
          name: "VENDOR",
        },
        // custom
        {
          mode,
          name: contactType,
        },
      ];

  // Upsert: update if exists, insert if not
  const createdContact = await updateContactTypeByFilter(
    { merchant_id: req.merchantId },
    {
      merchant_id: req.merchantId,
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
    merchantId: req.merchantId,
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
    merchantId: req.merchantId,
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

// contacts
exports.createOrUpdateContact = async (req, res) => {
  const req_body = Object.assign({}, req.body);

  if (req_body.mode === "LIVE" && req.kycStatus !== "VERIFIED") {
    throw new AppError(401, "First complete the KYC");
  }

  const query = {
    merchant_id: req.merchantId,
    mode: req_body.mode,
    ...((req_body?.email || req_body?.phone) && {
      $or: [
        ...((req_body?.email && [{ user_email: req_body.email }]) || []),
        ...((req_body?.phone && [{ user_phone: req_body.phone }]) || []),
      ],
    }),
    ...(req_body.action === "UPDATE" && {
      contact_id: { $ne: req_body.contactId },
    }),
  };

  // check contact already exist or not
  if (query.$or?.length && req_body?.action === "CREATE") {
    const existingUser = await getContactByFilter(
      query,
      "_id user_email user_phone",
      {
        lean: true,
      }
    );

    if (existingUser) {
      const message =
        req_body?.email && existingUser?.user_email === req_body?.email
          ? "This email already exists"
          : req_body?.phone && existingUser?.user_phone === req_body?.phone
          ? "This phone number already exists"
          : "Email or phone number is missing";
      throw new AppError(400, message);
    }
  }

  const payload = {
    ...(req_body.action === "CREATE" && {
      merchant_id: req.merchantId,
      merchant_email: req.email,
      date: new Date().getTime(),
    }),
    mode: req_body.mode,
    contact_name: req_body.contactName,
    contact_type: req_body.contactType,
    ...(req_body.email && {
      user_email: req_body.email,
    }),
    ...(req_body.phone && {
      user_phone: req_body.phone,
    }),
    ...(req_body.note && {
      note: req_body.note,
    }),
    ...(req_body.status && {
      status: req_body.status,
    }),
    ...(req_body.taxId && {
      tax_id: req_body.taxId,
    }),
    ...(req_body?.address && {
      address: {
        ...(req_body?.address?.city && { city: req_body.address.city }),
        ...(req_body?.address?.zip && { zip: req_body.address.zip }),
        ...(req_body?.address?.state && { state: req_body.address.state }),
        ...(req_body?.address?.country && {
          country: req_body.address.country,
        }),
        ...(req_body?.address?.countryCode && {
          country_code: req_body.address.countryCode,
        }),
        ...(req_body?.address?.fullAddress && {
          full_address: req_body.address.fullAddress,
        }),
      },
    }),
  };

  let contactData = null;
  if (req_body.action === "UPDATE") {
    // update existing contact
    contactData = await updateContactByFilter(
      {
        merchant_id: req.merchantId,
        mode: req_body.mode,
      },
      payload,
      { new: true }
    );

    if (!contactData) {
      throw new AppError(400, "Error in updating contact");
    }
  } else {
    contactData = await createContact(payload);
    if (!contactData) {
      throw new AppError(400, "Error in creating contact");
    }
  }

  res.status(200).json({
    message: `Details ${
      req_body.action === "CREATE" ? "added" : "updated"
    } successfully`,
    error: false,
    data: {
      action: req_body.action,
      id: contactData?._id,
      mode: contactData?.mode,
      email: contactData?.user_email || "",
      phone: contactData?.user_phone || "",
      contactName: contactData?.contact_name,
      contactType: contactData?.contact_type,
      taxId: contactData?.tax_id || "",
      note: contactData?.note || "",
      status: contactData?.status,
      address: contactData?.address,
      date: contactData?.date,
    },
  });
};

exports.getAllContacts = async (req, res) => {
  const { mode = "LIVE", contactType = "ALL", searchValue = null } = req.query;
  const contactsData = await getAllSingleContacts({
    merchant_id: req.merchantId,
    mode,
    contactType,
    ...(searchValue && {
      searchValue,
    }),
  });
  if (!contactsData) {
    throw new AppError(400, "Failed to fetch all contacts");
  }

  res.status(200).json({
    message: "Data fetched successfully",
    error: false,
    data: contactsData[0],
  });
};
