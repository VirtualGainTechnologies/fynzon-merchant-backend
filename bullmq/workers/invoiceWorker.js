const { Worker } = require("bullmq");

const {
  handleDispatchInvoice,
  handleExpireInvoice,
} = require("../processors/invoiceProcessor");
const { INVOICE_QUEUE_NAME } = require("../queues/invoiceQueue");
const { redis, redlock } = require("./../redis");
const { logger } = require("../../utils/winstonLogger");
const { updateInvoiceById } = require("../../services/merchant/invoiceService");

const LOCK_TTL = 20 * 60 * 1000; // 20 minutes
const CONCURRENCY = parseInt(process.env.INVOICE_WORKER_CONCURRENCY, 10) || 5;

// create worker
const invoiceWorker = new Worker(
  INVOICE_QUEUE_NAME,
  async (job) => {
    let lock;
    const lockKey = `lock:${job.id}`;
    try {
      lock = await redlock.acquire([lockKey], LOCK_TTL);
      logger.info(`Lock acquired: ${lockKey}`);

      if (job.name === "ISSUE_INVOICE") {
        await handleDispatchInvoice(job.data);
      }

      if (job.name === "EXPIRE_INVOICE") {
        await handleExpireInvoice(job.data);
      }
    } catch (err) {
      logger.warn(`Job failed | id=${job.id}`);
      throw err;
    } finally {
      if (lock) {
        try {
          await lock.release();
          logger.info(`Lock released: ${lockKey}`);
        } catch (err) {
          logger.warn(
            `Failed to release lock ${lockKey}: ${err && err.message}`
          );
        }
      }
    }
  },
  {
    connection: redis,
    concurrency: CONCURRENCY,
    lockDuration: LOCK_TTL,
    lockRenewTime: 60 * 1000,
    stalledInterval: 5 * 60 * 1000,
    maxStalledCount: 2,
  }
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

    // update invoice status
    try {
      const updatedInvoice = await updateInvoiceById(
        job.data?._id,
        { status: "FAILED" },
        { new: true }
      );

      if (!updatedInvoice) {
        logger.error(`[INVOICE_WORKER] Failed to update invoice status`);
      }
    } catch (err) {
      logger.error(
        `[INVOICE_WORKER] Failed to update invoice status | error=${err.message}`
      );
    }
  }
});

invoiceWorker.on("stalled", (jobId) => {
  logger.warn(`[INVOICE_WORKER] Job stalled | jobId=${jobId}`);
});

invoiceWorker.on("error", (err) => {
  logger.error("[INVOICE_WORKER] Worker error", err);
});
