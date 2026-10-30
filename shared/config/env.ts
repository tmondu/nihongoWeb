export const env = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'nihongo_db',
    port: Number(process.env.DB_PORT) || 3306,
    ssl:
      process.env.DB_SSL === 'true'
        ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        : undefined,
  },
  azure: {
    key: process.env.AZURE_TRANSLATOR_KEY || '',
    endpoint:
      process.env.AZURE_TRANSLATOR_ENDPOINT ||
      'https://api.cognitive.microsofttranslator.com/',
    region: process.env.AZURE_TRANSLATOR_REGION || 'southeastasia',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail:
      process.env.RESEND_FROM_EMAIL || 'Mondu <noreply@mail.mondu.online>',
  },
  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
  },
  appUrl:
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.mondu.online',
  siteUrl: process.env.SITE_URL || 'https://www.mondu.online',
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  cronSecret: process.env.CRON_SECRET || '',
  githubPat: process.env.GITHUB_PAT || '',
  gemini: {
    apiKey:
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_KEY ||
      process.env.GOOGLE_API_KEY ||
      '',
  },
  healthcheckSecret: process.env.HEALTHCHECK_SECRET || '',
};
