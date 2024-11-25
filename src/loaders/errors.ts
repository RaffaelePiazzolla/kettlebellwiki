import { Application, Request, Response, NextFunction } from 'express';
import print from '../utils/print';
import { isFileRoute } from '../utils';

export default function setErrorHandlers(app: Application) {
  // HTTP incomplete response handler
  // non-GET requests handler
  app.all('*', (req: Request, res: Response) => {
    if (req.method.toUpperCase() == 'GET') {
      if (!isFileRoute(req.originalUrl)) {
        print.warn(`http incomplete GET response at '${req.originalUrl}'`);
      }
      res.status(404).render('errors/404');
    } else {
      if (!isFileRoute(req.originalUrl)) {
        print.warn(`http incomplete ${req.method} response at '${req.originalUrl}'`);
      }
      res.status(404).end();
    }
  });

  // Ungaught exceptions handler
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    print.errorTrace(`uncaught exception at '${req.originalUrl}':\n`, error.message);
    if (isFileRoute(req.originalUrl)) {
      res.status(500).end();
    } else {
      res.error(error);
    }
  });
}

// Handle process exprections
process.on('uncaughtException', (error) => {
  print.error('uncaught exception thrown on process:', error);
  console.trace(error);
  process.exit(1);
}).on('unhandledRejection', (error) => {
  print.error('unhandled rejection thrown on process:', error);
  console.trace(error);
});