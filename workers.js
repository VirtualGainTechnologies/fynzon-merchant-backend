const { logger } = require("./utils/winstonLogger");

// Load workers
require("./bullmq/workers/invoiceWorker");

logger.info("BullMQ workers started successfully");
