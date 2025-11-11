exports.getOtpEmailTemplate = async (emailObject) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="htt://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title></title>
      <style type="text/css">
        @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");
  
        p {
          font-size: 15px;
        }
        img {
          border: 0;
        }
        a {
          color: #ffffff !important;
          text-decoration: underline !important;
        }
  
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        @media (prefers-color-scheme: dark) {
          body,
          center,
          table {
            color: #ffffff !important;
          }
          .darkmode-transparent {
            background-color: transparent !important;
          }
        }
      </style>
      <!--[if (gte mso 9)|(IE)]>
        <style type="text/css">
          table {
            border-collapse: collapse !important;
          }
        </style>
      <![endif]-->
    </head>
    <body
      style="margin: 0px; padding: 0; min-width: 100%; background-color: #fef3dc"
    >
      <!--[if (gte mso 9)|(IE)]>
        <style type="text/css">
          body {
            background-color: #fef3dc !important;
          }
          body,
          table,
          td,
          p,
          a {
            font-family: sans-serif, Arial, Helvetica !important;
          }
        </style>
      <![endif]-->
      <center
        style="
          width: 100%;
          table-layout: fixed;
          background-color: #fef3dc;
          padding-top: 20px;
          padding-bottom: 20px;
        "
      >
        <div
          style="
            max-width: 600px;
            background-color: #003399;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          "
        >
          <div
            style="
              font-size: 0px;
              color: #fafdfe;
              line-height: 1px;
              mso-line-height-rule: exactly;
              display: none;
              max-width: 0px;
              max-height: 0px;
              opacity: 0;
              overflow: hidden;
              mso-hide: all;
            "
          >
            Your OTP to ${emailObject.type} into fynzon
          </div>
          <!--[if (gte mso 9)|(IE)]>
                         <table width="600" align="center" style="border-spacing:0;color:#003399;" role="presentation">
                         <tr>
                         <td style="padding:0;">
                      <![endif]-->
  
          <table
            align="center"
            style="
              border-spacing: 0;
              color: #00162b;
              font-family: 'Lato', sans-serif, Arial, Helvetica !important;
              background-color: #00162b;
              margin: 0;
              padding: 0;
              width: 100%;
              max-width: 600px;
            "
            role="presentation"
          >
            <tr>
              <td style="padding: 0">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                >
                  <tr>
                    <td height="3" style="background-color: #2389c6"></td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr>
              <td style="padding: 0">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                >
                  <tr>
                    <td style="text-align: center; padding: 50px 0 0px 0">
                      <img
                        src="https://mykyc-images.s3.ap-south-1.amazonaws.com/25-07-2023-bgfavicon.png"
                        alt="fynzon-logo"
                        title="fynzon-logo"
                        width="40"
                        border="0"
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr>
              <td style="padding: 0">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                >
                  <tr>
                    <td style="text-align: center; padding: 0px 20px 5px 20px">
                      <p
                        style="
                          font-size: 15px;
                          padding-top: 20px;
                          color: #ffffff !important;
                        "
                      >
                        <span style="font-weight: bold">
                          You are receiving this email because a request was made
                          for a one-time-password that can be used for
                          authentication
                        </span>
                      </p>
                      <p
                        style="
                          font-size: 20px;
                          padding-top: 20px;
                          color: #ffffff !important;
                        "
                      >
                        <span
                          style="
                            font-weight: bold;
                            text-shadow: 5px 5px 4px #003399;
                          "
                        >
                          Your one time password (OTP) is
                        </span>
                      </p>
                      <p
                        style="
                          font-size: 20px;
                          padding-top: 20px;
                          color: #ffffff !important;
                        "
                      >
                        <span
                          style="
                            font-weight: bold;
                            background-color: #2389c6;
                            padding: 5px 15px 5px 15px;
                            border-radius: 20px;
                          "
                        >
                          ${emailObject.otp}
                        </span>
                      </p>
                      <p
                        style="
                          font-size: 12px;
                          padding-top: 15px;
                          color: red !important;
                        "
                      >
                        <span style="font-weight: bold">
                          The OTP is valid for 5 minutes
                        </span>
                      </p>
                      <p
                        style="
                          font-size: 12px;
                          padding-top: 15px;
                          color: #e6b800 !important;
                        "
                      >
                        <span style="font-weight: bold">
                          Note:- Never share this OTP to any one including a
                          person from fynzon.
                        </span>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 15px">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                >
                  <tr>
                    <td height="0.5" style="background-color: #2389c6"></td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr>
              <td style="padding: 0">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                  ;
                >
                  <tr>
                    <td
                      style="text-align: center; padding: 5px 0px 5px 5px"
                      width="50%"
                    >
                      <p
                        style="
                          font-size: 12px;
                          padding: 0;
                          color: #ffffff !important;
                        "
                      >
                        Fynzon, India's Leading web3 based portal
                      </p>
                      <p
                        style="
                          font-size: 10px;
                          padding: 0;
                          color: #ffffff !important;
                        "
                      >
                        www.fynzon.com | support@fynzon.com | +91 9922011055
                      </p>
                    </td>
                    <td
                      style="padding: 5px 0px 5px 0px; text-align: center"
                      width="50%"
                    >
                      <p
                        style="
                          font-size: 12px;
                          padding: 0;
                          color: #ffffff !important;
                        "
                      >
                        Get Connected
                      </p>
                      <p style="padding: 0">
                      <a
                        href="https://www.facebook.com/Fynzon/"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                          alt="facebook-image"
                          width="20"
                          border="0"
                      /></a>

                      <a
                        href="https://www.instagram.com/fynzon/"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                          alt="instagram-image"
                          width="20"
                          border="0"
                      /></a>
                      <a
                        href="https://t.me/cremittalk"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-567-Frame-27125.png"
                          alt="telegram-image"
                          width="20"
                          border="0"
                      /></a>
                      <a
                        href="https://x.com/fynzonteam"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                          alt="twitter-img"
                          width="20"
                          border="0"
                      /></a>
                      <a
                        href="https://linkedin.com/company/fynzon"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                          alt="linkedIn-img"
                          width="20"
                          border="0"
                      /></a>
                      <a
                        href="https://www.youtube.com/@fynzoncryptoexchange"
                        target="__blank"
                        style="text-decoration: none !important"
                        ><img
                          src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-623-Frame-27126.png"
                          alt="youtube-image"
                          width="20"
                          border="0"
                      /></a>
                    </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
  
            <tr>
              <td style="padding: 0px">
                <table
                  width="100%"
                  style="border-spacing: 0; background-color: #00162b"
                  role="presentation"
                >
                  <tr>
                    <td height="3" style="background-color: #2389c6"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
  
          <!--[if (gte mso 9)|(IE)]>
                      </td>
                      </tr>
                      </table>
                      <![endif]-->
        </div>
      </center>
    </body>
  </html>  
  `;
};

exports.getWelcomeLoginTemplate = async (emailObject) => {
  return `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title></title>
  <style type="text/css">
    @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");
    a {
      text-decoration: none !important;
    }

    .responsiveDiv {
        margin-right: 5%;
        display: inline-block;
      }

      .parentDiv {
        margin-left: 20px;
      }

      @media (max-width: 431px) {
        .responsiveDiv {
          width: 100%;
          margin-top: 8px;
        }
      }

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }

    @media (prefers-color-scheme: dark) {

      .darkmode-transparent {
        background-color: transparent !important;
      }
    }
  </style>
