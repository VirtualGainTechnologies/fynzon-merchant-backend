const puppeteer = require("puppeteer");
const { logger } = require("./winstonLogger");

exports.generateInvoicePdfBuffer = async (invoiceData) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(await generateInvoiceHtml(invoiceData), {
      waitUntil: "load",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    const buffer = Buffer.from(pdfBuffer);
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(pdfBuffer);
  } catch (err) {
    logger.error(`PDF generation failed: ${err.message}`);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const generateInvoiceHtml = async (data) => {
  const {
    company_logo,
    contact_name,
    contact_email,
    contact_phone,
    contact_address,
    deposit_crypto,
    deposit_network,
    deposit_address,
    invoice_number,
    order_description,
    conversion_rate,
    items,
    contact_type,
    userCategory,
    discount_percentage,
    tax_percentage,
    total_currency_amount,
    issueDate,
    dueDate,
    qrCode,
    merchant,
    tax_id,
    company_name,
  } = data;

  const base_currency = conversion_rate.currency;
  const isBuilder = userCategory?.toLowerCase() === "builder";

  const formatCurrency = (num) => {
    const digit = base_currency == "AED" ? 3 : 2;
    return Number(num || 0)
      .toFixed(digit)
      .replace(/\B(?=(\d{digit})+(?!\d))/g, ",");
  };

  /* ---------------- TABLE HEADERS ---------------- */
  const tableHeader = isBuilder
    ? `
      <tr style="height: 30px; background-color: aliceblue;">
        <th style="text-align: start; border-top: 1px solid grey;padding-left:10px">Project Name</th>
        <th style="text-align: center; border-top: 1px solid grey;">Unit Number</th>
        <th style="text-align: center; border-top: 1px solid grey;">Price</th>
        <th style="text-align: center; border-top: 1px solid grey;">Total (${base_currency})</th>
      </tr>
    `
    : `
      <tr style="height: 30px; background-color: aliceblue;">
        <th style="text-align: start; border-top: 1px solid grey;padding-left:10px;">Item</th>
        <th style="text-align: center; border-top: 1px solid grey;">Quantity</th>
        <th style="text-align: center; border-top: 1px solid grey;">Price Per Quantity</th>
        <th style="text-align: center; border-top: 1px solid grey;">Total (${base_currency})</th>
      </tr>
    `;

  /* ---------------- TABLE ROWS ---------------- */
  const tableRows = items
    .map((item) => {
      if (isBuilder) {
        const price = Number(item.price || 0);

        return `
          <tr style="height: 30px;">
            <td style="text-align: start; border-top: 1px solid grey;padding-left:10px">
              ${item.project_name || "Project"}
            </td>
            <td style="text-align: center; border-top: 1px solid grey;">
              ${item.unit_number || "-"}
            </td>
            <td style="text-align: center; border-top: 1px solid grey;">
              ${formatCurrency(price)}
            </td>
            <td style="text-align: center; border-top: 1px solid grey;">
              ${formatCurrency(price)} ${base_currency}
            </td>
          </tr>
        `;
      }

      const quantity = Number(item.quantity || 0);
      const price = Number(item.price_per_quantity || 0);
      const itemTotal = quantity * price;

      return `
        <tr style="height: 30px;">
          <td style="text-align: start; border-top: 1px solid grey;padding-left:10px">
            ${item.name || "Item"}
          </td>
          <td style="text-align: center; border-top: 1px solid grey;">
            ${quantity}
          </td>
          <td style="text-align: center; border-top: 1px solid grey;">
            ${formatCurrency(price)}
          </td>
          <td style="text-align: center; border-top: 1px solid grey;">
            ${formatCurrency(itemTotal)} ${base_currency}
          </td>
        </tr>
      `;
    })
    .join("");

  const taxAmount = (total_currency_amount * (tax_percentage || 0)) / 100;
  const discountAmount =
    (total_currency_amount * (discount_percentage || 0)) / 100;
  const totalCurrencyAmount =
    total_currency_amount + taxAmount - discountAmount;
  const totalCryptoAmount =
    (totalCurrencyAmount * conversion_rate.crypto_amount) /
    conversion_rate.currency_amount;
  /* ---------------- HTML TEMPLATE ---------------- */
  return `
<div style="
  width: 800px;
  padding-inline: 30px;
  padding-block: 10px;
  background: white;
  color: black;
  font-family: Arial, sans-serif;
  font-size: 12px;
">

  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div style="font-size: 32px; font-weight: 600;">Invoice</div>
    ${
      company_logo
        ? `<img src="${company_logo}" alt="company_logo" width="30" height="30" />`
        : ""
    }
  </div>

  <hr style="margin: 15px 0;" />

  <!-- Invoice Details -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Invoice Details</div>

    <div style="display: flex; justify-content: space-between; margin-top: 12px;">
      <div>
        <p>Invoice Number: ${invoice_number || "N/A"}</p>
        <p>Issue Date: ${issueDate}</p>
        <p>Due Date: ${dueDate}</p>
      </div>
      <div style="max-width:320px;">
        <p>Base Currency: ${base_currency}</p>
        <p>
          Conversion Rate:
          ${conversion_rate?.currency_amount || "N/A"} ${base_currency}
          = 1 ${conversion_rate?.crypto || deposit_crypto}
        </p>
        <p>Order Description: ${order_description || "N/A"}</p>
      </div>
    </div>
  </div>

  <!-- Amount Details -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Amount Details</div>

    <table style="width: 100%; margin-top: 20px; border-spacing: 0; font-size: 10px;border-bottom:1px solid grey">
      ${tableHeader}
      ${tableRows}
    </table>

    <div style="margin-top: 20px;">
     <div><b>Price Breakup:</b></div>
      <div style="display: flex; justify-content: space-between;margin-block:5px">
        <div>Total Invoice Amount:</div>
        <div>${formatCurrency(total_currency_amount)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <div>Tax (${tax_percentage || 0}%):</div>
        <div>${formatCurrency(taxAmount)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between;margin-block:5px">
        <div>Discount (${discount_percentage || 0}%):</div>
        <div>${formatCurrency(discountAmount)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: 600;margin-block:10px">
        <div><b>Amount to be Paid:</b></div>
        <div style="color: dodgerblue;">
          ${totalCryptoAmount.toFixed(6)} ${deposit_crypto}
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Wallet -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Payment Wallet Details</div>
    <div style="display: flex; justify-content: space-between;">
    <div>
    <p>Crypto: ${deposit_crypto}</p>
    <p>Network: ${deposit_network}</p>
    <p>Network Address: ${deposit_address}</p>
    </div>
    <div>
    ${qrCode ? `<img src="${qrCode}" width="100" />` : ""}
    </div>
    </div>
  </div>

  <!-- Received By -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Received By</div>
    <div style="display: flex; justify-content: space-between;">
    <div>
    <p>Contact Name: ${contact_name}</p>
    <p>Contact Type: ${contact_type}</p>
    <p>Email: ${contact_email}</p>
    <p>Phone: ${contact_phone || "N/A"}</p>
    <p>Company Name: ${company_name || "N/A"}</p>
    <p>Registration/Tax Id: ${tax_id || "N/A"}</p>

    </div>
    <div style="max-width:320px;">
    <p>Address: ${contact_address.full_address}</p>
    <p>City: ${contact_address.city}</p>
    <p>State: ${contact_address.state || "N/A"}</p>
    <p>Country: ${contact_address.country}</p>
    <p>Zip Code: ${contact_address.zip || "N/A"}</p>
    </div>
    </div>
  </div>

  <!-- Received From -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Received From</div>
    <div style="display: flex; justify-content: space-between;">
    <div>
    <p>${merchant.type == "INDIVIDUAL" ? "Full Name" : "Business Name"}:${merchant.name}</p>
    <p>Email:${merchant.email}</p>
    </div>
    <div style="max-width:320px;">
    <p>Phone:${merchant.phone}</p>
    <p>Address:${merchant.address}</p>
    </div>
    </div>
  </div>

</div>
`;
};
