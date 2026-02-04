import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Sentry must be initialized before any other imports
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions (adjust in production)
  // Set sampling rate for profiling - relative to tracesSampleRate
  profilesSampleRate: 1.0,
  // Environment
  environment: process.env.NODE_ENV || 'development',
});
