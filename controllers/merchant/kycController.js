const { validationResult } = require("express-validator");
const axios = require("axios");

const AppError = require("../../utils/AppError");
const {
  deleteMultipleFiles,
  uploadMultiplePublicFile,
  uploadPublicFile,
  deleteFile,
} = require("../../utils/imageUpload");
const {
  getMerchantKycByFilter,
  updateMerchantKycByFilter,
} = require("../../services/merchant/kycService");
const { checkExpiry } = require("../../utils/dateHelper");
const { getNthLastCharactersInArray } = require("../../utils/stringHelper");
const {
  pvtltdToPrivateLimitedConverter,
} = require("../../utils/pvtltdToPrivateLimitedConverter");
const {
  getPanStatusByStatusCode,
  getAadharPanLinkStatus,
} = require("../../utils/kycUtils");
const { sendEmail } = require("../../utils/emailDispatcher");
const { logger } = require("../../utils/winstonLogger");

// verify aadhaar
exports.verifyAadhaar = async (req, res, next) => {
  let fileKeys = [];
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      const req_body = Object.assign({}, req.body);

      if (
        !req.files ||
        !req.files.aadhaarFront ||
        !req.files.aadhaarFront.length ||
        !req.files.aadhaarBack ||
        !req.files.aadhaarBack.length
      ) {
        throw new AppError(400, "Upload both sides of aadhaar card");
      }

      if (req.merchantType !== "INDIVIDUAL") {
        throw new AppError(400, "Merchant must be of individual type");
      }

      const kycData = await getMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        {
          "aadhaar.aadhaar_number": 1,
          "aadhaar.front_image": 1,
          "aadhaar.back_image": 1,
          "pan.is_pan_verified": 1,
          "bank.is_bank_verified": 1,
          "selfie.is_selfie_verified": 1,
        },
        { lean: true }
      );

      if (kycData.aadhaar?.aadhaar_number === req_body.aadhaarNumber) {
        throw new AppError(400, "This Aadhaar number already exists");
      }

      const files = [req.files.aadhaarFront[0], req.files.aadhaarBack[0]];

      const imageData = await uploadMultiplePublicFile(files, req.fullName, 10);

      if (imageData.error) {
        throw new AppError(400, imageData.message);
      }

      fileKeys = [
        imageData.data[0]?.split("/")[3],
        imageData.data[1]?.split("/")[3],
      ];

      const [frontImageUrl, backImageUrl] = imageData.data;

      // check image quality
      const [frontImageQuality, backImageQuaity] = await Promise.all([
        //check front image quality
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
          method: "post",
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            acceptanceThreshold: 0.5,
            url: frontImageUrl,
          }),
        }),
        // check back image quality
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
          method: "post",
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            acceptanceThreshold: 0.5,
            url: backImageUrl,
          }),
        }),
      ]);

      if (
        frontImageQuality.data?.result?.score * 1 < 0.5 ||
        backImageQuaity.data?.result?.score * 1 < 0.5
      ) {
        throw new AppError(
          400,
          frontImageQuality.data?.result?.score * 1 < 0.5
            ? "The Aadhaar front image quality is poor. Please upload a clear image"
            : "The Aadhaar back image quality is poor. Please upload a clear image"
        );
      }

      const [aadhaarVerifiedData, aadhaarExtractedData] = await Promise.all([
        // aadhaar verification
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/aadhaar/verify`,
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            uid: req_body.aadhaarNumber,
          }),
        }),

        // aadhaar-data-extraction
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/aadhaar/extraction`,
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            files: [frontImageUrl, backImageUrl],
          }),
        }),
      ]);

      // check aadhaar is linked with registered phone number or not
      if (
        `${req.phone}`.slice(-3) !==
        aadhaarVerifiedData.data?.result?.mobileNumber.slice(-3)
      ) {
        throw new AppError(
          400,
          "The Aadhaar number is not linked to the mobile number provided during registration"
        );
      }

      // check aadhaar verfification
      if (
        !aadhaarVerifiedData.data?.result?.verified ||
        aadhaarVerifiedData.data?.result?.verified !== "true" ||
        !aadhaarExtractedData.data?.result?.validBackAndFront ||
        aadhaarExtractedData.data?.result?.validBackAndFront === "false" ||
        !aadhaarExtractedData.data?.result?.name ||
        aadhaarExtractedData.data?.result?.name === "" ||
        !aadhaarExtractedData.data?.result?.pincode ||
        aadhaarExtractedData.data?.result?.pincode === "" ||
        !aadhaarExtractedData.data?.result?.gender ||
        aadhaarExtractedData.data?.result?.gender === ""
      ) {
        throw new AppError(400, "Aadhaar verfication failed");
      }

      // check expiryDate
      if (aadhaarExtractedData.data?.result?.summary?.expiryDate) {
        const expiryData = checkExpiry(
          aadhaarExtractedData.data?.result?.summary?.expiryDate
        );

        if (expiryData.isExpired) {
          throw new AppError(400, "Aadhaar card is expired");
        }
      }

      // match user input aadhaar number with image
      const [aadhaarNumber1, aadhaarNumber2] = getNthLastCharactersInArray(
        [req_body.aadhaarNumber, aadhaarExtractedData.data?.result?.uid],
        4
      );

      if (aadhaarNumber1 != aadhaarNumber2) {
        throw new AppError(
          400,
          "The entered Aadhaar number must match the number shown on the Aadhaar card image"
        );
      }

      // update aadhaar
      const updateObj = {
        "aadhaar.front_image": aadhaarExtractedData.data?.files[0] || "",
        "aadhaar.back_image": aadhaarExtractedData.data?.files[1] || "",
        "aadhaar.name": aadhaarExtractedData.data?.result?.name || "",
        "aadhaar.parent_name":
          aadhaarExtractedData.data?.result?.summary?.guardianName || "",
        "aadhaar.birth_date": aadhaarExtractedData.data?.result?.dob || "",
        "aadhaar.issue_date":
          aadhaarExtractedData.data?.result?.summary?.issueDate || "",
        "aadhaar.expiry_date":
          aadhaarExtractedData.data?.result?.summary?.expiryDate || "",
        "aadhaar.aadhaar_number": req_body?.aadhaarNumber,
        "aadhaar.gender": aadhaarExtractedData.data?.result?.gender || "",
        "aadhaar.address.address_line":
          aadhaarExtractedData.data?.result?.splitAddress?.addressLine || "",
        "aadhaar.address.city":
          aadhaarExtractedData.data?.result?.splitAddress?.city[0] || "",
        "aadhaar.address.district":
          aadhaarExtractedData.data?.result?.splitAddress?.district[0] || "",
        "aadhaar.address.state":
          aadhaarExtractedData.data?.result?.splitAddress?.state[0][0] || "",
        "aadhaar.address.country":
          aadhaarExtractedData.data?.result?.splitAddress?.country[2] || "",
        "aadhaar.address.pin_code":
          aadhaarExtractedData.data?.result?.splitAddress?.pincode || "",
        "aadhaar.status": "VERIFIED",
        "aadhaar.is_aadhaar_verified": true,
        kyc_status:
          kycData?.pan.is_pan_verified &&
          kycData?.bank.is_bank_verified &&
          kycData?.selfie.is_selfie_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        { merchant_id: req.merchantId },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in Aadhaar Verification");
      }

      // delete the prevoius aadhaar image from bucket
      if (kycData.aadhaar?.front_image && kycData.aadhaar?.back_image) {
        await deleteMultipleFiles([
          kycData.aadhaar?.front_image.split("/")[3],
          kycData.aadhaar?.back_image.split("/")[3],
        ]);
      }

      res.status(200).json({
        message: "Aadhaar verified successfully",
        error: false,
        data: {
          registeredName: updatedKyc.aadhaar?.name || "N/A",
          aadhaarNumber: updatedKyc.aadhaar?.aadhaar_number || "N/A",
          dateOfBirth: updatedKyc.aadhaar?.birth_date || "N/A",
          registeredAddress: updatedKyc.aadhaar?.address?.address_line
            ? `${updatedKyc.aadhaar?.address?.address_line} ${updatedKyc.aadhaar?.address?.city} ${updatedKyc.aadhaar?.address?.district} ${updatedKyc.aadhaar?.address?.state} ${updatedKyc.aadhaar?.address?.country} PIN-${updatedKyc.aadhaar?.address?.pin_code}`
            : "N/A",
          frontImage: updatedKyc.aadhaar?.front_image?.split("/")[3] || "N/A",
          backImage: updatedKyc.aadhaar?.back_image?.split("/")[3] || "N/A",
          status: updatedKyc.aadhaar?.status || "PENDING",
          kycStatus: updatedKyc.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifyAadhaar == > ${JSON.stringify(err)}`
    );
    // delete the prevoius aadhaar image from bucket
    if (fileKeys && fileKeys.length) {
      await deleteMultipleFiles(fileKeys);
    }

    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};

// verify gstin
exports.verifyGstin = async (req, res, next) => {
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      const req_body = Object.assign({}, req.body);

      if (req.merchantType !== "ENTITY") {
        throw new AppError(400, "Merchant must be of entity type");
      }

      // check gstin already exists or not
      const kycData = await getMerchantKycByFilter(
        { merchant_id: req.merchantId },
        {
          "gstin.gstin_number": 1,
          "pan.is_pan_verified": 1,
          "bank.is_bank_verified": 1,
        },
        { lean: true }
      );

      if (!kycData) {
        throw new AppError(400, "Failed to get KYC details");
      }

      if (kycData.gstin?.gstin_number === req_body.gstinNumber) {
        throw new AppError(400, "This GSTIN number already exists");
      }

      // get gstin details
      const gstData = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/gst/search`,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          gstin: req_body?.gstinNumber,
        }),
      });

      if (
        !gstData.data?.result?.gstnDetailed?.gstinStatus ||
        gstData.data?.result?.gstnDetailed?.gstinStatus != "ACTIVE" ||
        !gstData.data?.result?.gstnDetailed?.legalNameOfBusiness ||
        gstData.data?.result?.gstnDetailed?.legalNameOfBusiness === ""
      ) {
        throw new AppError(400, "Inactive GSTIN");
      }

      if (
        `${gstData.data?.result?.gstnDetailed?.legalNameOfBusiness}`.toUpperCase() !=
          `${req.businessName}`.toUpperCase() ||
        `${gstData.data?.result?.gstnDetailed?.tradeNameOfBusiness}`.toUpperCase() !=
          `${req.businessName}`.toUpperCase()
      ) {
        throw new AppError(
          400,
          "The business name entered during registration does not match the name associated with the provided GSTIN"
        );
      }

      // update gstin
      const updateObj = {
        "gstin.gstin_number":
          gstData.data?.result?.gstin ||
          gstData.data?.result?.gstnRecords[0]?.gstin ||
          "",
        "gstin.constitution_of_business":
          gstData.data?.result?.gstnDetailed?.constitutionOfBusiness || "",
        "gstin.legal_name_of_business":
          gstData.data?.result?.gstnDetailed?.legalNameOfBusiness || "",
        "gstin.trade_name_of_business":
          gstData.data?.result?.gstnDetailed?.tradeNameOfBusiness || "",
        "gstin.centre_jurisdiction":
          gstData.data?.result?.gstnDetailed?.centreJurisdiction || "",
        "gstin.state_jurisdiction":
          gstData.data?.result?.gstnDetailed?.stateJurisdiction || "",
        "gstin.registration_date":
          gstData.data?.result?.gstnDetailed?.registrationDate || "",
        "gstin.tax_payer_date":
          gstData.data?.result?.gstnDetailed?.taxPayerDate || "",
        "gstin.tax_payer_type":
          gstData.data?.result?.gstnDetailed?.taxPayerType || "",
        "gstin.gstin_status":
          gstData.data?.result?.gstnDetailed?.gstinStatus || "",
        "gstin.cancellation_date":
          gstData.data?.result?.gstnDetailed?.cancellationDate || "",
        "gstin.nature_of_business_activities":
          gstData.data?.result?.gstnDetailed?.natureOfBusinessActivities || "",
        "gstin.address.address_line":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.addressLine || "",
        "gstin.address.city":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.city[0] || "",
        "gstin.address.district":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.district[0] || "",
        "gstin.address.state":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.state[0][0] || "",
        "gstin.address.country":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.country[2] || "",
        "gstin.address.pin_code":
          gstData.data?.result?.gstnDetailed?.principalPlaceSplitAddress
            ?.pincode || "",
        "gstin.status": "VERIFIED",
        "gstin.is_gstin_verified": true,
        kyc_status:
          kycData?.pan.is_pan_verified && kycData?.bank.is_bank_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        { merchant_id: req.merchantId },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in updating GSTIN details");
      }

      res.status(200).json({
        message: "GSTIN verified successfully",
        error: false,
        data: {
          gstinNumber: updatedKyc.gstin?.gstin_number
            ? updatedKyc.gstin?.gstin_number
            : "N/A",
          businessName: updatedKyc.gstin?.legal_name_of_business
            ? updatedKyc.gstin?.legal_name_of_business
            : updatedKyc.gstin?.trade_name_of_business
            ? updatedKyc.gstin?.trade_name_of_business
            : "N/A",
          businessType: updatedKyc.gstin?.nature_of_business_activities
            ? updatedKyc.gstin?.nature_of_business_activities.join(",")
            : "N/A",
          registeredAddress: updatedKyc.gstin?.address?.address_line
            ? `${updatedKyc.gstin?.address?.address_line} ${updatedKyc.gstin?.address?.city} ${updatedKyc.gstin?.address?.district} ${updatedKyc.gstin?.address?.state} ${updatedKyc.gstin?.address?.country} pin-${updatedKyc.gstin?.address?.pin_code}`
            : "N/A",
          status: updatedKyc.gstin?.status,
          kycStatus: updatedKyc?.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifyGstin == > ${JSON.stringify(err)}`
    );
    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};

// verify individual pan card
exports.verifyIndividualPan = async (req, res, next) => {
  let fileKey = "";
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      const req_body = Object.assign({}, req.body);

      if (!req.file) {
        throw new AppError(400, "PAN image is missing");
      }

      if (req.merchantType !== "INDIVIDUAL") {
        throw new AppError(400, "Merchant must be of individual type");
      }

      const kycData = await getMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        {
          "pan.pan_number": 1,
          "pan.pan_image": 1,
          "aadhaar.name": 1,
          "aadhaar.is_aadhaar_verified": 1,
          "bank.is_bank_verified": 1,
          "selfie.is_selfie_verified": 1,
        },
        { lean: true }
      );

      if (!kycData.aadhaar?.is_aadhaar_verified) {
        throw new AppError(400, "First complete Aadhaar verification");
      }

      if (kycData.pan?.pan_number === req_body.panNumber) {
        throw new AppError(400, "This PAN number already exists");
      }

      const imageData = await uploadPublicFile(req.file, req.fullName, 5);

      if (imageData.error) {
        throw new AppError(400, imageUrl.message);
      }

      fileKey = imageData.data?.split("/")[3];

      // check image quality
      const panImageQuality = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          acceptanceThreshold: 0.5,
          url: imageData.data,
        }),
      });

      if (panImageQuality.data?.result?.score * 1 < 0.5) {
        throw new AppError(
          400,
          "The PAN image quality is poor. Please upload a clear image"
        );
      }

      const [panVerifiedData, panExtractedData] = await Promise.all([
        // verify-pan
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/pan/fetchV2`,
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            number: req_body?.panNumber,
            returnIndividualTaxComplianceInfo: "true",
          }),
        }),

        // pan card data-extraction
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/pan/extractions`,
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            files: [imageData.data],
            type: "individualPan",
            getRelativeData: true,
          }),
        }),
      ]);

      // check aadhaar and pan belongs to same person or not
      if (
        panExtractedData.data?.result?.name?.toUpperCase() !=
        kycData.aadhaar?.name?.toUpperCase()
      ) {
        throw new AppError(
          400,
          "The PAN and Aadhaar details belong to different individual"
        );
      }

      // check pan validity
      if (
        !panVerifiedData.data?.result?.isValid ||
        panVerifiedData.data?.result?.panStatusCode != "E"
      ) {
        const message = getPanStatusByStatusCode(
          panVerifiedData.data?.result?.panStatusCode
        );
        throw new AppError(400, message || "Invalid PAN");
      }

      // check pan belongs to individual or not
      if (panVerifiedData.data?.result?.typeOfHolder === "Company") {
        throw new AppError(400, "PAN card must be of individual or person");
      }

      // check pan and aadhar linked or not
      if (panVerifiedData.data?.result?.aadhaarSeedingStatusCode != "Y") {
        const message = getAadharPanLinkStatus(
          panVerifiedData.data?.result?.aadhaarSeedingStatusCode
        );
        throw new AppError(400, message || "PAN and Aadhaar is not linked");
      }

      // check PAN image is valid or not
      if (
        !panExtractedData.data?.result?.number ||
        panExtractedData.data?.result?.number === ""
      ) {
        throw new AppError(400, "Invalid PAN image");
      }

      // check expiryDate
      if (panExtractedData.data?.result?.summary?.expiryDate) {
        const expiryData = checkExpiry(
          panExtractedData.data?.result?.summary?.expiryDate
        );

        if (expiryData.isExpired) {
          throw new AppError(400, "PAN is expired");
        }
      }

      // check pan number entered match with pan number on image or not
      if (
        panVerifiedData.data?.result?.number !=
        panExtractedData.data?.result?.number
      ) {
        throw new AppError(
          400,
          "The entered PAN number must match the PAN number shown in the image"
        );
      }

      // update pan
      let updateObj = {
        "pan.type_of_holder": panVerifiedData.data?.result?.typeOfHolder || "",
        "pan.pan_image": panExtractedData.data?.files[0] || "",
        "pan.name": panExtractedData.data?.result?.name || "",
        "pan.parent_name": panExtractedData.data?.result?.fatherName || "",
        "pan.birth_date": panExtractedData.data?.result?.dob || "",
        "pan.issue_date":
          panExtractedData.data?.result?.summary?.issueDate || "",
        "pan.expiry_date":
          panExtractedData.data?.result?.summary?.expiryDate || "",
        "pan.pan_number":
          panExtractedData.data?.result?.number ||
          panVerifiedData.data?.result?.number ||
          "",
        "pan.gender": panExtractedData.data?.result?.summary?.gender || "",
        "pan.address.address_line":
          panExtractedData.data?.result?.summary?.splitAddress?.addressLine ||
          "",
        "pan.address.city":
          panExtractedData.data?.result?.summary?.splitAddress?.city[0] || "",
        "pan.address.district":
          panExtractedData.data?.result?.summary?.splitAddress?.district[0] ||
          "",
        "pan.address.state":
          panExtractedData.data?.result?.summary?.splitAddress?.state[0][0] ||
          "",
        "pan.address.country":
          panExtractedData.data?.result?.summary?.splitAddress?.country[2] ||
          "",
        "pan.address.pin_code":
          panExtractedData.data?.result?.summary?.splitAddress?.pincode || "",
        "pan.status": "VERIFIED",
        "pan.is_pan_verified": true,
        kyc_status:
          kycData?.aadhaar?.is_aadhaar_verified &&
          kycData?.bank?.is_bank_verified &&
          kycData?.selfie?.is_selfie_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in updating pan details");
      }

      // delete the prevoius passport image from bucket
      if (kycData.pan?.pan_image) {
        const key = kycData?.pan?.pan_image.split("/")[3];
        await deleteFile(key);
      }

      res.status(200).json({
        message: "PAN verified successfully",
        error: false,
        data: {
          registeredName: updatedKyc.pan?.name ? updatedKyc.pan?.name : "N/A",
          panNumber: updatedKyc.pan?.pan_number
            ? updatedKyc.pan?.pan_number
            : "N/A",
          typeOfHolder: updatedKyc.pan?.type_of_holder
            ? updatedKyc.pan?.type_of_holder
            : "N/A",
          dateOfBirth: updatedKyc.pan?.birth_date
            ? updatedKyc.pan?.birth_date
            : "N/A",
          registeredAddress: updatedKyc.pan?.address?.addres_line
            ? `${updatedKyc.pan?.address?.addres_line} ${updatedKyc.pan?.address?.city} ${updatedKyc.pan?.address?.district} ${updatedKyc.pan?.address?.state} ${updatedKyc.pan?.address?.country} pin-${updatedKyc.pan?.address?.pin_code}`
            : "N/A",
          panImage: updatedKyc.pan?.pan_image?.split("/")[3] || "N/A",
          status: updatedKyc.pan?.status ? updatedKyc.pan?.status : "PENDING",
          kycStatus: updatedKyc?.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifyIndividualPan == > ${JSON.stringify(err)}`
    );
    // delete the prevoius pan image from bucket
    if (fileKey) {
      await deleteFile(fileKey);
    }

    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};

