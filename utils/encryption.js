const crypto = require("crypto");

//Method-1
const ALGORITHM = {
  // GCM is an authenticated encryption mode that not only provides confidentiality but also provides integrity in a secured way
  BLOCK_CIPHER: "aes-256-gcm",
  // 128 bit auth tag is recommended for GCM
  AUTH_TAG_BYTE_LEN: 16,
  // NIST recommends 96 bits or 12 bytes IV for GCM to promote interoperability, efficiency, and simplicity of design
  IV_BYTE_LEN: 12,
  // NOTE: 256 (in algorithm name) is key size (block size for AES is always 128)
  KEY_BYTE_LEN: 32,
  // to prevent rainbow table attacks
  SALT_BYTE_LEN: 16,
};

const _getRandomKey = () => {
  return crypto.randomBytes(ALGORITHM.KEY_BYTE_LEN);
};

// to prevent rainbow table attacks
const _getSalt = () => {
  return crypto.randomBytes(ALGORITHM.SALT_BYTE_LEN);
};

/**
 *
 * @param {Buffer} password - The password to be used for generating key
 *
 * To be used when key needs to be generated based on password.
 * The caller of this function has the responsibility to clear
 * the Buffer after the key generation to prevent the password
 * from lingering in the memory
 */
const _getKeyFromPassword = (password, salt) => {
  return crypto.scryptSync(password, salt, ALGORITHM.KEY_BYTE_LEN);
};

/**
 *
 * @param {Buffer} messagetext - The clear text message to be encrypted
 * @param {Buffer} key - The key to be used for encryption
 *
 * The caller of this function has the responsibility to clear
 * the Buffer after the encryption to prevent the message text
 * and the key from lingering in the memory
 */
exports.encryption = (messagetext) => {
  const iv = crypto.randomBytes(ALGORITHM.IV_BYTE_LEN);
  const cipher = crypto.createCipheriv(
    ALGORITHM.BLOCK_CIPHER,
    process.env.ENCRYPTION_SECRET_KEY,
    iv,
    {
      authTagLength: ALGORITHM.AUTH_TAG_BYTE_LEN,
    }
  );
  let encryptedMessage = cipher.update(messagetext);
  encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
  encryptedMessage = Buffer.concat([iv, encryptedMessage, cipher.getAuthTag()]);
  return encryptedMessage.toString("hex");
};

/**
 *
 * @param {Buffer} ciphertext - Cipher text
 * @param {Buffer} key - The key to be used for decryption
 *
 * The caller of this function has the responsibility to clear
 * the Buffer after the decryption to prevent the message text
 * and the key from lingering in the memory
 */
exports.decryption = (hash) => {
  const ciphertext = Buffer.from(hash, "hex");
  const authTag = ciphertext.slice(-16);
  const iv = ciphertext.slice(0, 12);
  const encryptedMessage = ciphertext.slice(12, -16);
  const decipher = crypto.createDecipheriv(
    ALGORITHM.BLOCK_CIPHER,
    process.env.ENCRYPTION_SECRET_KEY,
    iv,
    {
      authTagLength: ALGORITHM.AUTH_TAG_BYTE_LEN,
    }
  );
  decipher.setAuthTag(authTag);
  let messagetext = decipher.update(encryptedMessage);
  messagetext = Buffer.concat([messagetext, decipher.final()]);

  return messagetext.toString();
};
