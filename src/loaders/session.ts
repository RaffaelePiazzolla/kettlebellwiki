import session from 'express-session';
import env from '../config/env';
import { Application } from 'express';
const MySQLStore = require('express-mysql-session')(session);

export default function initSession(app: Application) {
  app.use(session({
    secret: env.session.secret,
    name: env.session.cookieName,
    cookie: {
      domain: env.website.domain,
      maxAge: env.session.maxAge,
    },
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      createDatabaseTable: true,
      database: env.database.name,
      host: env.database.host,
      user: env.database.user,
      password: env.database.password,
    }),
  }));
}