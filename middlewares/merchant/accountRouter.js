//update mobile number
router
  .post(
    "/update-mobile/send-email-otp",
    otpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("sendEmailOtp api", sendEmailOtpForMobileChange)
  )
  .post(
    "/update-mobile/verify-email-otp",
    verifyOtpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync(
      "verifyEmailOtpForMobileChange api",
      verifyEmailOtpForMobileChange
    )
  )
  .post(
    "/update-mobile/send-mobile-otp",
    otpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("sendMobileOtpForMobileChange api", sendMobileOtpForMobileChange)
  )
  .post(
    "/update-mobile",
    verifyOtpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsyncWithSession("changeMobileNumber api", changeMobileNumber)
  );

//update email id
router
  .post(
    "/update-email/send-mobile-otp",
    otpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("sendMobileOtpForEmailChange api", sendMobileOtpForEmailChange)
  )
  .post(
    "/update-email/verify-mobile-otp",
    verifyOtpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync(
      "verifyMobileOtpForEmailChange api",
      verifyMobileOtpForEmailChange
    )
  )
  .post(
    "/update-email/send-email-otp",
    otpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("sendEmailOtpForEmailChange api", sendEmailOtpForEmailChange)
  )
  .post(
    "/update-email",
    verifyOtpValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("changeEmailId api", changeEmailId)
  );

//update-password
router
  .post(
    "/update-password/send-email-otp",
    updatePasswordBodyValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("sendOtpToChangePassword api", sendOtpToChangePassword)
  )
  .post(
    "/update-password",
    verifyOtpToChangePasswordValidator,
    catchAsync("verifyUserToken middleware", verifyUserToken),
    catchAsync("updatePassword api", updatePassword)
  );

router.get(
  "/get-account-details",
  catchAsync("verifyMerchantToken middleware", verifyUserToken),
  catchAsync("getAccountDetails api", getAccountData)
);

module.exports = router;