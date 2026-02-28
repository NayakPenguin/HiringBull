/**
 * Validate required environment variables on startup
 * Throws an error if any required variable is missing
 */
export const validateEnv = () => {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
    ];

    const optional = [
        'RESEND_API_KEY',
        'RESEND_FROM_EMAIL',
        'GOOGLE_CLIENT_ID_ANDROID',
        'GOOGLE_CLIENT_ID_IOS',
        'GOOGLE_CLIENT_ID_WEB',
        'LINKEDIN_CLIENT_ID',
        'LINKEDIN_CLIENT_SECRET',
        'GOOGLE_PLAY_SERVICE_ACCOUNT_KEY',
        'SERVER_URL',
    ];

    const missing = [];
    const warnings = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    for (const key of optional) {
        if (!process.env[key]) {
            warnings.push(key);
        }
    }

    if (warnings.length > 0) {
        console.warn(`⚠️  Optional env vars not set: ${warnings.join(', ')}`);
    }

    if (missing.length > 0) {
        throw new Error(
            `❌ Missing required environment variables: ${missing.join(', ')}\n` +
            '   Please check your .env file.'
        );
    }
};
