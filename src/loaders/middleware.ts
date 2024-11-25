import morgan from 'morgan';
import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { httpsRedirect, ensureDatabaseConnection, herokuRedirect, ipInfoLogger } from '../middleware/request';
import env from '../config/env';
import { updateUserInfo } from '../middleware/validation';

export default function initMiddleware(app: Application) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(require.main.path, 'public')));
  app.use(morgan(env.mode == 'development' ? 'dev' : ':method :url :status :remote-addr'));
  app.use(updateUserInfo);
  
  if (env.ipTracing.isEnabled) app.use(ipInfoLogger);
  
  if (env.mode == 'production') {
    if (env.website.isHttps) app.use(httpsRedirect);
    app.use(herokuRedirect);
  }
  
  app.use(ensureDatabaseConnection);
};