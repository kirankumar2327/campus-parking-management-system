const getRequiredEnv = (primaryKey, fallbackKeys = []) => {
  const keys = [primaryKey, ...fallbackKeys];

  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key];
    }
  }

  throw new Error(`Missing required environment variable: ${primaryKey}`);
};

const getJwtSecret = () => getRequiredEnv("SECRET_KEY", ["JWT_SECRET"]);

const hasEnv = (key) => Boolean(process.env[key]);

const validateRuntimeEnv = () => {
  const warnings = [];

  if (!hasEnv("PORT")) {
    warnings.push("PORT not set. Defaulting to 5000.");
  }

  if (!hasEnv("CLIENT_URL")) {
    warnings.push("CLIENT_URL not set. CORS will allow all origins.");
  }

  if (!hasEnv("EMAIL_FROM")) {
    warnings.push("EMAIL_FROM not set. SMTP user will be used as sender when email is enabled.");
  }

  const missingSmtp = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].filter(
    (key) => !hasEnv(key)
  );

  if (missingSmtp.length > 0) {
    warnings.push(
      `Email alerts will stay disabled until SMTP settings are added: ${missingSmtp.join(", ")}.`
    );
  }

  return warnings;
};

module.exports = {
  hasEnv,
  getRequiredEnv,
  getJwtSecret,
  validateRuntimeEnv,
};
