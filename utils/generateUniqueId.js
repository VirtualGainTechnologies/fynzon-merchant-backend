const { generateApiKey } = require("generate-api-key");

exports.generateUniqueId = (length = 10) => {
  const uniqueId = generateApiKey({
    method: "string",
    length: length * 1,
    pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  return uniqueId;
};
