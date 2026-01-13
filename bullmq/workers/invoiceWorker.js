const { Worker } = require("bullmq");

const {
  handleIssueInvoice,
  handleExpireInvoice,
} = require("../processors/invoiceProcessor");
const { INVOICE_QUEUE_NAME } = require("../queues/invoiceQueue");
const { redis } = require("./../redis");
const { logger } = require("../../utils/winstonLogger");

// create worker
const invoiceWorker = new Worker(
  INVOICE_QUEUE_NAME,
  async (job) => {
    try {
      if (job.name === "ISSUE_INVOICE") {
        await handleIssueInvoice(job.data);
      }

      if (job.name === "EXPIRE_INVOICE") {
        await handleExpireInvoice(job.data);
      }
    } catch (err) {
      logger.warn(`Job failed | id=${job.id}`);
      throw err;
    }
  },
  { connection: redis }
);

// worker events
invoiceWorker.on("completed", (job, result) => {
  logger.info(
    `[INVOICE_WORKER] Job completed | id=${job.id} | name=${job.name}`,
    result
  );
});

invoiceWorker.on("failed", async (job, err) => {
  if (!job) {
    logger.error("[INVOICE_WORKER] Job failed but job is undefined", err);
    return;
  }

  const attemptsMade = job.attemptsMade;
  const maxAttempts = job.opts?.attempts || 1;

  logger.error(
    `[INVOICE_WORKER] Job failed | id=${job.id} | name=${
      job.name
    } | attempt=${attemptsMade}/${maxAttempts} | error=${
      err.message || err.stack
    }`
  );

  // final failure (no retries left)
  if (attemptsMade >= maxAttempts) {
    logger.warn(
      `[INVOICE_WORKER] Job permanently failed | id=${job.id} | invoiceId=${job.data?.invoiceId}`
    );

    // update invoice status ...............
  }
});

invoiceWorker.on("stalled", (jobId) => {
  logger.warn(`[INVOICE_WORKER] Job stalled | jobId=${jobId}`);
});

invoiceWorker.on("error", (err) => {
  logger.error("[INVOICE_WORKER] Worker error", err);
});
