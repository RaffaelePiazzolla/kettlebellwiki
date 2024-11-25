import initRoutes from './routes';
import initSession from './session';
import initDatabase from './database';
import setErrorHandlers from './errors';
import initMiddleware from './middleware';
import { Application } from 'express';
import env from '../config/env';
import '../extensions';

export default async function initApp(app: Application) {
  // App properties
  app.set('view engine', 'ejs');
  app.set('trust proxy', true);

  // App locals
  app.locals.env = env;
  app.locals.capitalize = (text: string) => text.capitalize();
  app.locals.trimMaxLength = (text: string, maxLength: number) => {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
  };

  // Initialization
  await initDatabase(app);
  initSession(app);
  initMiddleware(app);
  await initRoutes(app);

  // Error handlers
  setErrorHandlers(app);
}