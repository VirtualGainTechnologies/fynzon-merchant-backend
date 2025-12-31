const puppeteer = require("puppeteer");

const generatePdfController = async (req, res) => {
  const { html, fileName } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
    });

    return res.send(pdf);
  } catch (error) {
    console.error("PDF generation error:", error);
    return res.status(500).json({ message: "PDF generation failed" });
  }
};

module.exports = { generatePdfController };
