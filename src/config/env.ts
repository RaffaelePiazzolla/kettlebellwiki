import dotenv from 'dotenv';
import path from 'path';
import print from '../utils/print';
import { parseDatabaseUrl } from '../utils';

let env: Environment;

if (process.env.NODE_ENV === 'production') {
  env = {
    website: {
      port: parseInt(process.env.PORT),
      isHttps: process.env.WEBSITE_SECURE === 'true',
      domain: process.env.WEBSITE_DOMAIN,
    },
    mode: process.env.NODE_ENV,
    database: parseDatabaseUrl(process.env.CLEARDB_DATABASE_URL),
    session: {
      cookieName: process.env.SESSION_COOKIE_NAME,
      secret: process.env.SESSION_SECRET,
      maxAge: parseInt(process.env.SESSION_MAX_AGE),
    },
    mailer: {
      emailAddress: process.env.MAILER_EMAIL_ADDRESS,
      emailPassword: process.env.MAILER_EMAIL_PASSWORD,
      contactEmailAddress: process.env.CONTACT_EMAIL_ADDRESS,
    },
    ipTracing: {
      isEnabled: process.env.IP_TRACING_ENABLED === 'true',
      googleSpreadsheet: {
        serviceAccountEmail: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      },
      bannedIPs: process.env.IP_TRACING_BANNED_IPS.split(/[\s\t\n]*,[\s\t\n]*/g),
    },
  };

  env.website.rootUrl = `http${env.website.isHttps ? 's' : ''}://${env.website.domain}`;
}

if (process.env.NODE_ENV === 'development') {
  const outcome = dotenv.config({
    path: path.join(__dirname, 'config.env'),
  });

  if (outcome.error) {
    print.error('can\'t parse .env file', outcome.error);
    process.exit(1);
  }

  env = {
    website: {
      port: parseInt(process.env.PORT),
      isHttps: process.env.WEBSITE_SECURE === 'true',
      domain: process.env.WEBSITE_DOMAIN,
    },
    mode: process.env.NODE_ENV,
    database: {
      name: process.env.DB_NAME,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      reset: process.env.RESET_DATABASE === 'true',
    },
    session: {
      cookieName: process.env.SESSION_COOKIE_NAME,
      secret: process.env.SESSION_SECRET,
      maxAge: parseInt(process.env.SESSION_MAX_AGE),
    },
    mailer: {
      emailAddress: process.env.MAILER_EMAIL_ADDRESS,
      emailPassword: process.env.MAILER_EMAIL_PASSWORD,
      contactEmailAddress: process.env.CONTACT_EMAIL_ADDRESS,
    },
    ipTracing: {
      isEnabled: process.env.IP_TRACING_ENABLED === 'true',
      googleSpreadsheet: {
        serviceAccountEmail: process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      },
      bannedIPs: process.env.IP_TRACING_BANNED_IPS.split(/[\s\t\n]*,[\s\t\n]*/g),
    },
  };

  env.website.rootUrl = `http://${env.website.domain}:${env.website.port}`;
}

export default env;

interface Environment {
  website: {
    port: number,
    isHttps: boolean,
    domain: string,
    rootUrl?: string,
  },
  mode: 'development' | 'production',
  database: {
    name: string,
    host: string,
    user: string,
    password: string,
    reset?: boolean,
  },
  session: {
    cookieName: string,
    secret: string,
    maxAge: number,
  },
  mailer: {
    emailAddress: string,
    emailPassword: string,
    contactEmailAddress: string,
  },
  ipTracing: {
    isEnabled: boolean,
    googleSpreadsheet: {
      serviceAccountEmail: string,
      privateKey: string,
    },
    bannedIPs: string[],
  },
};