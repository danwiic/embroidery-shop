import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const getKey = (): Buffer =>
  crypto.scryptSync(process.env.AUTH_SECRET!, "jendave-reset-salt", 32);

export const createResetToken = (email: string): string => {
  const payload = `${email}:${Date.now() + 3_600_000}`; // 1 hour expiry
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(payload, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const verifyResetToken = (token: string): string | null => {
  try {
    const parts = token.split(":");
    const iv = Buffer.from(parts.shift()!, "hex");
    const encrypted = parts.join(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const [email, expiry] = decrypted.split(":");
    if (Date.now() > Number(expiry)) return null;
    return email;
  } catch {
    return null;
  }
};
