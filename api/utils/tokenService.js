import crypto from "crypto";

export const resetTokens = new Map();

export const generateResetToken = (email) => {
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { email, expires: Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRATION) });
  return token;
};

export const validateResetToken = (token) => {
  const data = resetTokens.get(token);
  if (!data || Date.now() > data.expires) {
    resetTokens.delete(token);
    return null;
  }
  resetTokens.delete(token); 
  return data.email;
};