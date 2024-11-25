import { Request, Response, NextFunction } from 'express';

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.id != null && req.session?.user?.isValidated === true) {
    next();
  } else {
    if (req.session?.user?.id == null) {
      res.redirect(`/login?redirect=${encodeURI(req.originalUrl)}`);
    } else {
      res.redirect('/user/validation-needed');
    }
  }
}

ensureAuth.api = function (req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.id != null) {
    next();
  } else {
    res.status(403).json({
      msg: 'You are not authorized to access this resource.',
    });
  }
};

export function ensureAuthWithoutValidation(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.id != null) {
    next();
  } else {
    res.redirect(`/login?redirect=${encodeURI(req.originalUrl)}`);
  }
};

export function ensureAnonymous(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.id == null && req.session?.user?.isValidated !== true) {
    next();
  } else {
    res.redirect('/user/dashboard');
  }
}

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.isAdmin === true) {
    next();
  } else {
    res.redirect(`/login?redirect=${encodeURI(req.originalUrl)}`);
  }
}