export function getEnv(name: string): string {
  const val = process.env[name];
  if (val === undefined || val === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}
