/* eslint-env node */
/**
 * Environment configuration for HiringBull.
 *
 * Single .env file — no APP_ENV variants.
 * To add a new variable: add it to the schema below, then add it to ClientEnv if
 * the app (src/) needs it at runtime.
 *
 * New developer setup:
 *   1. Copy .env.example to .env
 *   2. Change EXPO_PUBLIC_API_URL to your local server IP if needed
 *   3. Run: pnpm android
 */
const z = require('zod');
const packageJSON = require('./package.json');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ── Static app constants (never change per environment) ───────────────────────
const BUNDLE_ID = 'com.hiringbull';
const PACKAGE = 'com.hiringbull';
const NAME = 'HiringBull';
const EXPO_ACCOUNT_OWNER = 'hiringbull';
const EAS_PROJECT_ID = 'ba7de147-37b5-4303-9fc1-c9551a52d78a';
const SCHEME = 'hiringbull';

// ── Runtime env vars (from .env) ──────────────────────────────────────────────
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB: z.string().min(1),
  EXPO_PUBLIC_LINKEDIN_CLIENT_ID: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Missing environment variables:',
    parsed.error.flatten().fieldErrors,
    '\n💡 Copy .env.example to .env and fill in the values.'
  );
  throw new Error('Invalid environment variables — check terminal for details.');
}

// ── Exports ───────────────────────────────────────────────────────────────────

/** Used in app.config.ts (build time) */
const Env = {
  NAME,
  SCHEME,
  BUNDLE_ID,
  PACKAGE,
  VERSION: packageJSON.version,
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,
  ...parsed.data,
};

/** Passed via app.config.ts `extra` → accessible in src/ via `import { Env } from '@env'` */
const ClientEnv = {
  NAME,
  SCHEME,
  BUNDLE_ID,
  PACKAGE,
  VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: parsed.data.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: parsed.data.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB: parsed.data.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  EXPO_PUBLIC_LINKEDIN_CLIENT_ID: parsed.data.EXPO_PUBLIC_LINKEDIN_CLIENT_ID,
};

module.exports = { Env, ClientEnv };
