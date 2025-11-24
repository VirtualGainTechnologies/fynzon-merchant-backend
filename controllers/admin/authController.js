const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const AppError = require("../../utils/AppError");
const {
  getAdminByFilter,
  createAdmin,
  updateAdminByFilter,
  getAllAdminByFilter,
  updateAdminById,
} = require("../../services/admin/authServices");
const { sendOtpToEmail, sendOtpToMobile } = require("../../utils/sendOtp");
const { verifyOtp } = require("../../utils/verifyOtp");
const { generateToken } = require("../../utils/jwtGenerator");
const { verifyJwtToken } = require("../../utils/verifyJwtToken");

// validate admin
exports.validateAdmin = async (req, res) => {
  const req_body = { ...req.body };

  const payload = {
    ...(req_body.email && {
      email: req_body.email,
    }),
    ...(req_body.phone && {
      phone: req_body.phone,
    }),
  };

  const userData = await getAdminByFilter(payload, "_id", {
    lean: true,
  });

  const response = userData
    ? {
        message: payload?.email
          ? "This email is already in use"
          : payload?.phone
          ? "This phone number is already in use"
          : "",
        error: false,
        data: {
          userExists: true,
        },
      }
    : {
        message: payload?.email
          ? "This email is available to use"
          : payload?.phone
          ? "This phone number is available to use"
          : "",
        error: false,
        data: {
          userExists: false,
        },
      };

  res.status(200).json(response);
};

// Register Super Admin
exports.registerSuperAdmin = async (req, res) => {
  const req_body = { ...req.body };

  const isSuperAdminExist = await getAdminByFilter({}, null, {
    lean: true,
  });
  if (isSuperAdminExist) {
    throw new AppError(400, "Super admin already exists");
  }
  const token = generateToken({ email: req_body.email });
  if (token.error) {
    throw new AppError(400, token.message);
  }

  const admin = await createAdmin({
    user_name: req_body.userName,
    phone_code: req_body.phoneCode,
    phone: req_body.phone,
    email: req_body.email,
    password: req_body.password,
    token: token?.data,
    role: "SUPER-ADMIN",
    last_login_ip: req.ipAddress,
    last_login_location: req.locationDetails,
    last_login_date: new Date().getTime(),
  });
  if (!admin) {
    throw new AppError(400, "Failed to register super admin");
  }

  // set token in cookie
  res.cookie("admin_token", admin.token, {
    httpOnly: false,
    secure: "auto",
    maxAge: process.env.COOKIE_EXPIRATION_MILLISECONDS * 1,
    signed: true,
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Registration successful",
    error: false,
    data: null,
  });
};

// Register Sub Admin
exports.upsertSubAdmin = async (req, res) => {
  const req_body = { ...req.body };
  if (req.role !== "SUPER-ADMIN") {
    throw new AppError(400, "Only super admin is allowed to register subadmin");
  }
  let response = {};

  if (!req_body?.userId) {
    if (!req_body.password) {
      throw new AppError(400, "Password is missing");
    }
    const isSubAdminExist = await getAdminByFilter(
      {
        $or: [
          { user_name: req_body.userName },
          { email: req_body.email },
          { phone_code: req_body.phoneCode, phone: req_body.phone },
        ],
      },
      "_id",
      {
        lean: true,
      }
    );

    if (isSubAdminExist) {
      throw new AppError(400, "Account already exists");
    }
    const token = generateToken({ email: req_body.email });

    if (token.error) {
      throw new AppError(400, token.message);
    }
    // create account
    const admin = await createAdmin({
      user_name: req_body.userName,
      phone_code: req_body.phoneCode,
      phone: req_body.phone,
      email: req_body.email,
      password: req_body.password,
      token: token.data,
      role: req_body.role,
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
      last_login_date: new Date().getTime(),
    });
    if (!admin) {
      throw new AppError(400, "Failed to create admin");
    }
    response = admin;
  } else {
    const updateAdmin = await updateAdminById(
      new mongoose.Types.ObjectId(req_body.userId),
      {
        user_name: req_body.userName,
        phone_code: req_body.phoneCode,
        phone: req_body.phone,
        email: req_body.email,
        ...(req_body.password && {
          password: await bcrypt.hash(req_body.password, 12),
        }),
        role: req_body.role,
      }
    );
    if (!updateAdmin) {
      throw new AppError(400, "Failed to update admin");
    }
    response = updateAdmin;
  }
  delete response.token;
  delete response.password;

  res.status(200).json({
    message: req_body.userId
      ? "Admin profile updated successfully"
      : "Registration successful",
    error: false,
    data: response,
  });
};

