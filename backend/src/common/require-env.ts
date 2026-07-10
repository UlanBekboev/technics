/** Reads a required env var, throwing loudly at startup instead of silently falling back to an insecure default. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
