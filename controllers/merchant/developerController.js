const AppError = require("../../utils/AppError");
const {
  getApiSettingByFilter,
  updateApiSettingByFilter,
} = require("../../services/merchant/apiSettingService");
const { generateUniqueId } = require("../../utils/generateUniqueId");
const { sendOtpToEmail } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");

// api-key
exports.generateApiKey = async (req, res) => {
  const { mode, websiteURL } = req.body;
  if (req.kycStatus !== "VERIFIED") {
    throw new AppError(400, "KYC status is not verified");
  }
  const keyType = `${mode.toLowerCase()}_api_key`;

  // check if API keys exist
  const apiKeys = await getApiSettingByFilter(
    { merchant_id: req.merchantId },
    `_id ${keyType}`,
    { lean: true }
  );

  if (apiKeys?.[keyType]?.api_key) {
    throw new AppError(400, "API key already exists");
  }

  // generate keys
  const secretKey = generateUniqueId(15);
  const prefix = mode === "TEST" ? "api_test" : "api_live";

  // prepare update object
  const updateObj = {
    [keyType]: {
      api_key: `${prefix}.${generateUniqueId(25)}`,
      secret_key: secretKey,
      status: "PROCESSING",
      url: websiteURL,
      created_at: new Date().getTime(),
    },
  };

  const updatedKeys = await updateApiSettingByFilter(
    { merchant_id: req.merchantId },
    updateObj,
    { new: true, upsert: true }
  );

  if (!updatedKeys) {
    throw new AppError(400, "Failed to generate API Key");
  }

  res.status(200).json({
    message: "API keys generated successfully",
    error: false,
    data: {
      test_api_key: updatedKeys?.test_api_key,
      live_api_key: updatedKeys?.live_api_key,
      test_ip: updatedKeys?.test_ip,
      live_ip: updatedKeys?.live_ip,
      test_webhook_url: updatedKeys?.test_webhook_url,
      live_webhook_url: updatedKeys?.live_webhook_url,
    },
  });
};

exports.deleteApiKey = async (req, res) => {
  const req_body = { ...req.body };

  // check api_key exist or not
  const filter =
    req_body.mode === "TEST"
      ? { "test_api_key.api_key": req_body.apiKey }
      : { "live_api_key.api_key": req_body.apiKey };

  const isApiKeyExist = await getApiSettingByFilter(filter, "_id", {
    lean: true,
  });

  if (!isApiKeyExist) {
    throw new AppError(404, "No valid API key found");
  }

  // delete api_key
  const deleteObj =
    req_body.mode === "TEST"
      ? { $unset: { test_api_key: 1 } }
      : { $unset: { live_api_key: 1 } };

  const deletedApiKey = await updateApiSettingByFilter(
    { merchant_id: req.merchantId },
    deleteObj,
    { new: true }
  );

  if (!deletedApiKey) {
    throw new AppError(400, "Failed to delete api key");
  }

  res.status(200).json({
    message: "API key deleted successfully",
    error: false,
    data: {
      test_api_key: deletedApiKey?.test_api_key,
      live_api_key: deletedApiKey?.live_api_key,
      test_ip: deletedApiKey?.test_ip,
      live_ip: deletedApiKey?.live_ip,
      test_webhook_url: deletedApiKey?.test_webhook_url,
      live_webhook_url: deletedApiKey?.live_webhook_url,
    },
  });
};

// add ip-address
exports.sendOtpToAddIp = async (req, res) => {
  const { ipAddress, mode } = req.body;

  // check kyc is verified or not
  if (req.kycStatus !== "VERIFIED") {
    throw new AppError(400, "KYC status is not verified");
  }

  // chekc api key for that mode exists or not
  const developerInfo = await getApiSettingByFilter(
    { merchant_id: req.merchantId },
    "_id test_ip live_ip live_api_key test_api_key",
    { lean: true }
  );

  if (!developerInfo) {
    throw new AppError(400, "Failed to add ip address");
  }

  if (!developerInfo[`${mode.toLowerCase()}_api_key`]?.api_key) {
    throw new AppError(400, `First generate ${mode.toLowerCase()} API key`);
  }

  if (developerInfo[`${mode.toLowerCase()}_api_key`]?.status === "BLOCKED") {
    throw new AppError(
      400,
      `${
        mode.charAt(0).toUppercase() + mode.slice(1).toLowerCase()
      } API key is inactive`
    );
  }

  if (
    developerInfo[`${mode.toLowerCase()}_ip`].length + req.ipListArray.length >
    3
  ) {
    throw new AppError(400, "Only 3 IP addresses are allowed");
  }

  const isPresent = (ip) => {
    return developerInfo[`${mode.toLowerCase()}_ip`].some(
      (x) => x.ip_address === ip
    );
  };

  ipAddress
    .split(",")
    .map((item) => item.replace(/\s+/g, ""))
    .forEach((val) => {
      if (isPresent(val))
        throw new AppError(400, `The IP ${val} already exist`);
    });

  // send otp
  const result = await sendOtpToEmail({
    type: "add ip_address",
    email: req.email,
  });

  if (!result || result.error || !result.data) {
    throw new AppError(400, result?.message || "Failed to send OTP");
  }

  const { otpId, email } = result.data;

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      mode,
      ipAddress,
      otpId,
      email,
    },
  });
};