</head>

<body style="min-width: 100%; background-color: #fff;color:#000;">
  <table align="center" style="font-family: 'Lato', sans-serif, Arial, Helvetica !important;
        border-spacing:0;
        margin-top: 5px;
        padding: 0;
        width: 100%;
        max-width: 600px;
        border: #000 1px solid;
        border-radius: 10px;
        " role="presentation">

    <tr style="background-color: #D6F0FF; height:75px;">
      <td style="padding: 0;border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-278-pezon_full_logo_3png" alt="pezon-logo" style="margin-left: 20px;" title="pezon-logo">
      </td>
    </tr>

    <tr>
      <td style="padding: 0">
        <table width="100%" style="border-spacing: 0;" role="presentation">
          <tr>
            <td>
              <p style="
                font-size: 21px;
                font-weight: bold;
                margin: 20px;
                color: #1E1E1E !important;
              ">
                New Login Detected on Your Pezon India Account
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 0">
              <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-406-loginjpg" alt="Login_img" title="Login_img" width="120" height="120" />
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">Dear <span style="font-weight: bold;">${emailObject.userName}</span>,</p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                A login was detected from:
              </p>
              <p style="margin: 15px 20px;"><span style="font-weight: bold;">IP Address:</span>${emailObject.ipAddress}</p>

              <p style="margin: 10px 20px;"><span style="font-weight: bold;">Location:
                </span>${emailObject.location}</p>

              <p style="margin: 15px 20px;"><span style="font-weight: bold;">Time:</span>${emailObject.time}</p>

              <p style="margin: 15px 20px;">
                If this was you, ignore this email. If not, secure your account by resetting your password or contact us at <a style="color:#0068FF; ">support@pezon.in</a> 
              </p>

              <p style="margin: 10px 20px;">Stay safe!</p>

              <p style="font-weight: bold; margin: 10px 20px;">Team Pezon India</p>

            </td>
          </tr>

          <tr style="background-color: #D6F0FF; height:150px; border-radius:10px; ">
            <td style=" border-bottom-left-radius: 10px;border-bottom-right-radius: 10px; margin:0;">
              <p style="font-weight:bold; margin: 10px 20px; font-size:16px;">
                Pezon India we make transaction’s easy, fast and secure
              </p>
             <div class="parentDiv">
                  <a class="responsiveDiv" style="color: #0068ff"
                    >www.pezon.in
                  </a>

                  <a class="responsiveDiv" style="color: #0068ff">
                    support@pezon.in
                  </a>

                  <span class="responsiveDiv">+91 99220 11055</span>
                </div>

              <hr style="color:#C8C7C7; margin-top:15px;">

              <p style="font-size:16px; font-weight: bold; margin:10px 20px;">Get Connected</p>

              <p style="padding: 0; margin:10px 20px;">
                <a href="https://www.facebook.com/pezonpayout" target="__blank"
                  style="text-decoration: none !important"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                    style="width:30px; color:black; margin:0 10px 0 0;" alt="facebook-image" /></a>

                <a href="https://www.instagram.com/pezonindia/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                    style="width:30px; color:black; margin:0 10px;" alt="instagram-image" /></a>
                <a href="https://x.com/_payzon" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                    style="width:30px; color:black; margin:0 10px;" alt="twitter-img" /></a>
                <a href="https://www.linkedin.com/company/106961979/admin/dashboard/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                    style="width:30px; color:black; margin:0 10px;" alt="linkedIn-img" /></a>
                
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>

