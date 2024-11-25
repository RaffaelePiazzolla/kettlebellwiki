import { Request, Response, NextFunction } from 'express';
import * as VideoService from '../services/video';

export async function ensurePaymentOrFreeVideo(req: Request, res: Response, next: NextFunction) {
  const ensureAuth = req.session?.user?.id != null;

  if (ensureAuth) {
    next();
  } else {
    const videoId = parseInt(req.originalUrl.match(/(\/\d+)$/g).toString().slice(1));
    const video = await VideoService.getVideo(videoId);
    if (video.isFree) {
      next();
    } else {
      res.redirect(`/login?redirect=${encodeURI(req.originalUrl)}`);
    }
  }
}

export async function ensurePayment(req: Request, res: Response, next: NextFunction) {
  const ensureAuth = req.session?.user?.id != null;
  const isValidated = req.session?.user?.isValidated === true || req.session?.user?.isAdmin;
  const ensurePayment = req.session?.user?.didPay || req.session?.user?.isAdmin;

  if (ensureAuth && isValidated && ensurePayment) {
    next();
  } else {
    if (!ensurePayment) {
      res.redirect('/purchase');
    } else if (!isValidated) {
      res.redirect('/user/validation-needed');
    } else {
      res.redirect(`/login?redirect=${encodeURI(req.originalUrl)}`);
    }
  }
}

export function ensureFreeAccount(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.didPay !== true) {
    next();
  } else {
    res.redirect('/user/dashboard');
  }
}