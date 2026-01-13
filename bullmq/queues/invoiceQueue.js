const { Queue } = require("bullmq");
require("dotenv").config();

const { redis } = require("./../redis");
const { logger } = require("../../utils/winstonLogger");

// queue name
const INVOICE_QUEUE_NAME = "invoice-queue";

// create queue
const invoiceQueue = new Queue(INVOICE_QUEUE_NAME, {
  connection: redis,
});

// queue event listeners
invoiceQueue.on("error", (error) => {
  logger.error(
    `${INVOICE_QUEUE_NAME} (producer) unknown error ==> ${JSON.stringify(
      error
    )}`
  );
});

module.exports = {
  invoiceQueue,
  INVOICE_QUEUE_NAME,
};