</html>`;
};

exports.getWelcomeRegistartionTemplate = async (emailObject) => {
  return `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title></title>
  <style type="text/css">
    @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");
    a {
      text-decoration: none !important;
    }

    .responsiveDiv {
        margin-right: 5%;
        display: inline-block;
      }

      .parentDiv {
        margin-left: 20px;
      }

      @media (max-width: 431px) {
        .responsiveDiv {
          width: 100%;
          margin-top: 8px;
        }
      }

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }

    @media (prefers-color-scheme: dark) {

      .darkmode-transparent {
        background-color: transparent !important;
      }
    }
  </style>
</head>

<body style="min-width: 100%; background-color: #fff;color:#000;">
  <table align="center" style="font-family: 'Lato', sans-serif, Arial, Helvetica !important;
 border-spacing:0;
 margin-top: 5px;
 padding: 0;
 width: 100%;
 max-width: 600px;
 border: #000 1px solid;
 border-radius: 10px;
" role="presentation">

    <tr style="background-color: #D6F0FF; height:75px;">
      <td style="padding: 0;border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-278-pezon_full_logo_3png" alt="pezon-logo" style="margin-left: 20px;" title="pezon-logo">
      </td>
    </tr>

    <tr>
      <td style="padding: 0">
        <table width="100%" style="border-spacing: 0;" role="presentation">
          <tr>
            <td>
              <p style="
                font-size: 21px;
                font-weight: bold;
                margin:20px;
                color: #1E1E1E !important;
              ">
                Welcome to Pezon India – Your Account is Successfully Registered!
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 0">
              <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-179-registrationpng" alt="Registration_img" title="Registration_img" width="100" height="110" />
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">Dear <span style="font-weight: bold;">${emailObject.userName}</span>,</p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                Thank you for registering with Pezon India! Your account has been successfully created, and you can now
                enjoy seamless payout and pay-in services.
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-weight: bold; margin: 10px 20px;">Next Steps:</p>
              <ul style="font-weight: bold;  margin: 10px 20px;">
                <li>Complete your KYC to unlock all features.</li>
                <li>Explore our dashboard for easy transactions.</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td style="text-align: center;">
              <button type="submit" style="
                        width:200px;
                        height:45px;
                        margin-top:15px;
                        font-size: 15px;
                        border-radius: 13px;
                        font-weight: bold;
                        padding: 10px !important;
                        background-color: #2389c6;
                        border: unset;
                      ">
                <a href="${emailObject.kycUrl}" target="__blank"
                  style="color: white; text-decoration: none !important">Complete KYC</a>
              </button>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">Need help? Contact us at <a style="color:#0068FF; ">support@pezon.in</a> or
                call
                <a href="" style="color:#0068FF; ">+91 99220 11055.</a>
              </p>

              <p style="margin: 15px 20px;">Welcome aboard!</p>

              <p style="font-weight: bold; margin: 15px 20px;">Team Pezon India</p>
            </td>
          </tr>

          <tr style="background-color: #D6F0FF; height:150px; border-radius:10px; ">
            <td style=" border-bottom-left-radius: 10px;border-bottom-right-radius: 10px; margin:0;">
              <p style="font-weight:bold; margin: 10px 20px; font-size:16px;">
                Pezon India we make transaction’s easy, fast and secure
              </p>
             <div class="parentDiv">
                  <a class="responsiveDiv" style="color: #0068ff"
                    >www.pezon.in
                  </a>

                  <a class="responsiveDiv" style="color: #0068ff">
                    support@pezon.in
                  </a>

                  <span class="responsiveDiv">+91 99220 11055</span>
                </div>

              <hr style="color:#C8C7C7; margin-top:15px;">

              <p style="font-size:16px; font-weight: bold; margin:10px 20px;">Get Connected</p>

              <p style="padding: 0; margin:10px 20px;">
                <a href="https://www.facebook.com/pezonpayout" target="__blank"
                  style="text-decoration: none !important"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                    style="width:30px; color:black; margin:0 10px 0 0;" alt="facebook-image" /></a>

                <a href="https://www.instagram.com/pezonindia/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                    style="width:30px; color:black; margin:0 10px;" alt="instagram-image" /></a>
                <a href="https://x.com/_payzon" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                    style="width:30px; color:black; margin:0 10px;" alt="twitter-img" /></a>
                <a href="https://www.linkedin.com/company/106961979/admin/dashboard/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                    style="width:30px; color:black; margin:0 10px;" alt="linkedIn-img" /></a>
                
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>