exports.verifyOtpToAddIp = async (req, res) => {
  const { otpId, otp, ipAddress, mode } = req.body;

  // verify otp
  const verifyOTP = await verifyOtp(otpId, otp);
  if (verifyOTP.error) {
    throw new AppError(400, verifyOTP.message);
  }

  const developerInfo = await getApiSettingByFilter(
    { merchant_id: req.merchantId },
    "_id test_ip live_ip live_api_key test_api_key",
    { lean: true }
  );

  if (!developerInfo) {
    throw new AppError(400, "Failed to add ip address");
  }

  if (!developerInfo[`${mode.toLowerCase()}_api_key`]?.url) {
    throw new AppError(400, `First add ${mode.toLowerCase()} API key`);
  }

  if (developerInfo[`${mode.toLowerCase()}_ip`].length == 3) {
    throw new AppError(400, "Only 3 IP addresses are allowed");
  }

  const isPresent = (ip) => {
    return developerInfo[`${mode.toLowerCase()}_ip`].some(
      (x) => x.ip_address === ip
    );
  };

  let requestedIps = ipAddress
    .split(",")
    .map((item) => item.replace(/\s+/g, ""));

  requestedIps.forEach((val) => {
    if (isPresent(val)) throw new AppError(400, `${val} ip is already exist`);
  });

  requestedIps = requestedIps.map((x) => {
    return {
      status: "PROCESSING",
      ip_address: x,
      created_at: new Date().getTime(),
    };
  });

  const updatedIpAllowlist = await updateApiSettingByFilter(
    { merchant_id: req.merchantId },
    { $push: { [`${mode.toLowerCase()}_ip`]: { $each: requestedIps } } },
    { new: true }
  );

  if (!updatedIpAllowlist) {
    throw new AppError(400, "Failed to add IP");
  }

  res.status(200).json({
    message: "IP address added successfully",
    error: false,
    data: {
      test_api_key: updatedIpAllowlist?.test_api_key,
      live_api_key: updatedIpAllowlist?.live_api_key,
      test_ip: updatedIpAllowlist?.test_ip,
      live_ip: updatedIpAllowlist?.live_ip,
      test_webhook_url: updatedIpAllowlist?.test_webhook_url,
      live_webhook_url: updatedIpAllowlist?.live_webhook_url,
    },
  });
};

//update ip-address
exports.sendOtpToUpdateIp = async (req, res) => {
  const { mode, oldIpAddress, ipAddress } = req.body;

  // old IP exists?
  const existingDoc = await getApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip`]: {
        $elemMatch: { ip_address: oldIpAddress },
      },
    },
    "_id",
    { lean: true }
  );

  if (!existingDoc) {
    throw new AppError(404, "Old IP address not found");
  }

  // new IP exists?
  const isNewIpExist = await getApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip`]: {
        $elemMatch: { ip_address: ipAddress },
      },
    },
    "_id",
    { lean: true }
  );

  if (isNewIpExist) {
    throw new AppError(400, "This IP address already exists");
  }

  // send otp
  const result = await sendOtpToEmail({
    type: "update-ip",
    email: req.email,
  });

  if (!result || result.error || !result.data) {
    throw new AppError(400, result?.message || "Failed to send OTP");
  }

  const { otpId, email } = result.data;
  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      ...req.body,
      otpId,
      email,
    },
  });
};

