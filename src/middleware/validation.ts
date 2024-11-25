import { Request, Response, NextFunction } from 'express';
import ServiceError from '../model/ServiceError';
import * as UserService from '../services/user';
import * as PurchaseService from '../services/purchase';
import * as database from '../services/database';

export function ensureAccountValidation(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.id != null && req.session?.user?.isValidated !== true) {
    next();
  } else {
    res.redirect('/user/dashboard');
  }
}

export function ensurePasswordResetting(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.isResetting) {
    next();
  } else {
    res.redirect('/user/dashboard');
  }
}

export async function updateUserInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.user?.id;
    req.app.locals.isUserLoggedIn = userId != null;
    
    if (database.isConnected()) {
      if (userId) {
        req.session.user.isAdmin = await UserService.isAdmin(userId);
        req.session.user.isValidated = await UserService.isValidated(userId);
        req.session.user.didPay = await PurchaseService.checkPayment(userId, 1);
      }
    }
    
    req.app.locals.didUserPay = req.session?.user?.didPay || req.session?.user?.isAdmin;
  } catch (error) {
    res.error(new ServiceError(500, `cannot update user info at '${req.originalUrl}': ${error.message}`));
  }
  next();
}