</html>`;
};

exports.getPasswordResetSuccessTemplate = async (emailObject) => {
  return `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title></title>
  <style type="text/css">
    @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");
    a {

      text-decoration: none !important;
    }

    .responsiveDiv {
        margin-right: 5%;
        display: inline-block;
      }

      .parentDiv {
        margin-left: 20px;
      }

      @media (max-width: 431px) {
        .responsiveDiv {
          width: 100%;
          margin-top: 8px;
        }
      }

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }

    @media (prefers-color-scheme: dark) {

      .darkmode-transparent {
        background-color: transparent !important;
      }
    }
  </style>
</head>

<body style="min-width: 100%; background-color: #fff;color:#000;">
  <table align="center" style="font-family: 'Lato', sans-serif, Arial, Helvetica !important;
 border-spacing:0;
 margin-top: 5px;
 padding: 0;
 width: 100%;
 max-width: 600px;
 border: #000 1px solid;
 border-radius: 10px;
" role="presentation">

    <tr style="background-color: #D6F0FF; height:75px;">
      <td style="padding: 0;border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-278-pezon_full_logo_3png" alt="pezon-logo" style="margin-left: 20px;" title="pezon-logo">
      </td>
    </tr>

    <tr>
      <td style="padding: 0">
        <table width="100%" style="border-spacing: 0;" role="presentation">
          <tr>
            <td>
              <p style="
                font-size: 21px;
                font-weight: bold;
                margin:20px;
                color: #1E1E1E !important;
              ">
                Your Pezon India Password Has Been Reset Successfully!
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 0">
              <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-03-06-2025-442-password_resetpng" alt="PasswordReset_Img" title="PasswordReset_Img" width="100" height="110" />
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">Dear <span style="font-weight: bold;">${emailObject.userName}</span>,</p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                Your password was successfully reset on, ${emailObject.time}.
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                If you didn’t make this change, secure your account immediately:
              </p>
              <ol style="margin: 10px 15px;">
                <li>
                  Reset your password again.
                </li>
                <li>
                  Contact support at <a style="color:#0068FF; ">support@pezon.in</a>
                </li>
              </ol>
            
              
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-weight: bold; margin: 15px 20px;">Team Pezon India</p>
            </td>
          </tr>

          <tr style="background-color: #D6F0FF; height:150px; border-radius:10px; ">
            <td style=" border-bottom-left-radius: 10px;border-bottom-right-radius: 10px; margin:0;">
              <p style="font-weight:bold; margin: 10px 20px; font-size:16px;">
                Pezon India we make transaction’s easy, fast and secure
              </p>
              
               <div class="parentDiv">
                  <a class="responsiveDiv" style="color: #0068ff"
                    >www.pezon.in
                  </a>

                  <a class="responsiveDiv" style="color: #0068ff">
                    support@pezon.in
                  </a>

                  <span class="responsiveDiv">+91 99220 11055</span>
                </div>

              
              <hr style="color:#C8C7C7; margin-top:15px;">

              <p style="font-size:16px; font-weight: bold; margin:10px 20px;">Get Connected</p>

              <p style="padding: 0; margin:10px 20px;">
                <a href="https://www.facebook.com/pezonpayout" target="__blank"
                  style="text-decoration: none !important"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                    style="width:30px; color:black; margin:0 10px 0 0;" alt="facebook-image" /></a>

                <a href="https://www.instagram.com/pezonindia/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                    style="width:30px; color:black; margin:0 10px;" alt="instagram-image" /></a>
                <a href="https://x.com/_payzon" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                    style="width:30px; color:black; margin:0 10px;" alt="twitter-img" /></a>
                <a href="https://www.linkedin.com/company/106961979/admin/dashboard/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                    style="width:30px; color:black; margin:0 10px;" alt="linkedIn-img" /></a>
                
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>

