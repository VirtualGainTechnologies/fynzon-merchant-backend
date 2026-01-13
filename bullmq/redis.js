const { Redis } = require("ioredis");
const Redlock = require("redlock").default;

const { logger } = require("../utils/winstonLogger");
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Redis Connection
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    if (err.message.includes("READONLY")) {
      logger.warn("Redis is READONLY, reconnecting...");
      return true;
    }
    return false;
  },
  tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("ready", () => logger.info("Redis ready"));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));
redis.on("close", () => logger.warn("Redis connection closed"));
redis.on("error", (err) => logger.error("Redis Error: " + err.message));

// Redlock Instance
const redlock = new Redlock(
  [redis], // HA: pass multiple redis nodes if using cluster
  {
    driftFactor: 0.01,
    retryCount: 8,
    retryDelay: 400,
    retryJitter: 200,
  }
);

// Redis Commands
const setRedis = async (command, ...args) => {
  switch (command.toUpperCase()) {
    case "SET":
      return redis.set(...args);
    case "SETEX":
      return redis.setex(...args);
    case "HSET":
      return redis.hset(...args);
    case "HMSET":
      return redis.hmset(...args);
    default:
      throw new Error(`Unsupported Redis command: ${command}`);
  }
};

const getRedis = async (command, ...args) => {
  switch (command.toUpperCase()) {
    case "GET":
      return redis.get(...args);
    case "HGET":
      return redis.hget(...args);
    case "HGETALL":
      return redis.hgetall(...args);
    case "LRANGE":
      return redis.lrange(...args);
    default:
      throw new Error(`Unsupported Redis command: ${command}`);
  }
};

module.exports = { redis, setRedis, getRedis, redlock };
