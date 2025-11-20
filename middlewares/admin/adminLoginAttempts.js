const {
  getAdminByFilter,
  updateAdminById,
} = require("../../services/admin/authServices");
const AppError = require("../../utils/AppError");

exports.checkAdminLoginAttempts = async (req, res, next) => {
  //check admin exists or not
  const filter = {
    ...(req.body?.email && {
      email: req.body?.email,
    }),
    ...(req.body?.phone && {
      phone_code: req.body?.phoneCode,
      phone: req.body?.phone,
    }),
  };

  // check admin exists or not
  const admin = await getAdminByFilter(
    filter,
    "_id email phone phone_code is_login_attempt_exceeded login_count password status",
    {}
  );

  if (!admin) {
    throw new AppError(
      400,
      `${filter.email ? "Email" : "Phone number"} is not registered`
    );
  }

  if (admin.status === "BLOCKED") {
    return res.status(400).json({
      message:
        "Your account has been temporarily restricted due to security concerns",
      error: true,
      errorCode: "BLOCKED",
      data: null,
    });
  }

  // check login attempt exceeded or not
  if (admin.is_login_attempt_exceeded) {
    return res.status(400).json({
      message:
        "You have exceeded the allowed number of login attempts, reset password to login again",
      error: true,
      errorCode: "MULTIPLE_LOGIN_TRIED",
      data: null,
    });
  }

  if (req.body.email) {
    // match the password
    const isPasswordMatched = await admin.comparePassword(req.body.password);
    if (!isPasswordMatched) {
      // increase the login count
      await admin.incrementLoginCount();

      // check login attempt
      if (admin.login_count >= 5) {
        // block the user
        const updatedAdmin = await updateAdminById(
          admin._id,
          { is_login_attempt_exceeded: true },
          { new: true }
        );

        if (!updatedAdmin) {
          throw new AppError(400, "Error in updating the admin");
        }
      }

      throw new AppError(400, "Incorrect password");
    }
  }

  //update login ip, location and date
  const updatedUser = await updateAdminById(
    admin._id,
    {
      last_login_ip: req.ipAddress,
      last_login_location: req.locationDetails,
      last_login_date: new Date().getTime(),
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError(400, "Error in updating details");
  }

  if (req.body?.password) {
    //match the password
    const isPasswordMatched = await admin.comparePassword(req.body.password);

    if (!isPasswordMatched) {
      //increase the login count
      await admin.incrementLoginCount();

      //check login attempt
      if (admin.login_count >= 5) {
        //block the user
        const updatedUser = await updateAdminById(
          admin._id,
          { is_login_attempt_exceeded: true },
          { new: true }
        );

        if (!updatedUser) {
          throw new AppError(400, "Error in updating");
        }
      }

      throw new AppError(400, "Incorrect password");
    }
  }

  req.admin = admin;

  next();
};
