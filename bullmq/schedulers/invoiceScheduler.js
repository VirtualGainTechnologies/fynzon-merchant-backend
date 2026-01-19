const moment = require("moment-timezone");

const { invoiceQueue } = require("../queues/invoiceQueue");
const { logger } = require("../../utils/winstonLogger");
const { buildCronPattern } = require("../../utils/dateHelper");

exports.scheduleInvoiceDispatch = async (data) => {
  try {
    const { issue_date, _id, tz = "UTC" } = data;
    const jobId = String(`issue-invoice-${_id}`);
    await invoiceQueue.add(
      "ISSUE_INVOICE",
      { _id, tz },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
        delay: Math.max(
          moment(issue_date, "YYYY-MM-DD", true, tz)
            .startOf("day")
            .diff(moment().tz(tz)),
          0
        ),
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    logger.info(`Invoice issue job added | jobId: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to add invoice issue job: ${err.message}`);
    throw err;
  }
};

exports.scheduleRecurringInvoiceDispatch = async (data) => {
  try {
    const {
      recurring: { every, day, date, month },
      _id,
      tz = "UTC",
    } = data;
    const jobId = String(`issue-invoice-${_id.toString()}`);
    const cron = buildCronPattern({ every, day, date, month });
    await invoiceQueue.add(
      "ISSUE_INVOICE",
      { _id, tz },
      {
        jobId,
        removeOnComplete: false,
        removeOnFail: false,
        repeat: {
          cron,
          tz,
        },
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    logger.info(`Invoice issue job added | jobId: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to add invoice issue job: ${err.message}`);
    throw err;
  }
};

exports.scheduleInvoiceExpiry = async (data) => {
  try {
    const { due_date, _id, tz = "UTC" } = data;
    const jobId = String(`expire-invoice-${_id.toString()}`);

    await invoiceQueue.add(
      "EXPIRE_INVOICE",
      { _id },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
        delay: Math.max(
          moment
            .tz(due_date, "YYYY-MM-DD", true, tz)
            .endOf("day")
            .diff(moment().tz(tz)),
          0
        ),
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    logger.info(`Invoice expiry job added | jobId: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to add invoice expiry job: ${err.message}`);
    throw err;
  }
};

exports.scheduleRecurringInvoiceExpiry = async (data) => {
  try {
    const { issue_date, _id, due_days } = data;
    const jobId = String(
      `expire-invoice-${_id.toString()}-${new Date(issue_date).getTime()}`
    );
    await invoiceQueue.add(
      "EXPIRE_INVOICE",
      { _id },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
        delay: parseInt(due_days) * 24 * 60 * 60 * 1000,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    logger.info(`Invoice expiry job added | jobId: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to add invoice expiry job: ${err.message}`);
    throw err;
  }
};

exports.scheduleInvoiceAlert = async (data) => {
  try {
    const { alert_date, _id, tz = "UTC" } = data;
    const jobId = String(
      `alert-invoice-${_id} -${new Date(alert_date).getTime()} `
    );
    await invoiceQueue.add(
      "INVOICE_ALERT",
      { _id, tz },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
        delay: Math.max(
          moment(alert_date, "YYYY-MM-DD", true, tz)
            .startOf("day")
            .diff(moment().tz(tz)),
          0
        ),
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
    logger.info(`Invoice alert job added | jobId: ${jobId}`);
  } catch (err) {
    logger.error(`Failed to add invoice alert job: ${err.message}`);
    throw err;
  }
};
