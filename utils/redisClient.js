import { logger } from "./winstonLogger";

const { Redis } = require("ioredis");

const {
  REDIS_HOST = "127.0.0.1",
  REDIS_PORT = 6379,
  REDIS_PASSWORD = "",
  REDIS_DB = 0,
  REDIS_RETRY_DELAY = 2000,
  REDIS_MAX_RETRIES = 10,
} = process.env;

let redisClient;
const createRedisClient = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    password: REDIS_PASSWORD || undefined,
    db: Number(REDIS_DB),
    retryStrategy: (times) => {
      const delay = Math.min(times * 500, Number(REDIS_RETRY_DELAY));
      console.warn(
        `Redis reconnect attempt #${times} — retrying in ${delay}ms`
      );
      if (times > REDIS_MAX_RETRIES) {
        console.error("Redis connection failed after max retries");
        return null;
      }
      return delay;
    },
    reconnectOnError: (err) => {
      const targetErrors = ["READONLY", "ETIMEDOUT", "ECONNRESET"];
      if (targetErrors.some((msg) => err.message.includes(msg))) {
        console.warn("Redis connection error, reconnecting...");
        return true;
      }
      return false;
    },
  });

  // Logging
  redisClient.on("connect", () => logger.log("Connected to Redis"));
  redisClient.on("ready", () => logger.log("Redis client ready for commands"));
  redisClient.on("error", (err) =>
    logger.error("Redis Client Error:", err.message)
  );
  redisClient.on("close", () => logger.warn("Redis connection closed"));
  redisClient.on("reconnecting", () => logger.info("Reconnecting to Redis..."));
  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info("Redis connection closed gracefully");
  }
};

export const redis = createRedisClient();

// function to set different Redis commands
const setRedis = async (command, ...args) => {
  try {
    let result;
    switch (command) {
      case "SET":
        result = await redisClient.set(...args);
        break;

      case "SETEX":
        result = await redisClient.setEx(...args);
        break;

      case "HSET":
        result = await redisClient.hSet(...args);
        break;

      case "HMSET":
        result = await redisClient.hmSet(...args);
        break;

      default:
        throw new Error(`Unsupported command: ${command}`);
    }
    return result;
  } catch (err) {
    throw new AppError(400, `Error executing ${command} command:`, err);
  }
};

// function to get different Redis commands
const getRedis = async (command, ...args) => {
  try {
    let result;
    switch (command) {
      case "GET":
        result = await redisClient.get(...args);
        break;

      case "HGET":
        result = await redisClient.hGet(...args);
        break;

      case "HGETALL":
        result = await redisClient.hGetAll(...args);
        break;

      case "LRANGE":
        result = await redisClient.lRange(...args);
        break;

      default:
        throw new Error(`Unsupported command: ${command}`);
    }
    return result;
  } catch (err) {
    throw new AppError(400, `Error executing ${command} command:`, err);
  }
};

module.exports = { getRedis, setRedis };