</html>`;
};

exports.getFailedLoginLockoutEmailTemplate = async (emailObject) => {
  return `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title></title>
  <style type="text/css">
    @import url("https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap");
    a {
      text-decoration: none !important;
    }

    .responsiveDiv {
        margin-right: 5%;
        display: inline-block;
      }

      .parentDiv {
        margin-left: 20px;
      }

      @media (max-width: 431px) {
        .responsiveDiv {
          width: 100%;
          margin-top: 8px;
        }
      }

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }

    @media (prefers-color-scheme: dark) {
      .darkmode-transparent {
        background-color: transparent !important;
      }
    }
  </style>
</head>

<body style="min-width: 100%; background-color: #fff;color:#000;">
  <table align="center" style="font-family: 'Lato', sans-serif, Arial, Helvetica !important;
 border-spacing:0;
 margin-top: 5px;
 padding: 0;
 width: 100%;
 max-width: 600px;
 border: #000 1px solid;
 border-radius: 10px;
" role="presentation">

    <tr style="background-color: #D6F0FF; height:75px;">
      <td style="padding: 0;border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-05-05-2025-278-pezon_full_logo_3png" alt="pezon-logo" style="margin-left: 20px;" title="pezon-logo">
      </td>
    </tr>

    <tr>
      <td style="padding: 0">
        <table width="100%" style="border-spacing: 0;" role="presentation">
          <tr>
            <td>
              <p style="
                font-size: 21px;
                font-weight: bold;
                margin:20px;
                color: #1E1E1E !important;
              ">
                Suspicious Activity on Your Pezon India Account
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 0">
              <img src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-03-06-2025-322-suspicious_activitypng" alt="SuspiciousAct_Img" title="SuspiciousAct_Img" width="105" height="110" />
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">Dear <span style="font-weight: bold;">${emailObject.userName}</span>,</p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                We detected ${emailObject.maxAttempts} failed login attempts on your account. For security, we’ve temporarily locked it for ${emailObject.lockoutTime} hours.
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">
                Try after ${emailObject.lockoutTime} hours.
              </p>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin: 10px 20px;">If this wasn’t you, contact us at <a style="color:#0068FF; ">support@pezon.in</a></p>
              
            </td>
          </tr>

          <tr>
            <td>
              <p style="font-weight: bold; margin: 15px 20px;">Team Pezon India</p>
            </td>
          </tr>

          <tr style="background-color: #D6F0FF; height:150px; border-radius:10px; ">
            <td style=" border-bottom-left-radius: 10px;border-bottom-right-radius: 10px; margin:0;">
              <p style="font-weight:bold; margin: 10px 20px; font-size:16px;">
                Pezon India we make transaction’s easy, fast and secure
              </p>
              <div class="parentDiv">
                  <a class="responsiveDiv" style="color: #0068ff"
                    >www.pezon.in
                  </a>

                  <a class="responsiveDiv" style="color: #0068ff">
                    support@pezon.in
                  </a>

                  <span class="responsiveDiv">+91 99220 11055</span>
                </div>

              <hr style="color:#C8C7C7; margin-top:15px;">

              <p style="font-size:16px; font-weight: bold; margin:10px 20px;">Get Connected</p>

              <p style="padding: 0; margin:10px 20px;">
                <a href="https://www.facebook.com/pezonpayout" target="__blank"
                  style="text-decoration: none !important"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                    style="width:30px; color:black; margin:0 10px 0 0;" alt="facebook-image" /></a>

                <a href="https://www.instagram.com/pezonindia/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                    style="width:30px; color:black; margin:0 10px;" alt="instagram-image" /></a>
                <a href="https://x.com/_payzon" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                    style="width:30px; color:black; margin:0 10px;" alt="twitter-img" /></a>
                <a href="https://www.linkedin.com/company/106961979/admin/dashboard/" target="__blank"><img
                    src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                    style="width:30px; color:black; margin:0 10px;" alt="linkedIn-img" /></a>
                
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>

</html>`;
};
