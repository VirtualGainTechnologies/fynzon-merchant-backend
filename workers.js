const mongoose = require("mongoose");
const { logger } = require("./utils/winstonLogger");
require("dotenv").config();

// uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION 💥 Shutting down worker");
  logger.error(err);
  process.exit(1);
});

// set up mongoose connection
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    logger.info("MongoDB connected (worker)");
  })
  .catch((err) => {
    logger.error("MongoDB connection failed (worker)");
    logger.error(err);
    process.exit(1);
  });

// load workers
require("./bullmq/workers/invoiceWorker");
logger.info("BullMQ workers started successfully");

// unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION 💥 Shutting down worker");
  logger.error(err);
  process.exit(1);
});

// SIGTERM
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down worker...");
  await mongoose.connection.close();
  process.exit(0);
});

// warnings
process.on("warning", (e) => logger.warn(e.stack));
