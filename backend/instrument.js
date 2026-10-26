// Se carga antes que todo lo demás para que Sentry pueda instrumentar Express y pg.
// Si SENTRY_DSN no está definida, Sentry queda apagado y la app anda igual.
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
