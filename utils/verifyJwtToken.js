const jwt = require("jsonwebtoken");

exports.verifyJwtToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.USER_JWT_SECRET, {
      ignoreExpiration: false,
    });

    if (decodedToken) {
      return {
        message: "Token verified successfully",
        error: false,
        data: null,
      };
    } else {
      return {
        message: "Error in token verification",
        error: true,
        data: decodedToken,
      };
    }
  } catch (err) {
    let message =
      err?.name === "TokenExpiredError"
        ? err?.message || "Token has expired"
        : err?.name === "JsonWebTokenError"
        ? err?.message || "Invalid token"
        : err?.name === "NotBeforeError"
        ? err?.message || "Invalid token"
        : "Session expired";
    return {
      message: message,
      error: true,
      data: null,
    };
  }
};
