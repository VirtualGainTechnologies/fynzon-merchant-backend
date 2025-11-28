const { MerchantKycModel } = require("../../models/merchant/kycModel");

exports.createMerchantKyc = (object) => {
  return MerchantKycModel.create(object);
};

exports.getMerchantKycById = (id, projections = null, options = {}) => {
  return MerchantKycModel.findById(id, projections, options);
};

exports.getMerchantKycByFilter = (
  filters = {},
  projections = null,
  options = {}
) => {
  return MerchantKycModel.findOne(filters, projections, options);
};

exports.updateMerchantKycById = (id, updateObject, options = {}) => {
  return MerchantKycModel.findByIdAndUpdate(id, updateObject, options);
};

exports.updateMerchantKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.findOneAndUpdate(filters, updateObject, options);
};

exports.updateAllMerchantKycByFilter = (
  filters = {},
  updateObject = {},
  options = {}
) => {
  return MerchantKycModel.updateMany(filters, updateObject, options);
};

exports.getAllMerchantKycByFilter = (options) => {
  const { email, businessName, fullName, page, limit } = options;
  const filter = {
    ...(email && {
      email: { $regex: email, $options: "i" },
    }),
    ...(businessName && {
      business_name: { $regex: businessName, $options: "i" },
    }),
    ...(email && {
      full_name: { $regex: fullName, $options: "i" },
    }),
  };
  return MerchantKycModel.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "merchant",
        let: { merchantId: "$merchant_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$merchantId"] },
            },
          },
          {
            $project: {
              _id: 0,
              full_name: 1,
              business_name: 1,
            },
          },
        ],
        as: "merchant",
      },
    },
    {
      $unwind: {
        path: "$merchant",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fullName: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$merchant.full_name", null] },
                { $eq: ["$merchant.full_name", ""] },
                { $eq: ["$merchant.full_name", " "] },
              ],
            },
            then: "N/A",
            else: "$merchant.full_name",
          },
        },
        businessName: { $ifNull: ["$merchant.business_name", "N/A"] },
      },
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        merchant_type: 1,
        email: 1,
        kycStatus: "$kyc_status",
        merchantName: {
          $cond: {
            if: { $eq: ["$merchant_type", "INDIVIDUAL"] },
            then: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$aadhaar.name", ""] },
                    { $eq: ["$aadhaar.name", null] },
                    { $eq: ["$aadhaar.name", "N/A"] },
                  ],
                },
                then: "$fullName",
                else: "$aadhaar.name",
              },
            },
            else: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$pan.name", ""] },
                    { $eq: ["$pan.name", null] },
                    { $eq: ["$pan.name", "N/A"] },
                    { $eq: ["$pan.name", undefined] },
                  ],
                },
                then: "$fullName",
                else: "$pan.name",
              },
            },
          },
        },
        businessName: {
          $ifNull: ["$gstin.legal_name_of_business", "$businessName"],
        },
        aadhaar: {
          $cond: [
            { $eq: ["$merchant_type", "INDIVIDUAL"] },
            {
              registeredName: { $ifNull: ["$aadhaar.name", "N/A"] },
              aadhaarNumber: { $ifNull: ["$aadhaar.aadhaar_number", "N/A"] },
              dateOfBirth: { $ifNull: ["$aadhaar.birth_date", "N/A"] },
              gender: { $ifNull: ["$aadhaar.gender", "N/A"] },
              registeredAddress: {
                $cond: [
                  { $ifNull: ["$aadhaar.address.address_line", false] },
                  {
                    $concat: [
                      "$aadhaar.address.address_line",
                      " ",
                      "$aadhaar.address.city",
                      " ",
                      "$aadhaar.address.district",
                      " ",
                      "$aadhaar.address.state",
                      " ",
                      "$aadhaar.address.country",
                      " ",
                      { $concat: ["PIN-", "$aadhaar.address.pin_code"] },
                    ],
                  },
                  "N/A",
                ],
              },
              frontImage: { $ifNull: ["$aadhaar.front_image", "N/A"] },
              backImage: { $ifNull: ["$aadhaar.back_image", "N/A"] },
              status: { $ifNull: ["$aadhaar.status", "PENDING"] },
            },
            "$$REMOVE",
          ],
        },
        pan: {
          registeredName: { $ifNull: ["$pan.name", "N/A"] },
          panNumber: { $ifNull: ["$pan.pan_number", "N/A"] },
          typeOfHolder: { $ifNull: ["$pan.type_of_holder", "N/A"] },
          dateOfBirth: { $ifNull: ["$pan.birth_date", "N/A"] },
          issueDate: { $ifNull: ["$pan.issue_date", "N/A"] },
          registeredAddress: {
            $cond: [
              { $ifNull: ["$pan.address.addres_line", false] },
              {
                $concat: [
                  "$pan.address.addres_line",
                  " ",
                  "$pan.address.city",
                  " ",
                  "$pan.address.district",
                  " ",
                  "$pan.address.state",
                  " ",
                  "$pan.address.country",
                  " ",
                  { $concat: ["pin-", "$pan.address.pin_code"] },
                ],
              },
              "N/A",
            ],
          },
          panImage: { $ifNull: ["$pan.pan_image", "N/A"] },
          status: { $ifNull: ["$pan.status", "PENDING"] },
        },
        bank: {
          bankName: { $ifNull: ["$bank.bank_name", "N/A"] },
          branch: { $ifNull: ["$bank.branch", "N/A"] },
          ifscCode: { $ifNull: ["$bank.ifsc", "N/A"] },
          accountNumber: { $ifNull: ["$bank.account_number", "N/A"] },
          accountType: { $ifNull: ["$bank.account_type", "N/A"] },
          registeredAddress: {
            $cond: [
              { $ifNull: ["$bank.address.address_line", false] },
              {
                $concat: [
                  "$bank.address.address_line",
                  " ",
                  "$bank.address.city",
                  " ",
                  "$bank.address.district",
                  " ",
                  "$bank.address.state",
                  " ",
                  "$bank.address.country",
                  " ",
                  { $concat: ["pin-", "$bank.address.pin_code"] },
                ],
              },
              "N/A",
            ],
          },
          chequeImage: { $ifNull: ["$bank.cancelled_cheque_image", "N/A"] },
          status: { $ifNull: ["$bank.status", "PENDING"] },
        },
        selfie: {
          $cond: [
            { $eq: ["$merchant_type", "INDIVIDUAL"] },
            {
              selfieImage: { $ifNull: ["$selfie.selfie_image", "N/A"] },
              status: { $ifNull: ["$selfie.status", "PENDING"] },
            },
            "$$REMOVE",
          ],
        },
        gstin: {
          $cond: [
            { $eq: ["$merchant_type", "ENTITY"] },
            {
              gstinNumber: { $ifNull: ["$gstin.gstin_number", "N/A"] },
              businessName: {
                $cond: [
                  { $ifNull: ["$gstin.legal_name_of_business", false] },
                  "$gstin.legal_name_of_business",
                  {
                    $cond: [
                      { $ifNull: ["$gstin.trade_name_of_business", false] },
                      "$gstin.trade_name_of_business",
                      "N/A",
                    ],
                  },
                ],
              },
              businessType: {
                $cond: [
                  { $isArray: "$gstin.nature_of_business_activities" },
                  {
                    $reduce: {
                      input: "$gstin.nature_of_business_activities",
                      initialValue: "",
                      in: {
                        $cond: [
                          { $eq: ["$$value", ""] },
                          "$$this",
                          { $concat: ["$$value", ",", "$$this"] },
                        ],
                      },
                    },
                  },
                  "N/A",
                ],
              },
              registeredAddress: {
                $cond: [
                  { $ifNull: ["$gstin.address.address_line", false] },
                  {
                    $concat: [
                      "$gstin.address.address_line",
                      " ",
                      "$gstin.address.city",
                      " ",
                      "$gstin.address.district",
                      " ",
                      "$gstin.address.state",
                      " ",
                      "$gstin.address.country",
                      " ",
                      { $concat: ["pin-", "$gstin.address.pin_code"] },
                    ],
                  },
                  "N/A",
                ],
              },
              constitutionOfBusiness: {
                $ifNull: ["$gstin.constitution_of_business", "N/A"],
              },
              centreJurisdiction: {
                $ifNull: ["$gstin.centre_jurisdiction", "N/A"],
              },
              registrationDate: {
                $ifNull: ["$gstin.registration_date", "N/A"],
              },
              taxPayerType: {
                $ifNull: ["$gstin.tax_payer_type", "N/A"],
              },
              status: "$gstin.status",
            },
            "$$REMOVE",
          ],
        },
      },
    },
  ]).allowDiskUse(true);
};