exports.verifyOtpToUpdateIp = async (req, res) => {
  const { otpId, otp, ipAddress, oldIpAddress, mode } = req.body;

  // verify otp
  const verifyOTP = await verifyOtp(otpId, otp);
  if (verifyOTP.error) {
    throw new AppError(400, verifyOTP.message);
  }

  // old IP exists?
  const existingDoc = await getApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip`]: {
        $elemMatch: { ip_address: oldIpAddress },
      },
    },
    "_id",
    { lean: true }
  );

  if (!existingDoc) {
    throw new AppError(404, "Old IP address not found");
  }

  // new IP exists?
  const isNewIpExist = await getApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip`]: {
        $elemMatch: { ip_address: ipAddress },
      },
    },
    "_id",
    { lean: true }
  );

  if (isNewIpExist) {
    throw new AppError(400, "This IP address already exists");
  }

  // update ip
  const updateIp = await updateApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip.ip_address`]: oldIpAddress,
    },
    {
      $set: {
        [`${mode.toLowerCase()}_ip.$.ip_address`]: ipAddress,
        [`${mode.toLowerCase()}_ip.$.created_at`]: new Date().getTime(),
      },
    },
    {
      new: true,
    }
  );

  if (!updateIp) {
    throw new AppError(400, "Failed to update IP address");
  }

  res.status(200).json({
    message: "IP address updated successfully",
    error: false,
    data: {
      test_api_key: updateIp?.test_api_key,
      live_api_key: updateIp?.live_api_key,
      test_ip: updateIp?.test_ip,
      live_ip: updateIp?.live_ip,
      test_webhook_url: updateIp?.test_webhook_url,
      live_webhook_url: updateIp?.live_webhook_url,
    },
  });
};

// delete ip-address
exports.sendOtpToRemoveIp = async (req, res) => {
  const { mode, ipAddress } = req.body;

  const isIpExist = await getApiSettingByFilter(
    {
      [`${mode.toLowerCase()}_ip`]: {
        $elemMatch: { ip_address: ipAddress },
      },
    },
    "_id",
    {
      lean: true,
    }
  );

  if (!isIpExist) {
    throw new AppError(404, "IP address not found");
  }

  // send otp
  const {
    message,
    error,
    data: { otpId, email },
  } = await sendOtpToEmail({
    type: "remove-ip",
    email: req.email,
  });

  if (error) {
    throw new AppError(400, message);
  }

  res.status(200).json({
    message: `OTP sent to email`,
    error: false,
    data: {
      otpId,
      email,
      mode,
      ipAddress,
    },
  });
};

exports.verifyOtpToRemoveIp = async (req, res) => {
  const { otpId, mode, ipAddress, otp } = req.body;

  // verify otp
  const verifyOTP = await verifyOtp(otpId, otp);
  if (verifyOTP.error) {
    throw new AppError(400, verifyOTP.message);
  }

  const deletedIp = await updateApiSettingByFilter(
    { merchant_id: req.merchantId },
    {
      $pull: {
        [`${mode.toLowerCase()}_ip`]: { ip_address: ipAddress },
      },
    },
    { new: true }
  );

  if (!deletedIp) {
    throw new AppError(400, "Failed to remove ip");
  }

  res.status(200).json({
    message: "IP address removed successfully",
    error: false,
    data: {
      test_api_key: deletedIp?.test_api_key,
      live_api_key: deletedIp?.live_api_key,
      test_ip: deletedIp?.test_ip,
      live_ip: deletedIp?.live_ip,
      test_webhook_url: deletedIp?.test_webhook_url,
      live_webhook_url: deletedIp?.live_webhook_url,
    },
  });
};

// add webhook
exports.addWebHookUrl = async (req, res) => {
  const { url, mode, event } = req.body;

  // check kys is verified or not
  if (req.kycStatus !== "VERIFIED") {
    throw new AppError(400, "KYC status is not verified");
  }

  // check api key and ip address already exists or not
  const developerInfo = await getApiSettingByFilter(
    { merchant_id: req.merchantId },
    "_id test_ip live_ip live_api_key test_api_key",
    { lean: true }
  );

  if (!developerInfo) {
    throw new AppError(400, "Failed to add webhook URL");
  }

  if (!developerInfo[`${mode.toLowerCase()}_api_key`]?.api_key) {
    throw new AppError(400, `First generate ${mode.toLowerCase()} API key`);
  }

  if (!developerInfo[`${mode.toLowerCase()}_ip`].length) {
    throw new AppError(400, `First add ${mode.toLowerCase()} IP address`);
  }
  const webhookType = `${mode.toLowerCase()}_webhook_url`;
  const isUrlExist = await getApiSettingByFilter(
    {
      [webhookType]: {
        $elemMatch: {
          event,
        },
      },
    },
    "_id",
    {
      lean: true,
    }
  );

  if (isUrlExist) {
    throw new AppError(
      404,
      `URL already exists for ${event.toLowerCase()} event`
    );
  }

  const updateUrl = await updateApiSettingByFilter(
    { merchant_id: req.merchantId },
    {
      $push: {
        [webhookType]: {
          url,
          event,
          created_at: new Date().getTime(),
        },
      },
    },
    { new: true }
  );

  if (!updateUrl) {
    throw new AppError(400, "Failed to add webhook url");
  }

  res.status(200).json({
    message: "Webhook URL added successfully",
    error: false,
    data: {
      test_api_key: updateUrl?.test_api_key,
      live_api_key: updateUrl?.live_api_key,
      test_ip: updateUrl?.test_ip,
      live_ip: updateUrl?.live_ip,
      test_webhook_url: updateUrl?.test_webhook_url,
      live_webhook_url: updateUrl?.live_webhook_url,
    },
  });
};

// update webhook
exports.updateWebHookURL = async (req, res) => {
  const { url, oldUrl, mode, event } = req.body;

  // check kyc is verified or not
  if (req.kycStatus !== "VERIFIED") {
    throw new AppError(400, "KYC status is not verified");
  }

  const webhookType = `${mode.toLowerCase()}_webhook_url`;

  // check old url exists or not
  const filter = {
    [webhookType]: {
      $elemMatch: {
        url: oldUrl,
        event,
      },
    },
  };

  const isOldURLExist = await getApiSettingByFilter(filter, "_id", {
    lean: true,
  });
  if (!isOldURLExist) {
    throw new AppError(404, "Old URL does not exist");
  }

  // chekc new url already exists or not
  const isNewURLExist = await getApiSettingByFilter(
    {
      [webhookType]: {
        $elemMatch: {
          url,
          event,
        },
      },
    },
    "_id",
    {
      lean: true,
    }
  );

  if (isNewURLExist) {
    throw new AppError(
      400,
      `This URL already exists for ${event.toLowerCase()}`
    );
  }

  // update new url
  const updatedURL = await updateApiSettingByFilter(
    filter,
    {
      $set: {
        [`${mode.toLowerCase()}_webhook_url.$.url`]: url,
        [`${mode.toLowerCase()}_webhook_url.$.created_at`]:
          new Date().getTime(),
      },
    },
    { new: true }
  );

  if (!updatedURL) {
    throw new AppError(400, "Failed to update webhook URL");
  }

  res.status(200).json({
    message: "Webhook URL updated successfully",
    error: false,
    data: {
      test_api_key: updatedURL?.test_api_key,
      live_api_key: updatedURL?.live_api_key,
      test_ip: updatedURL?.test_ip,
      live_ip: updatedURL?.live_ip,
      test_webhook_url: updatedURL?.test_webhook_url,
      live_webhook_url: updatedURL?.live_webhook_url,
    },
  });
};

// delete webhook
exports.removeWebHookUrl = async (req, res) => {
  const { url, mode, event } = req.body;

  //check kyc is verified or not
  if (req.kycStatus !== "VERIFIED") {
    throw new AppError(400, "KYC status is not verified");
  }

  const webhookType = `${mode.toLowerCase()}_webhook_url`;

  // check url exists or not
  const isUrlExist = await getApiSettingByFilter(
    {
      [webhookType]: {
        $elemMatch: {
          url,
          event,
        },
      },
    },
    "_id",
    {
      lean: true,
    }
  );

  if (!isUrlExist) {
    throw new AppError(404, "URL does not exist");
  }

  // remove url
  const removeUrl = await updateApiSettingByFilter(
    { Merchant_id: req.MerchantId },
    {
      $pull: {
        [webhookType]: {
          url,
          event,
        },
      },
    },
    { new: true }
  );

  if (!removeUrl) {
    throw new AppError(400, "Failed to remove webhook url");
  }

  res.status(200).json({
    message: "Webhook removed successfully",
    error: false,
    data: {
      test_api_key: removeUrl?.test_api_key,
      live_api_key: removeUrl?.live_api_key,
      test_ip: removeUrl?.test_ip,
      live_ip: removeUrl?.live_ip,
      test_webhook_url: removeUrl?.test_webhook_url,
      live_webhook_url: removeUrl?.live_webhook_url,
    },
  });
};

// developer data
exports.getDeveloperData = async (req, res) => {
  const apiSettingInfo = await getApiSettingByFilter(
    { merchant_id: req.merchantId },
    "live_api_key test_api_key test_ip live_ip test_webhook_url live_webhook_url",
    { lean: true }
  );

  if (!apiSettingInfo) {
    throw new AppError(400, "Failed to fetch api details");
  }

  const apiSettingData = {
    test_api_key: apiSettingInfo?.test_api_key,
    live_api_key: apiSettingInfo?.live_api_key,
    test_ip: apiSettingInfo?.test_ip,
    live_ip: apiSettingInfo?.live_ip,
    test_webhook_url: apiSettingInfo?.test_webhook_url,
    live_webhook_url: apiSettingInfo?.live_webhook_url,
  };

  res.status(200).json({
    message: "Data fetched successfully",
    error: false,
    data: {
      apiSettingData,
    },
  });
};
