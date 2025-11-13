const { Redis } = require("ioredis");
const { logger } = require("./winstonLogger");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Initialize Redis client
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    if (err.message.includes("READONLY")) {
      logger.warn("Redis is in READONLY state. Reconnecting...");
      return true;
    }
    return false;
  },
  tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

// Connection Events
redis.on("connect", () => logger.info("Redis connected.."));
redis.on("ready", () => logger.info("Redis ready.."));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));
redis.on("close", () => logger.warn("Redis connection closed"));
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));

// Graceful Shutdown
process.on("SIGINT", async () => {
  try {
    logger.info("Closing Redis connection...");
    await redis.quit();
    logger.info("Redis connection closed cleanly");
  } catch (err) {
    logger.error("Error closing Redis connection:", err);
  } finally {
    process.exit(0);
  }
});

const setRedis = async (command, ...args) => {
  try {
    switch (command.toUpperCase()) {
      case "SET":
        return await redis.set(...args);
      case "SETEX":
        return await redis.setex(...args);
      case "HSET":
        return await redis.hset(...args);
      case "HMSET":
        return await redis.hmset(...args);
      default:
        throw new AppError(400, `Unsupported Redis command: ${command}`);
    }
  } catch (err) {
    logger.error(`Redis SET command failed (${command}): ${err.message}`);
    throw new AppError(500, `Error executing Redis ${command}: ${err.message}`);
  }
};

const getRedis = async (command, ...args) => {
  try {
    switch (command.toUpperCase()) {
      case "GET":
        return await redis.get(...args);
      case "HGET":
        return await redis.hget(...args);
      case "HGETALL":
        return await redis.hgetall(...args);
      case "LRANGE":
        return await redis.lrange(...args);
      default:
        throw new AppError(400, `Unsupported Redis command: ${command}`);
    }
  } catch (err) {
    logger.error(`Redis GET command failed (${command}): ${err.message}`);
    throw new AppError(500, `Error executing Redis ${command}: ${err.message}`);
  }
};

module.export = { redis, getRedis, setRedis };