// Send Admin Login OTP
exports.sendAdminLoginOtp = async (req, res) => {
  const req_body = { ...req.body };

  if (!req_body.email) {
    throw new AppError(400, "Email is required to send OTP");
  }

  // send OTP to email only
  const sendOtp = await sendOtpToEmail({
    email: req_body.email,
    type: "login",
  });

  if (sendOtp?.error) {
    throw new AppError(400, sendOtp.message || "Failed to send OTP");
  }

  res.status(200).json({
    message: "OTP sent to email",
    error: false,
    data: sendOtp?.data,
  });
};

// Verify Admin Login OTP
exports.verifyAdminLoginOtp = async (req, res) => {
  const req_body = { ...req.body };

  // verify otp
  const verifiedOtp = await verifyOtp(req_body.otpId, req_body.otp);
  if (verifiedOtp.error) {
    throw new AppError(400, verifiedOtp.message || "Invalid OTP");
  }

  const filter = {
    ...(req_body.email && { email: req_body.email }),
    ...(req_body.phoneCode && req_body.phone && { phone: req_body.phone }),
  };

  // check the admin
  const admin = await getAdminByFilter(
    filter,
    "-_id email phone_code phone role",
    { lean: true }
  );

  if (!admin) {
    const message = filter?.email
      ? "Email is not registered"
      : filter.phone
      ? "Phone number is not registered"
      : "You are not registered";
    throw new AppError(400, message);
  }

  const token = generateToken({ email: admin.email });
  if (token.error) {
    throw new AppError(400, token.message);
  }

  // update token
  const updateAdminToken = await updateAdminByFilter(
    { email: admin.email },
    {
      token: token?.data,
      last_login_date: new Date().getTime(),
      login_count: 0,
      is_login_attempt_exceeded: false,
    },
    { new: true }
  );
  if (!updateAdminToken) {
    throw new AppError(400, "Failed to update token");
  }

  // set token in cookie
  res.cookie("admin_token", updateAdminToken.token, {
    httpOnly: false,
    secure: "auto",
    maxAge: process.env.COOKIE_EXPIRATION_MILLISECONDS * 1,
    signed: true,
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Login successful",
    error: false,
    data: {
      role: updateAdminToken.role,
      userName: updateAdminToken.user_name,
      email: updateAdminToken.email,
    },
  });
};

//logout
exports.logout = async (req, res) => {
  const token = req.signedCookies["admin_token"];
  if (token) {
    await updateAdminByFilter({ token }, { token: "" }, { new: true });
  }
  // remove cookies
  res.clearCookie("token");

  res.status(200).json({
    message: "Logged out successfully",
    error: false,
    data: null,
  });
};

// get admin details
exports.getAdminProfile = async (req, res) => {
  const token = req.signedCookies["admin_token"];
  if (!token) {
    const response = {
      message: "Admin token is missing",
      error: false,
      data: null,
    };
    return res.status(200).json(response);
  }

  const tokenData = verifyJwtToken(token);
  if (tokenData.error) {
    const response = {
      message: tokenData.message,
      error: false,
      data: null,
    };
    return res.status(200).json(response);
  }

  const adminData = await getAdminByFilter(
    { token },
    "-_id role user_name phone_code phone email status",
    {
      lean: true,
    }
  );

  if (!adminData) {
    const response = {
      message: "Failed to fetch admin details",
      error: false,
      data: null,
    };
    return res.status(200).json(response);
  }

  if (adminData.status === "BLOCKED") {
    const response = {
      message:
        "Your account has been temporarily restricted due to security concerns",
      error: false,
      data: null,
    };
    return res.status(200).json(response);
  }

  res.status(200).json({
    message: "Data fetched successfully",
    error: false,
    data: {
      role: adminData.role,
      userName: adminData.user_name,
      email: adminData.email,
      phoneCode: adminData.phone_code,
      phone: adminData.phone,
      status: adminData.status,
    },
  });
};

// Retrieve a list of all sub-admins
exports.getAllSubAdmins = async (req, res, next) => {
  if (req.role !== "SUPER-ADMIN") {
    throw new AppError(400, "Access Denied");
  }

  const result = await getAllAdminByFilter(
    { role: { $ne: "SUPER-ADMIN" } },
    "_id user_name email phone_code phone role status createdAt",
    { lean: true }
  );

  if (!result || result.length <= 0) {
    throw new AppError(400, "No records found");
  }

  res.status(200).json({
    message: "Sub-admins retrieved successfully",
    error: false,
    data: {
      totalRecords: result.length,
      result,
    },
  });
};
