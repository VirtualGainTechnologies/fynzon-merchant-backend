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
    mode,
    companyLogo,
    company_name,
    contact_name,
    contact_type,
    contact_email,
    contact_phone,
    contact_address,
    deposit_crypto,
    deposit_network,
    deposit_address,
    invoice_number,
    invoice_type,
    order_description,
    conversion_rate,
    issue_date,
    due_date,
    cron_pattern,
    items,
    userCategory,
    discount_percentage,
    tax_percentage,
    total_currency_amount,
    total_crypto_amount,
    newIssueDate,
    newDueDate,
    base_currency = "AED",
    qrCode,
  } = data;

  const issueDate = newIssueDate || issue_date;
  const dueDate = newDueDate || due_date;

  let subtotal = 0;
  const isBuilder = userCategory?.toLowerCase() === "builder";

  const formatCurrency = (num) =>
    Number(num || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  /* ---------------- TABLE HEADERS ---------------- */
  const tableHeader = isBuilder
    ? `
      <tr style="height: 30px; background-color: aliceblue;">
        <th style="text-align: start; border-top: 1px solid grey;">Project</th>
        <th style="text-align: center; border-top: 1px solid grey;">Unit</th>
        <th style="text-align: center; border-top: 1px solid grey;">Price</th>
        <th style="text-align: center; border-top: 1px solid grey;">Total (${base_currency})</th>
      </tr>
    `
    : `
      <tr style="height: 30px; background-color: aliceblue;">
        <th style="text-align: start; border-top: 1px solid grey;">Item</th>
        <th style="text-align: center; border-top: 1px solid grey;">Quantity</th>
        <th style="text-align: center; border-top: 1px solid grey;">Price / Qty</th>
        <th style="text-align: center; border-top: 1px solid grey;">Total (${base_currency})</th>
      </tr>
    `;

  /* ---------------- TABLE ROWS ---------------- */
  const tableRows = items
    .map((item) => {
      if (isBuilder) {
        const price = Number(item.price || 0);
        subtotal += price;

        return `
          <tr style="height: 30px;">
            <td style="text-align: start; border-top: 1px solid grey;">
              ${item.projectName || "Project"}
            </td>
            <td style="text-align: center; border-top: 1px solid grey;">
              ${item.unitNumber || "-"}
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
      const price = Number(item.pricePerQuantity || 0);
      const itemTotal = quantity * price;
      subtotal += itemTotal;

      return `
        <tr style="height: 30px;">
          <td style="text-align: start; border-top: 1px solid grey;">
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

  const taxAmount = (subtotal * (tax_percentage || 0)) / 100;
  const discountAmount = (subtotal * (discount_percentage || 0)) / 100;
  const finalPayable = subtotal + taxAmount - discountAmount;

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
    <img src="${companyLogo || ""}" alt="company_logo" width="30" height="30" />
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
      <div>
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

    <table style="width: 100%; margin-top: 20px; border-spacing: 0; font-size: 10px;">
      ${tableHeader}
      ${tableRows}
    </table>

    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between;">
        <div>Subtotal:</div>
        <div>${formatCurrency(subtotal)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <div>Tax (${tax_percentage || 0}%):</div>
        <div>${formatCurrency(taxAmount)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <div>Discount (${discount_percentage || 0}%):</div>
        <div>${formatCurrency(discountAmount)} ${base_currency}</div>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: 600;">
        <div>Amount to be Paid:</div>
        <div style="color: dodgerblue;">
          ${
            total_crypto_amount || formatCurrency(finalPayable)
          } ${deposit_crypto}
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Wallet -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Payment Wallet Details</div>
    <p>Crypto: ${deposit_crypto}</p>
    <p>Network: ${deposit_network}</p>
    <p>Address: ${deposit_address}</p>
    ${qrCode ? `<img src="${qrCode}" width="100" />` : ""}
  </div>

  <!-- Received By -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Received By</div>
    <p>${company_name || "N/A"}</p>
    <p>${contact_email}</p>
    <p>${contact_phone}</p>
    <p>${contact_address?.full_address || ""}</p>
  </div>

  <!-- Received From -->
  <div style="border: 1px solid grey; padding: 20px 40px; border-radius: 10px; margin-top: 10px;">
    <div style="font-weight: 600; font-size: 16px;">Received From</div>
    <p>${contact_name}</p>
    <p>${contact_email}</p>
  </div>

</div>
`;
};