exports.getAllMerchantKycByFilter = (options) => {
  const { email, businessName, fullName, page = 0, limit = 10 } = options;

  const filter = {
    ...(email && {
      email: { $regex: email, $options: "i" },
    }),
    ...(businessName && {
      business_name: { $regex: businessName, $options: "i" },
    }),
    ...(fullName && {
      full_name: { $regex: fullName, $options: "i" },
    }),
  };

  return MerchantKycModel.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: "merchant",
        let: { merchantId: "$merchant_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$merchantId"] } } },
          { $project: { _id: 0, full_name: 1, business_name: 1 } },
        ],
        as: "merchant",
      },
    },

    { $unwind: { path: "$merchant", preserveNullAndEmptyArrays: true } },

    {
      $addFields: {
        fullName: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$merchant.full_name", null] },
                { $eq: ["$merchant.full_name", ""] },
                { $eq: ["$merchant.full_name", " "] },
              ],
            },
            then: "N/A",
            else: "$merchant.full_name",
          },
        },
        businessName: { $ifNull: ["$merchant.business_name", "N/A"] },
      },
    },

    {
      $facet: {
        data: [
          { $skip: page * Number(limit) },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1,
              createdAt: 1,
              merchant_type: 1,
              email: 1,
              kycStatus: "$kyc_status",

              merchantName: {
                $cond: {
                  if: { $eq: ["$merchant_type", "INDIVIDUAL"] },
                  then: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$aadhaar.name", ""] },
                          { $eq: ["$aadhaar.name", null] },
                          { $eq: ["$aadhaar.name", "N/A"] },
                        ],
                      },
                      then: "$fullName",
                      else: "$aadhaar.name",
                    },
                  },
                  else: {
                    $cond: {
                      if: {
                        $or: [
                          { $eq: ["$pan.name", ""] },
                          { $eq: ["$pan.name", null] },
                          { $eq: ["$pan.name", "N/A"] },
                          { $eq: ["$pan.name", undefined] },
                        ],
                      },
                      then: "$fullName",
                      else: "$pan.name",
                    },
                  },
                },
              },

              businessName: {
                $ifNull: ["$gstin.legal_name_of_business", "$businessName"],
              },

              aadhaar: {
                $cond: [
                  { $eq: ["$merchant_type", "INDIVIDUAL"] },
                  {
                    registeredName: { $ifNull: ["$aadhaar.name", "N/A"] },
                    aadhaarNumber: {
                      $ifNull: ["$aadhaar.aadhaar_number", "N/A"],
                    },
                    dateOfBirth: { $ifNull: ["$aadhaar.birth_date", "N/A"] },
                    gender: { $ifNull: ["$aadhaar.gender", "N/A"] },
                    registeredAddress: {
                      $cond: [
                        { $ifNull: ["$aadhaar.address.address_line", false] },
                        {
                          $concat: [
                            "$aadhaar.address.address_line",
                            " ",
                            "$aadhaar.address.city",
                            " ",
                            "$aadhaar.address.district",
                            " ",
                            "$aadhaar.address.state",
                            " ",
                            "$aadhaar.address.country",
                            " ",
                            { $concat: ["PIN-", "$aadhaar.address.pin_code"] },
                          ],
                        },
                        "N/A",
                      ],
                    },
                    frontImage: { $ifNull: ["$aadhaar.front_image", "N/A"] },
                    backImage: { $ifNull: ["$aadhaar.back_image", "N/A"] },
                    status: { $ifNull: ["$aadhaar.status", "PENDING"] },
                  },
                  "$$REMOVE",
                ],
              },

              pan: {
                registeredName: { $ifNull: ["$pan.name", "N/A"] },
                panNumber: { $ifNull: ["$pan.pan_number", "N/A"] },
                typeOfHolder: { $ifNull: ["$pan.type_of_holder", "N/A"] },
                dateOfBirth: { $ifNull: ["$pan.birth_date", "N/A"] },
                issueDate: { $ifNull: ["$pan.issue_date", "N/A"] },
                registeredAddress: {
                  $cond: [
                    { $ifNull: ["$pan.address.addres_line", false] },
                    {
                      $concat: [
                        "$pan.address.addres_line",
                        " ",
                        "$pan.address.city",
                        " ",
                        "$pan.address.district",
                        " ",
                        "$pan.address.state",
                        " ",
                        "$pan.address.country",
                        " ",
                        { $concat: ["pin-", "$pan.address.pin_code"] },
                      ],
                    },
                    "N/A",
                  ],
                },
                panImage: { $ifNull: ["$pan.pan_image", "N/A"] },
                status: { $ifNull: ["$pan.status", "PENDING"] },
              },

              bank: {
                bankName: { $ifNull: ["$bank.bank_name", "N/A"] },
                branch: { $ifNull: ["$bank.branch", "N/A"] },
                ifscCode: { $ifNull: ["$bank.ifsc", "N/A"] },
                accountNumber: { $ifNull: ["$bank.account_number", "N/A"] },
                accountType: { $ifNull: ["$bank.account_type", "N/A"] },
                registeredAddress: {
                  $cond: [
                    { $ifNull: ["$bank.address.address_line", false] },
                    {
                      $concat: [
                        "$bank.address.address_line",
                        " ",
                        "$bank.address.city",
                        " ",
                        "$bank.address.district",
                        " ",
                        "$bank.address.state",
                        " ",
                        "$bank.address.country",
                        " ",
                        { $concat: ["pin-", "$bank.address.pin_code"] },
                      ],
                    },
                    "N/A",
                  ],
                },
                chequeImage: {
                  $ifNull: ["$bank.cancelled_cheque_image", "N/A"],
                },
                status: { $ifNull: ["$bank.status", "PENDING"] },
              },

              selfie: {
                $cond: [
                  { $eq: ["$merchant_type", "INDIVIDUAL"] },
                  {
                    selfieImage: { $ifNull: ["$selfie.selfie_image", "N/A"] },
                    status: { $ifNull: ["$selfie.status", "PENDING"] },
                  },
                  "$$REMOVE",
                ],
              },

              gstin: {
                $cond: [
                  { $eq: ["$merchant_type", "ENTITY"] },
                  {
                    gstinNumber: { $ifNull: ["$gstin.gstin_number", "N/A"] },
                    businessName: {
                      $cond: [
                        { $ifNull: ["$gstin.legal_name_of_business", false] },
                        "$gstin.legal_name_of_business",
                        {
                          $cond: [
                            {
                              $ifNull: ["$gstin.trade_name_of_business", false],
                            },
                            "$gstin.trade_name_of_business",
                            "N/A",
                          ],
                        },
                      ],
                    },
                    businessType: {
                      $cond: [
                        { $isArray: "$gstin.nature_of_business_activities" },
                        {
                          $reduce: {
                            input: "$gstin.nature_of_business_activities",
                            initialValue: "",
                            in: {
                              $cond: [
                                { $eq: ["$$value", ""] },
                                "$$this",
                                { $concat: ["$$value", ",", "$$this"] },
                              ],
                            },
                          },
                        },
                        "N/A",
                      ],
                    },
                    registeredAddress: {
                      $cond: [
                        { $ifNull: ["$gstin.address.address_line", false] },
                        {
                          $concat: [
                            "$gstin.address.address_line",
                            " ",
                            "$gstin.address.city",
                            " ",
                            "$gstin.address.district",
                            " ",
                            "$gstin.address.state",
                            " ",
                            "$gstin.address.country",
                            " ",
                            { $concat: ["pin-", "$gstin.address.pin_code"] },
                          ],
                        },
                        "N/A",
                      ],
                    },
                    constitutionOfBusiness: {
                      $ifNull: ["$gstin.constitution_of_business", "N/A"],
                    },
                    centreJurisdiction: {
                      $ifNull: ["$gstin.centre_jurisdiction", "N/A"],
                    },
                    registrationDate: {
                      $ifNull: ["$gstin.registration_date", "N/A"],
                    },
                    taxPayerType: {
                      $ifNull: ["$gstin.tax_payer_type", "N/A"],
                    },
                    status: "$gstin.status",
                  },
                  "$$REMOVE",
                ],
              },
            },
          },
        ],
        totalRecords: [{ $count: "count" }],
      },
    },
  ]).allowDiskUse(true);
};
