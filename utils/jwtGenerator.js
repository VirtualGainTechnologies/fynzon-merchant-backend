const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token.
 *
 * @param {Object} payload - The payload to include in the token.
 * @param {string} secretKey - The secret key to sign the token.
 * @param {Object} [options] - Optional settings such as `expiresIn`.
 * @returns {string} - The generated JWT token.
 */

exports.generateToken = (
  payload = {},
  secretKey = process.env.USER_JWT_SECRET,
  options = { expiresIn: process.env.USER_JWT_EXPIRES_IN }
) => {
  try {
    const token = jwt.sign(payload, secretKey, options);
    return {
      message: "Token generated successfully",
      error: false,
      data: token,
    };
  } catch (err) {
    return {
      message: err.message || "Failed to generate token",
      error: true,
      data: null,
    };
  }
};
