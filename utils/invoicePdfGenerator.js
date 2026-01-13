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
    return Buffer.from(pdfBuffer);
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
    invoice_number,
    newIssueDate,
    due_date,
    base_currency,
    conversion_rate,
    invoice_discription,
    items,
    discount_percentage,
    tax_percentage,
    deposit_crypto,
    deposit_network,
    deposit_address,
    qrCode,
    contact_name,
    contact_type,
    contact_email,
    contact_phone,
    address,
    company_name,
  } = data;

  const issueDate = newIssueDate || data.issue_date;
  const dueDate = due_date;

  // Calculate totals
  let subtotal = 0;
  const tableRows = items
    .map((item) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      return `
      <tr style="height: 30px;">
        <td style="text-align: center; border-top: 1px solid grey;">${
          item.name || "Item"
        }</td>
        <td style="text-align: center; border-top: 1px solid grey;">${
          item.quantity
        }</td>
        <td style="text-align: center; border-top: 1px solid grey;">${item.price.toFixed(
          2
        )}</td>
        <td style="text-align: center; border-top: 1px solid grey;">${itemTotal.toFixed(
          3
        )} ${base_currency}</td>
      </tr>
    `;
    })
    .join("");

  const taxAmount = (subtotal * (tax_percentage || 18)) / 100;
  const discountAmount = (subtotal * (discount_percentage || 2)) / 100;
  const finalAmountCrypto = conversion_rate?.crypto_amount;

  const formatCurrency = (num) =>
    num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
    <!-- You can add logo here if you want -->
    <!-- <img src="https://fynzon-test-public-files.s3.ap-south-1.amazonaws.com/image-15-11-2024-105-fynzonlogo_2png" alt="Fynzon Logo" style="height: 60px;" /> -->
  </div>

  <hr style="margin: 15px 0;" />

  <!-- Invoice Details -->
  <div style="
    border: 1px solid grey;
    padding-inline: 40px;
    padding-block: 20px;
    border-radius: 10px;
    margin-top: 10px;
    color: black;
  ">
    <div style="font-weight: 600; font-size: 16px;">Invoice Details</div>
    <div style="display: flex; justify-content: space-between; margin-top: 12px;">
      <div>
        <p>Invoice Number: ${invoice_number || "N/A"}</p>
        <p>Issue Date: ${issueDate}</p>
        <p>Due Date: ${dueDate}</p>
      </div>
      <div style="max-width: 320px;">
        <p>Base Currency: ${base_currency || "AED"}</p>
        <p>Conversion Rate: ${
          conversion_rate?.currency_amount || "30"
        } ${base_currency} = 1 ${conversion_rate?.crypto || "USDT"}</p>
        <p>Order Description: ${invoice_discription || "N/A"}</p>
      </div>
    </div>

    <div style="margin-top: 15px;">
      <div style="
        background-color: whitesmoke;
        padding: 10px;
        border-radius: 5px;
        font-weight: 500;
      ">
        Please note that the invoice will be issued on ${issueDate} and will be valid until ${dueDate}
      </div>
    </div>
  </div>

  <!-- Amount Details -->
  <div style="
    border: 1px solid grey;
    padding-inline: 40px;
    padding-block: 20px;
    border-radius: 10px;
    margin-top: 10px;
    color: black;
  ">
    <div style="font-weight: 600; font-size: 16px;">Amount Details</div>

    <table style="
      width: 100%;
      margin-block: 20px;
      padding: 0;
      border-spacing: 0;
      border-bottom: 1px solid grey;
      font-size: 10px;
    ">
      <tr style="height: 30px; background-color: aliceblue;">
        <th style="text-align: center; border-top: 1px solid grey;">Item</th>
        <th style="text-align: center; border-top: 1px solid grey;">Quantity</th>
        <th style="text-align: center; border-top: 1px solid grey;">Price Per Quantity</th>
        <th style="text-align: center; border-top: 1px solid grey;">Total (${base_currency})</th>
      </tr>
      ${tableRows}
    </table>

    <div>
      <h4 style="font-weight: 400; margin: 0 0 12px 0;">Price Breakup:</h4>
      <div style="display: flex; justify-content: space-between; margin-block: 10px;">
        <div>Total Invoice Amount:</div>
        <div style="text-align: end;">${formatCurrency(
          subtotal
        )} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-block: 10px;">
        <div>Tax (${tax_percentage || "N/A"}%):</div>
        <div style="text-align: end;">${formatCurrency(
          taxAmount
        )} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-block: 10px;">
        <div>Discount (${discount_percentage || "N/A"}%):</div>
        <div style="text-align: end;">${formatCurrency(
          discountAmount
        )} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-block: 10px; font-weight: 600;">
        <div>Amount will be paid:</div>
        <div style="text-align: end; color: dodgerblue; font-weight: 600;">
          ${finalAmountCrypto} ${deposit_crypto || "N/A"}
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Wallet Details -->
  <div style="
    border: 1px solid grey;
    padding-inline: 40px;
    padding-block: 20px;
    border-radius: 10px;
    margin-top: 10px;
    color: black;
  ">
    <div style="font-weight: 600; font-size: 16px;">Payment Wallet Details</div>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 12px;">
      <div style="text-align: start; margin-top: 8px;">
        <div>Crypto: ${deposit_crypto || "N/A"}</div>
        <div style="margin-block: 8px;">Network: ${
          deposit_network || "N/A"
        }</div>
        <div>Network Address: ${deposit_address || "N/A"}</div>
      </div>
      <div style="text-align: start;">
       <img alt="qr_code" width="100" src="${qrCode}" />
      </div>
    </div>
  </div>

  <!-- Received By (Merchant / Business) -->
  <div style="
    border: 1px solid grey;
    padding-inline: 40px;
    padding-block: 20px;
    border-radius: 10px;
    margin-top: 10px;
    color: black;
  ">
    <div style="font-weight: 600; font-size: 16px;">Received By</div>
    <div style="display: flex; justify-content: space-between; margin-block: 12px;">
      <div>
        <div style="margin-block: 8px;">Contact Name: ${
          contact_name || "N/A"
        }</div>
        <div style="margin-block: 8px;">Contact Type: ${
          contact_type || "N/A"
        }</div>
        <div style="margin-block: 8px;">Email: ${contact_email || "N/A"}</div>
        <div style="margin-block: 8px;">Phone: ${contact_phone || "N/A"}</div>
        <div style="margin-block: 8px;">Company Name:${
          company_name || "N/A"
        }</div>
        <div style="margin-block: 8px;">Registration / Tax Id: tax345</div>
      </div>
      <div style="max-width: 320px; margin-left: 10px;">
        <div style="margin-block: 8px;">Address: ${
          address?.full_address || "N/A"
        }</div>
        <div style="margin-block: 8px;">City: ${address?.city || "N/A"}</div>
        <div style="margin-block: 8px;">State: ${address?.state || "N/A"}</div>
        <div style="margin-block: 8px;">Country: ${address?.country}</div>
        <div style="margin-block: 8px;">Zip Code: ${address?.zip || "N/A"}</div>
      </div>
    </div>
  </div>

  <!-- Received From (Customer) -->
  <div style="
    border: 1px solid grey;
    padding-inline: 40px;
    padding-block: 20px;
    border-radius: 10px;
    margin-top: 10px;
    color: black;
  ">
    <div style="font-weight: 600; font-size: 16px;">Received From</div>
    <div style="display: flex; justify-content: space-between; margin-top: 12px;">
      <div>
        <div style="margin-block: 8px;">Full Name: ${contact_name}</div>
        <div style="margin-block: 8px;">Email: ${contact_email}</div>
      </div>
      <div style="max-width: 320px; margin-left: 10px;">
        <div style="margin-block: 8px;">Phone: ${contact_phone}</div>
        <div style="margin-block: 8px;">
          Address: ${address?.full_address}
        </div>
      </div>
    </div>
  </div>
</div>
  `;
};
