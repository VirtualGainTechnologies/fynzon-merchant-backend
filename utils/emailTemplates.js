exports.getOtpEmailTemplate = async (emailObject) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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

exports.getWelcomeRegistartionTemplate = async (emailObject) => {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
          Welcome to Fynzon
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
                  <td style="text-align: center; padding: 10px 0 0px 0">
                    <img
                      src="https://mykyc-images.s3.ap-south-1.amazonaws.com/25-07-2023-bgfavicon.png"
                      alt="fynzon-logo"
                      title="fynzon-logo"
                      width="30"
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
                  <td style="text-align: center; padding: 0px 10px 5px 0">
                    <p
                      style="
                        font-size: 20px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span
                        style="
                          font-weight: bold;
                          text-shadow: 5px 5px 4px #003399;
                        "
                      >
                        WELCOME TO FYNZON
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 18px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        Greetings ${emailObject.userName}
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 15px;
                        line-height: 1.5;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      We are thrilled to welcome you to the world of web3
                      technology
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- <tr>
            <td style="padding: 0">
              <table
                width="100%"
                style="border-spacing: 0; background-color: #00162b"
                role="presentation"
              >
                <tr>
                  <td style="text-align: center; padding: 0px 0px 0px 0x">
                    <img
                      src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/04-11-2023-welcome_to_fynzon.png"
                      alt="payzon-welcome-img"
                      title="payzon-welcome-img"
                      width="300"
                      border="0"
                    />
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 0px 0px 0px 0x">
                    <img
                      src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/04-11-2023-welcome_to_markzon.png"
                      alt="payzon-welcome-img"
                      title="payzon-welcome-img"
                      width="300"
                      border="0"
                    />
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 0px 0px 0px 0x">
                    <img
                      src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/04-11-2023-welcome_to_payzon.png"
                      alt="payzon-welcome-img"
                      title="payzon-welcome-img"
                      width="300"
                      border="0"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr> -->

          <tr>
            <td style="padding: 0">
              <table
                width="100%"
                style="border-spacing: 0; background-color: #00162b"
                role="presentation"
              >
                <tr>
                  <td style="text-align: center; padding: 5px 10px 5px 0">
                    <p
                      style="
                        font-size: 15px;
                        padding: 0;
                        color: #ffcc00 !important;
                      "
                    >
                      To avail more services, you have to complete the KYC
                    </p>
                    <button
                      type="submit"
                      style="
                        font-size: 15px;
                        border-radius: 13px;
                        font-weight: bold;
                        padding: 10px !important;
                        background-color: #2389c6;
                        border: unset;
                      "
                    >
                      <a
                        href="${emailObject.kycUrl}"
                        target="__blank"
                        style="color: white; text-decoration: none !important"
                        >Complete KYC</a
                      >
                    </button>
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
                      Fynzon, India's largest web3 based portal
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
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
          Your OTP to login into fynzon
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
                  <td style="text-align: center; padding: 20px 0 0px 0">
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
                  <td style="text-align: center; padding: 0px 10px 5px 0">
                    <p
                      style="
                        font-size: 20px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span
                        style="
                          font-weight: bold;
                          text-shadow: 5px 5px 4px #003399;
                        "
                      >
                        Hello ${emailObject.userName}
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 18px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        You've successfully logged into your Fynzon account just
                        now
                      </span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr style="text-align: center">
            <td>
              <table
                width="80%"
                align="center"
                style="
                  border-spacing: 0;
                  background-color: #2389c6;
                  border-radius: 15px;
                "
                role="presentation"
              >
                <tr>
                  <td style="text-align: center; padding: 0px">
                    <p
                      style="
                        font-size: 15px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        Device : ${emailObject.device}
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 15px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        IP Address : ${emailObject.ipAddress}
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 15px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        Location : ${emailObject.location}
                      </span>
                    </p>
                    <p
                      style="
                        font-size: 15px;
                        padding: 0;
                        color: #ffffff !important;
                      "
                    >
                      <span style="font-weight: bold">
                        Time : ${emailObject.time}
                      </span>
                    </p>
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
                  <td style="text-align: center; padding: 0px 10px 5px 0">
                    <p
                      style="
                        font-size: 12px;
                        padding: 0;
                        color: #e6b800 !important;
                      "
                    >
                      <span style="font-weight: bold">
                        We send this email as a security measure each time you
                        login to your account. If this was not you, please
                        <a
                          href="${emailObject.contactUsUrl}"
                          target="__blank"
                          style="color: #2389c6 !important; text-decoration: none !important"
                          >contact us</a
                        >
                        immediately so we can look into it.
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
                      Fynzon, India's largest web3 based portal
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

exports.kycCompletionEmailTemplate = async (emailObject) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #fef3dc;
      font-family: Arial, sans-serif;
      color: #dadada;
    "
  >
    <table
      align="center"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width: 100%;
        max-width: 736px;
        margin: 20px auto;
        background-color: #00162b;
        border: 1px solid #222;
        padding: 20px;
      "
    >
      <tr>
        <td style="text-align: center; padding: 20px">
          <img
            src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-20-11-2024-331-fynzonlogopng"
            alt="Fynzon Logo"
            style="width: 150px; height: 30px"
          />
        </td>
      </tr>
      <tr>
        <td
          style="
            padding: 10px 20px;
            text-align: center;
            font-size: 25px;
            font-weight: 600;
            color: #ffffff;
          "
        >
          KYC Verification Successfully Completed
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 20px 0">
          <img
            src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-20-11-2024-145-kyc1png"
            alt="KYC Image"
            style="width: 360px; height: 200px"
          />
        </td>
      </tr>
      <tr>
        <td
          style="
            padding: 15px 20px;
            font-size: 14px;
            line-height: 1.5;
            color: #dadada;
          "
        >
          Dear ${emailObject.userName},<br /><br />
          We’re pleased to inform you that your KYC verification has been
          successfully completed. You now have full access to all features and
          services on Fynzon.<br /><br />
          If you have any questions, feel free to contact us at
          <a href="mailto:support@fynzon.com" style="color: #e6b800"
            >support@fynzon.com</a
          >
          or
          <a href="tel:+919922011055" style="color: #e6b800">+91 99220 11055</a
          >.
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 20px">
          <a
            href=${emailObject.btnURL}
            style="
              background-color: #3E30D4;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 25px;
              font-size: 16px;
              font-weight: 500;
              border-radius: 5px;
              display: inline-block;
            "
            >Login</a
          >
        </td>
      </tr>
      <tr>
        <td
          style="
            padding: 20px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            color: #dadada;
            border-top: 2px solid #2389c6;
          "
        >
          <h2 style="margin: 10px 0; font-size: 15px; color: #ffffff">
            Fynzon, India’s Leading web3 based portal
          </h2>
          <a
            href="https://www.fynzon.com"
            style="color: #e6b800; text-decoration: none"
            >www.fynzon.com</a
          >
          |
          <a
            href="mailto:support@fynzon.com"
            style="color: #e6b800; text-decoration: none"
            >support@fynzon.com</a
          >
          | +91 99220 11055
        </td>
      </tr>
      <tr>
        <td style="text-align: center">
          <center>
            <div
              style="
                align-items: center;
                text-align: center;
                width: 397px;
                font-weight: 500;
                height: 32px;
                gap: 24px;
                opacity: 0px;
                border-top: 0.8px solid #2389c6;
                padding: 15px 0;
              "
            >
              Get Connected &nbsp;&nbsp;&nbsp;
              <a
                href="https://www.facebook.com/Fynzon/"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                  alt="facebook-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://www.instagram.com/fynzon/"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                  alt="instagram-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://t.me/cremittalk"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-567-Frame-27125.png"
                  alt="telegram-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://x.com/fynzonteam"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                  alt="twitter-img"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://linkedin.com/company/fynzon"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                  alt="linkedIn-img"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://www.youtube.com/@fynzoncryptoexchange"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-623-Frame-27126.png"
                  alt="youtube-image"
                  style="width: 20px"
                />
              </a>
            </div>
          </center>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

exports.getFailedLoginLockoutEmailTemplate = async (emailObject) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #fef3dc;
      font-family: Arial, sans-serif;
      color: #dadada;
    "
  >
    <table
      align="center"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width: 100%;
        max-width: 736px;
        margin: 20px auto;
        background-color: #00162b;
        border: 1px solid #222;
        padding: 20px;
      "
    >
      <!-- Header -->
      <tr>
        <td style="text-align: center; padding: 20px">
          <img
            src="https://fynzon-test-public-files.s3.ap-south-1.amazonaws.com/image-15-11-2024-105-fynzonlogo_2png"
            alt="Fynzon Logo"
            style="width: 150px; height: 30px"
          />
        </td>
      </tr>

      <!-- Title -->
      <tr>
        <td
          style="
            padding: 10px 20px;
            text-align: center;
            font-size: 25px;
            font-weight: 600;
            color: #ffffff;
          "
        >
          Suspicious Activity on Your Fynzon Account
        </td>
      </tr>

      <!-- Illustration -->
      <tr>
        <td style="text-align: center; padding: 20px 0">
          <img
            src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/image-03-06-2025-322-suspicious_activitypng"
            alt="Suspicious Activity"
            style="width: 200px; height: 200px"
          />
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td
          style="
            padding: 15px 20px;
            font-size: 14px;
            line-height: 1.5;
            color: #dadada;
          "
        >
          Dear ${emailObject.userName},<br /><br />
          We detected <strong>${emailObject.maxAttempts}</strong> failed login
          attempts on your account. For your security, your account has been
          temporarily locked for
          <strong>${emailObject.lockoutTime}</strong> hours.<br /><br />
          You can try again after this period. If these login attempts were not
          made by you, please contact our support team immediately.<br /><br />
          Contact us at
          <a href="mailto:support@fynzon.com" style="color: #e6b800"
            >support@fynzon.com</a
          >
          or call
          <a href="tel:+919922011055" style="color: #e6b800">+91 99220 11055</a
          >.<br /><br />
          Thank you for helping us keep your account secure.<br /><br />
          <strong>Team Fynzon</strong>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td
          style="
            padding: 20px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            color: #dadada;
            border-top: 2px solid #2389c6;
          "
        >
          <h2 style="margin: 10px 0; font-size: 15px; color: #ffffff">
            Fynzon, India’s Leading web3 based portal
          </h2>
          <a
            href="https://www.fynzon.com"
            style="color: #e6b800; text-decoration: none"
            >www.fynzon.com</a
          >
          |
          <a
            href="mailto:support@fynzon.com"
            style="color: #e6b800; text-decoration: none"
            >support@fynzon.com</a
          >
          | +91 99220 11055
        </td>
      </tr>

      <!-- Social Links -->
      <tr>
        <td style="text-align: center">
          <center>
            <div
              style="
                align-items: center;
                text-align: center;
                width: 397px;
                height: 32px;
                gap: 24px;
                opacity: 0px;
                border-top: 0.8px solid #2389c6;
                padding: 15px 0;
              "
            >
              Get Connected &nbsp;&nbsp;&nbsp;
              <a
                href="https://www.facebook.com/Fynzon/"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-583-Frame-27129.png"
                  alt="facebook-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://www.instagram.com/fynzon/"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-216-Frame-27128.png"
                  alt="instagram-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://t.me/cremittalk"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-567-Frame-27125.png"
                  alt="telegram-image"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://x.com/fynzonteam"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-173-Frame-27127.png"
                  alt="twitter-img"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://linkedin.com/company/fynzon"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-826-linked-in.png"
                  alt="linkedIn-img"
                  style="width: 20px"
                />
              </a>
              <a
                href="https://www.youtube.com/@fynzoncryptoexchange"
                target="_blank"
                style="text-decoration: none"
              >
                <img
                  src="https://fynzon-prod-public-files.s3.ap-south-1.amazonaws.com/crypto-02-08-2024-623-Frame-27126.png"
                  alt="youtube-image"
                  style="width: 20px"
                />
              </a>
            </div>
          </center>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