// verify business pan card
exports.verifyBusinessPan = async (req, res, next) => {
  let fileKey = "";
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      const req_body = Object.assign({}, req.body);

      if (!req.file) {
        throw new AppError(400, "PAN image is missing");
      }

      if (req.merchantType !== "ENTITY") {
        throw new AppError(400, "Merchant must be of entity type");
      }

      const kycData = await getMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        {
          "pan.pan_number": 1,
          "pan.pan_image": 1,
          "gstin.gstin_number": 1,
          "gstin.legal_name_of_business": 1,
          "gstin.trade_name_of_business": 1,
          "gstin.is_gstin_verified": 1,
          "bank.is_bank_verified": 1,
        },
        { lean: true }
      );

      if (!kycData.gstin?.is_gstin_verified) {
        throw new AppError(400, "First complete GSTIN verification");
      }

      if (kycData.pan?.pan_number === req_body.panNumber) {
        throw new AppError(400, "This PAN number already exists");
      }

      const imageData = await uploadPublicFile(req.file, req.fullName, 5);

      if (imageData.error) {
        throw new AppError(400, imageUrl.message);
      }

      fileKey = imageData.data?.split("/")[3];

      // check image quality
      const panImageQuality = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          acceptanceThreshold: 0.5,
          url: imageData.data,
        }),
      });

      if (panImageQuality.data?.result?.score * 1 < 0.5) {
        throw new AppError(
          400,
          "The PAN image quality is poor. Please upload a clear image"
        );
      }

      const [panVerifiedData, panGstLinkData, panExtractedData] =
        await Promise.all([
          // verify-pan
          axios.request({
            url: `${process.env.SIGNZY_MAIN_URL}/api/v3/pan/fetchV2`,
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: process.env.SIGNZY_TOKEN,
            },
            data: JSON.stringify({
              number: req_body?.panNumber,
              returnIndividualTaxComplianceInfo: "true",
            }),
          }),
          // verify-pan-gst-linked or not
          axios.request({
            url: `${process.env.SIGNZY_MAIN_URL}/api/v3/gst/panToGstnDetail`,
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: process.env.SIGNZY_TOKEN,
            },
            data: JSON.stringify({
              panNumber: req_body?.panNumber,
            }),
          }),
          // pan card data-extraction
          axios.request({
            url: `${process.env.SIGNZY_MAIN_URL}/api/v3/pan/extractions`,
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: process.env.SIGNZY_TOKEN,
            },
            data: JSON.stringify({
              files: [imageData.data],
              type: "businessPan",
              getRelativeData: true,
            }),
          }),
        ]);

      // check pan validity
      if (
        !panVerifiedData.data?.result?.isValid ||
        panVerifiedData.data?.result?.panStatusCode != "E"
      ) {
        const message = getPanStatusByStatusCode(
          panVerifiedData.data?.result?.panStatusCode
        );
        throw new AppError(400, message || "Invalid PAN");
      }

      // check pan belongs to individual or not
      if (panVerifiedData.data?.result?.typeOfHolder !== "Company") {
        throw new AppError(400, "PAN card must be of company or entity");
      }

      // check PAN image is valid or not
      if (
        !panExtractedData.data?.result?.number ||
        panExtractedData.data?.result?.number === ""
      ) {
        throw new AppError(400, "Invalid PAN image");
      }

      // check expiryDate
      if (panExtractedData.data?.result?.summary?.expiryDate) {
        const expiryData = checkExpiry(
          panExtractedData.data?.result?.summary?.expiryDate
        );

        if (expiryData.isExpired) {
          throw new AppError(400, "PAN is expired");
        }
      }

      // check pan number entered match with pan number on image or not
      if (
        panVerifiedData.data?.result?.number !=
        panExtractedData.data?.result?.number
      ) {
        throw new AppError(
          400,
          "The entered PAN number must match the PAN number shown in the image"
        );
      }

      if (kycData.gstin?.gstin_number != panGstLinkData.data?.result?.gstin) {
        throw new AppError(400, "PAN and GSTIN is not linked");
      }

      // check pan and gstin belongs to same person or not
      if (
        panExtractedData.data?.result?.name?.toUpperCase() !=
        (kycData.gstin?.legal_name_of_business?.toUpperCase() ||
          kycData.gstin?.trade_name_of_business?.toUpperCase())
      ) {
        throw new AppError(
          400,
          "The PAN and GSTIN details belong to different individual"
        );
      }

      // update pan
      let updateObj = {
        "pan.type_of_holder": panVerifiedData.data?.result?.typeOfHolder || "",
        "pan.pan_image": panExtractedData.data?.files[0] || "",
        "pan.name": panExtractedData.data?.result?.name || "",
        "pan.parent_name": panExtractedData.data?.result?.fatherName || "",
        "pan.birth_date": panExtractedData.data?.result?.dob || "",
        "pan.issue_date":
          panExtractedData.data?.result?.summary?.issueDate || "",
        "pan.expiry_date":
          panExtractedData.data?.result?.summary?.expiryDate || "",
        "pan.pan_number":
          panExtractedData.data?.result?.number ||
          panVerifiedData.data?.result?.number ||
          "",
        "pan.gender": panExtractedData.data?.result?.summary?.gender || "",
        "pan.address.address_line":
          panExtractedData.data?.result?.summary?.splitAddress?.addressLine ||
          "",
        "pan.address.city":
          panExtractedData.data?.result?.summary?.splitAddress?.city[0] || "",
        "pan.address.district":
          panExtractedData.data?.result?.summary?.splitAddress?.district[0] ||
          "",
        "pan.address.state":
          panExtractedData.data?.result?.summary?.splitAddress?.state[0][0] ||
          "",
        "pan.address.country":
          panExtractedData.data?.result?.summary?.splitAddress?.country[2] ||
          "",
        "pan.address.pin_code":
          panExtractedData.data?.result?.summary?.splitAddress?.pincode || "",
        "pan.status": "VERIFIED",
        "pan.is_pan_verified": true,
        kyc_status:
          kycData?.gstin?.is_gstin_verified && kycData?.bank?.is_bank_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in updating pan details");
      }

      // delete the prevoius passport image from bucket
      if (kycData.pan?.pan_image) {
        const key = kycData?.pan?.pan_image.split("/")[3];
        await deleteFile(key);
      }

      res.status(200).json({
        message: "PAN verified successfully",
        error: false,
        data: {
          registeredName: updatedKyc.pan?.name ? updatedKyc.pan?.name : "N/A",
          panNumber: updatedKyc.pan?.pan_number
            ? updatedKyc.pan?.pan_number
            : "N/A",
          typeOfHolder: updatedKyc.pan?.type_of_holder
            ? updatedKyc.pan?.type_of_holder
            : "N/A",
          dateOfBirth: updatedKyc.pan?.birth_date
            ? updatedKyc.pan?.birth_date
            : "N/A",
          registeredAddress: updatedKyc.pan?.address?.address_line
            ? `${updatedKyc.pan?.address?.address_line} ${updatedKyc.pan?.address?.city} ${updatedKyc.pan?.address?.district} ${updatedKyc.pan?.address?.state} ${updatedKyc.pan?.address?.country} pin-${updatedKyc.pan?.address?.pin_code}`
            : "N/A",
          panImage: updatedKyc.pan?.pan_image?.split("/")[3] || "N/A",
          status: updatedKyc.pan?.status ? updatedKyc.pan?.status : "PENDING",
          kycStatus: updatedKyc?.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifyBusinessPan == > ${JSON.stringify(err)}`
    );
    // delete the prevoius pan image from bucket
    if (fileKey) {
      await deleteFile(fileKey);
    }

    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};

// verify bank account
exports.verifyBank = async (req, res, next) => {
  let fileKey = "";
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      const req_body = Object.assign({}, req.body);

      if (!req.file) {
        throw new AppError(400, "Cancelled cheque image is missing");
      }

      const kycData = await getMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        {
          "bank.account_number": 1,
          "bank.cancelled_cheque_image": 1,
          "aadhaar.name": 1,
          "gstin.legal_name_of_business": 1,
          "gstin.trade_name_of_business": 1,
          "aadhaar.is_aadhaar_verified": 1,
          "pan.is_pan_verified": 1,
          "bank.is_bank_verified": 1,
          "selfie.is_selfie_verified": 1,
          "gstin.is_gstin_verified": 1,
        },
        { lean: true }
      );

      if (kycData.bank?.account_number === req_body.bankAccNo) {
        throw new AppError(400, "This Account number already exists");
      }

      if (
        req.merchantType === "INDIVIDUAL" &&
        (!kycData.aadhaar?.is_aadhaar_verified || !kycData.pan?.is_pan_verified)
      ) {
        const message =
          !kycData.aadhaar?.is_aadhaar_verified && !kycData.pan?.is_pan_verified
            ? "First complete Aadhaar and PAN verification"
            : !kycData.aadhaar?.is_aadhaar_verified
            ? "First complete Aadhaar verification"
            : "First complete PAN verification";

        throw new AppError(400, message);
      }

      if (
        req.merchantType === "ENTITY" &&
        (!kycData.gstin?.is_gstin_verified || !kycData.pan?.is_pan_verified)
      ) {
        const message =
          !kycData.gstin?.is_gstin_verified && !kycData.pan?.is_pan_verified
            ? "First complete GSTIN and PAN verification"
            : !kycData.gstin?.is_gstin_verified
            ? "First complete GSTIN verification"
            : "First complete PAN verification";

        throw new AppError(400, message);
      }

      const imageData = await uploadPublicFile(
        req.file,
        req.fullName || req.businessName,
        2
      );

      if (imageData.error) {
        throw new AppError(400, imageUrl.message);
      }

      fileKey = imageData.data?.split("/")[3];

      // check image quality
      const chequeImageQuality = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          acceptanceThreshold: 0.5,
          url: imageData.data,
        }),
      });

      if (chequeImageQuality.data?.result?.score * 1 < 0.5) {
        throw new AppError(
          400,
          "The Cheque image quality is poor. Please upload a clear image"
        );
      }

      const [accountData, chequeExtractedData] = await Promise.all([
        // account verfication
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/bankaccountverification/bankaccountverifications`,
          method: "post",
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            beneficiaryAccount: req_body?.bankAccNo,
            beneficiaryIFSC: req_body?.ifscCode,
          }),
        }),

        // data extraction
        axios.request({
          url: `${process.env.SIGNZY_MAIN_URL}/api/v3/cheque/extractions`,
          method: "post",
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SIGNZY_TOKEN,
          },
          data: JSON.stringify({
            files: [imageData.data],
          }),
        }),
      ]);

      // check bank and aadhaar belongs to same person or not
      if (
        kycData.aadhaar?.name &&
        chequeExtractedData.data?.result?.name?.toUpperCase() !=
          kycData.aadhaar?.name?.toUpperCase()
      ) {
        throw new AppError(
          400,
          "The Bank and Aadhaar details belong to different individual"
        );
      }

      const name = pvtltdToPrivateLimitedConverter(
        accountData.data?.result?.bankTransfer?.beneName ||
          chequeExtractedData.data?.result?.name
      );
      // check bank and gstin belongs to same person or not
      if (
        name.toUpperCase() !=
        (kycData.gstin?.legal_name_of_business?.toUpperCase() ||
          kycData.gstin?.trade_name_of_business?.toUpperCase())
      ) {
        throw new AppError(
          400,
          "Bank and GSTIN details belong to different individual"
        );
      }

      if (
        !accountData.data?.result?.active ||
        accountData.data?.result?.active !== "yes" ||
        !accountData.data?.result?.bankTransfer ||
        !accountData.data?.result?.bankTransfer?.bankRRN ||
        !accountData.data?.result?.bankTransfer?.bankRRN === ""
      ) {
        throw new AppError(400, "Inactive bank account");
      }

      if (
        !chequeExtractedData.data?.result?.accountNumber ||
        chequeExtractedData.data?.result?.accountNumber === "" ||
        !chequeExtractedData.data?.result?.ifsc ||
        chequeExtractedData.data?.result?.ifsc === ""
      ) {
        throw new AppError(400, "Invalid cheque image");
      }

      if (
        chequeExtractedData.data?.result?.accountNumber != req_body?.bankAccNo
      ) {
        throw new AppError(
          400,
          "The account number provided should exactly match the one mentioned on the cheque"
        );
      }

      if (chequeExtractedData.data?.result?.ifsc != req_body?.ifscCode) {
        throw new AppError(
          400,
          "The IFSC code provided should exactly match the one mentioned on the cheque"
        );
      }

      // update bank detials
      let updateObj = {
        "bank.bank_name": chequeExtractedData.data?.result?.bankName || "",
        "bank.branch": chequeExtractedData.data?.result?.branch || "",
        "bank.ifsc": chequeExtractedData.data?.result?.ifsc || "",
        "bank.account_number":
          chequeExtractedData.data?.result?.accountNumber || "",
        "bank.account_type":
          chequeExtractedData.data?.result?.accountType || "",
        "bank.name": name || "",
        "bank.cancelled_cheque_image": chequeExtractedData.data?.files[0] || "",
        "bank.cheque_number":
          chequeExtractedData.data?.result?.chequeNumber || "",
        "bank.cheque_issue_date":
          chequeExtractedData.data?.result?.summary?.issueDate || "",
        "bank.cheque_expiry_date":
          chequeExtractedData.data?.result?.summary?.expiryDate || "",
        "bank.micr_code": chequeExtractedData.data?.result?.micrCode || "",
        "bank.testTransferRRN":
          accountData.data?.result?.bankTransfer?.bankRRN || "",
        "bank.address.address_line":
          chequeExtractedData.data?.result?.splitAddress?.addressLine || "",
        "bank.address.city":
          chequeExtractedData.data?.result?.splitAddress?.city[0] || "",
        "bank.address.district":
          chequeExtractedData.data?.result?.splitAddress?.district[0] || "",
        "bank.address.state":
          chequeExtractedData.data?.result?.splitAddress?.state[0][0] || "",
        "bank.address.country":
          chequeExtractedData.data?.result?.splitAddress?.country[2] || "",
        "bank.address.pin_code":
          chequeExtractedData.data?.result?.splitAddress?.pincode || "",
        "bank.status": "VERIFIED",
        "bank.is_bank_verified": true,
        kyc_status:
          req.merchantType === "INDIVIDUAL" &&
          kycData?.aadhaar.is_aadhaar_verified &&
          kycData?.pan.is_pan_verified &&
          kycData?.selfie.is_selfie_verified
            ? "VERIFIED"
            : req.merchantType === "ENTITY" &&
              kycData?.gstin.is_gstin_verified &&
              kycData?.pan.is_pan_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        { user_id: req.userId },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in updating bank details");
      }

      // delete the prevoius cheque image from bucket
      if (kycData.bank?.cancelled_cheque_image) {
        const key = kycData.bank?.cancelled_cheque_image.split("/")[3];
        await deleteFile(key);
      }

      // send email
      if (
        req.merchantType === "ENTITY" &&
        updatedKyc.kyc_status === "VERIFIED"
      ) {
        const emailObject = {
          userName: req.businessName,
          email: req.email,
          btnURL: `${process.env.CLIENT_BASE_URL1}/auth/login`,
          type: "kyc-approved",
        };

        const isEmailSent = await sendEmail(emailObject);
        if (isEmailSent.error) {
          throw new AppError(400, isEmailSent.message);
        }
      }
      res.status(200).json({
        message: "Bank account verified successfully",
        error: false,
        data: {
          bankName: updatedKyc.bank?.bank_name
            ? updatedKyc.bank?.bank_name
            : "N/A",
          branch: updatedKyc.bank?.branch ? updatedKyc.bank?.branch : "N/A",
          ifscCode: updatedKyc.bank?.ifsc ? updatedKyc.bank?.ifsc : "N/A",
          accountNumber: updatedKyc.bank?.account_number
            ? updatedKyc.bank?.account_number
            : "N/A",
          accountType: updatedKyc.bank?.account_type
            ? updatedKyc.bank?.account_type
            : "N/A",
          registeredAddress: updatedKyc.bank?.address?.address_line
            ? `${updatedKyc.bank?.address?.address_line} ${updatedKyc.bank?.address?.city} ${updatedKyc.bank?.address?.district} ${updatedKyc.bank?.address?.state} ${updatedKyc.bank?.address?.country} pin-${updatedKyc.bank?.address?.pin_code}`
            : "N/A",
          chequeImage:
            updatedKyc.bank?.cancelled_cheque_image?.split("/")[3] || "N/A",
          status: updatedKyc.bank?.status ? updatedKyc.bank?.status : "PENDING",
          kycStatus: updatedKyc?.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifyBank == > ${JSON.stringify(err)}`
    );
    // delete the prevoius pan image from bucket
    if (fileKey) {
      await deleteFile(fileKey);
    }

    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};

// verify selfie
exports.verifySelfie = async (req, res, next) => {
  let fileKey = "";
  try {
    const { errors } = validationResult(req);
    if (errors.length > 0) {
      throw new AppError(400, errors[0].msg || "Bad request");
    } else {
      if (!req.file) {
        throw new AppError(400, "Selfie is missing");
      }

      if (req.merchantType !== "INDIVIDUAL") {
        throw new AppError(400, "Merchant must be of individual type");
      }

      const kycData = await getMerchantKycByFilter(
        {
          merchant_id: req.merchantId,
        },
        {
          "selfie?.selfie_image": 1,
          "aadhaar.front_image": 1,
          "aadhaar.is_aadhaar_verified": 1,
          "pan.is_pan_verified": 1,
          "bank.is_bank_verified": 1,
        },
        { lean: true }
      );

      if (!kycData.aadhaar?.is_aadhaar_verified) {
        throw new AppError(400, "First complete Aadhaar verification");
      }

      if (!kycData.pan?.is_pan_verified) {
        throw new AppError(400, "First complete PAN verification");
      }

      if (!kycData.bank?.is_bank_verified) {
        throw new AppError(400, "First complete Bank verification");
      }

      const imageData = await uploadPublicFile(req.file, req.fullName, 5);

      if (imageData.error) {
        throw new AppError(400, imageData.message);
      }

      fileKey = imageData.data?.split("/")[3];

      // check image quality
      const selfieImageQuality = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/vision/assess-image-quality`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          acceptanceThreshold: 0.5,
          url: imageData.data,
        }),
      });

      if (
        selfieImageQuality.data?.result?.qualityScores?.sharpness?.score * 1 <
        0.3
      ) {
        throw new AppError(
          400,
          "The Selfie image sharpness is poor. Please upload a clear image"
        );
      }

      // aadhaar card face-extarction
      const faceExtractedData = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/face/get-face`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          url: kycData?.aadhaar?.front_image,
        }),
      });

      // face-match
      const faceMatchData = await axios.request({
        url: `${process.env.SIGNZY_MAIN_URL}/api/v3/face/match`,
        method: "post",
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.SIGNZY_TOKEN,
        },
        data: JSON.stringify({
          firstImage: imageData.data,
          secondImage: faceExtractedData?.data?.faceUrl,
          threshold: "0.5",
          detectMask: [imageData.data],
        }),
      });

      if (faceMatchData?.data?.result?.maskDetections[0]?.maskDetected) {
        throw new AppError(400, "Mask detected on face");
      }

      if (!faceMatchData.data?.result?.verified) {
        throw new AppError(
          400,
          "The selfie does not match the photo on the Aadhaar card"
        );
      }

      // update selfie
      let updateObj = {
        "selfie.selfie_image": imageData.data || "",
        "selfie.status": "VERIFIED",
        "selfie.is_selfie_verified": true,
        kyc_status:
          kycData?.aadhaar?.is_aadhaar_verified &&
          kycData?.pan?.is_pan_verified &&
          kycData?.bank?.is_bank_verified
            ? "VERIFIED"
            : "PENDING",
      };

      const updatedKyc = await updateMerchantKycByFilter(
        { merchant_id: req.merchantId },
        updateObj,
        { new: true }
      );

      if (!updatedKyc) {
        throw new AppError(400, "Error in updating selfie details");
      }

      // delete the prevoius selfie image from bucket
      if (kycData.selfie?.selfie_image) {
        const key = kycData.selfie?.selfie_image.split("/")[3];
        await deleteFile(key);
      }

      // send email
      if (updatedKyc.kyc_status === "VERIFIED") {
        const emailObject = {
          userName: req.fullName,
          email: req.email,
          btnURL: `${process.env.CLIENT_BASE_URL1}/auth/login`,
          type: "kyc-approved",
        };

        const isEmailSent = await sendEmail(emailObject);
        if (isEmailSent.error) {
          throw new AppError(400, isEmailSent.message);
        }
      }

      res.status(200).json({
        message: "Selfie verified successfully",
        error: false,
        data: {
          selfieImage: updatedKyc.selfie?.selfie_image
            ? updatedKyc.selfie?.selfie_image
            : "N/A",
          status: updatedKyc.selfie?.status,
          kycStatus: updatedKyc?.kyc_status,
        },
      });
    }
  } catch (err) {
    logger.error(
      `Error in catch block of verifySelfie == > ${JSON.stringify(err)}`
    );
    // delete the prevoius pan image from bucket
    if (fileKey) {
      await deleteFile(fileKey);
    }

    if (err.response?.data || err.response?.data?.error) {
      next(
        new AppError(
          400,
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Invalid details provided"
        )
      );
    } else {
      next(err);
    }
  }
};
