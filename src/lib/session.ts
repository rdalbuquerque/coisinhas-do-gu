// Cookie-based session using HMAC-SHA256 (Web Crypto — works in Edge + Node.js)

export const SESSION_COOKIE = "coisinhas-session";

const PAYLOAD = "authenticated";

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(PAYLOAD));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const key = await hmacKey();
    const sigBytes = new Uint8Array(
      (token.match(/.{1,2}/g) ?? []).map((b) => parseInt(b, 16))
    );
    return await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(PAYLOAD));
  } catch {
    return false;
  }
}
