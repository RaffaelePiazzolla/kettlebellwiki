import { response } from 'express';
import ServiceError from '../model/ServiceError';
import print from '../utils/print';

// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata
declare module 'express-session' {
  export interface SessionData {
    user: Record<string, any>;
  }
}

declare module 'express-serve-static-core' {
  export interface Response {
    error(error: Error | number, message?: string): void;
  }

  export interface Request {
    rawBody: string;
  }
}

response.error = function (error: Error | number, message?: string) {
  if (error instanceof ServiceError) {
    if (error.code.between(400, 499)) {
      print.error(`error at '${this?.req?.originalUrl}':`, error.message);
    } else {
      print.errorTrace(`error at '${this?.req?.originalUrl}':`, error.message);
    }
    this.status(error.code).render(
      error.code.isIn([400, 404, 500]) ? `errors/${error.code}` : 'errors',
      { statusCode: error.code, message: error.message },
    );
  } else if (typeof error == 'number' && error.between(100, 599)) {
    print.error(`error at '${this?.req?.originalUrl}':`, error);
    this.status(error).render(
      error.isIn([400, 404, 500]) ? `errors/${error}` : 'errors',
      { statusCode: error, message },
    );
  } else {
    print.errorTrace(`error at '${this?.req?.originalUrl}':`, error);
    this.render('errors/unknown');
  }
};