const DEFAULT_KEY_ID = "rzp_test_TZw5E2BUHZrnOU";

function getKeyId(): string {
  const envKey = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "").trim();
  if (envKey && (envKey.startsWith("rzp_test_") || envKey.startsWith("rzp_live_"))) {
    return envKey;
  }
  return DEFAULT_KEY_ID;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const keyId = getKeyId();
  const secret = (process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || "").trim();
  const isConfigured = Boolean(
    keyId &&
    (keyId.startsWith("rzp_live_") || keyId.startsWith("rzp_test_")) &&
    secret &&
    secret.length >= 8
  );

  return res.status(200).json({
    success: true,
    keyId,
    isConfigured,
    merchantName: "BuildNow",
    currency: "INR"
  });
}
