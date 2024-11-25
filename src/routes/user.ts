import { Router, Request, Response } from 'express';
import * as UserService from '../services/user';
import { ensureAuth, ensureAuthWithoutValidation } from '../middleware/auth';
import { ensureAccountValidation, ensurePasswordResetting } from '../middleware/validation';
import { ensurePayment } from '../middleware/payment';
import { query, body, validationResult, matchedData } from 'express-validator';
import ServiceError from '../model/ServiceError';
import * as validators from '../utils/validators';
import { generateKey, isReqValid } from '../utils';
import * as mailer from '../services/mailer';
import print from '../utils/print';

const router = Router();

router.get('/dashboard', ensureAuthWithoutValidation, async (req: Request, res: Response) => {
  try {
    const user = await UserService.getUser(req.session.user.id);
    res.render('website/user/dashboard', { user });
  } catch (error) {
    res.error(error);
  }
});

router.get('/training-plan', ensurePayment, async (req: Request, res: Response) => {
  try {
    const trainingPlan = await UserService.getTrainingPlan(req.session.user.id);
    res.render('website/user/training_plan', { trainingPlan });
  } catch (error) {
    res.error(error);
  }
});

router.get('/random-training-plan', ensurePayment, async (req: Request, res: Response) => {
  try {
    const trainingPlan = await UserService.getRandomTrainingPlan(5);
    res.render('website/user/random_training_plan', { trainingPlan });
  } catch (error) {
    res.error(error);
  }
});

router.get('/history', ensureAuth, [
  query('page').optional().trim().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {

  const limit = 10;
  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (errors.isEmpty()) {
      const pageIndex = data.page || 0;

      const videos = await UserService.getHistroy(
        req.session.user.id,
        pageIndex * limit,
        limit,
      );

      if (videos.length !== 0 || pageIndex == 0) {
        res.render('website/user/history', {
          currentPageIndex: pageIndex,
          videos,
        });
      } else {
        res.redirect('/user/history?page=0');
      }
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/logout', ensureAuthWithoutValidation, async (req: Request, res: Response) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        print.error(`cannot destroy session of host [${req.ip}]`);
        res.render('errors/500');
      } else {
        print(`session of host [${req.ip}] has been destroyed`);
        res.redirect('/');
      }
    });
  } catch (error) {
    res.error(error);
  }
});

router.get('/reset-password', async (req: Request, res: Response) => {
  res.render('website/user/reset_password', {
    errors: {},
    data: {},
  });
});

router.post('/reset-password', [
  body('email', 'No match found for this email address').optional().trim().escape().isEmail().custom(validators.existingEmail),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);
  
  try {
    // If there is a logged user
    if (req.session?.user?.id) {
      const user = await UserService.getUser(req.session.user.id);
      await initPasswordReset(user.email);
    }
    // If there is no logged user use the email sent in the POST request
    else if (isReqValid(req) && data.email) {
      req.session.user = req.session.user || {};
      req.session.user.id = await UserService.getUserIdFromEmail(data.email);
      await initPasswordReset(data.email);
    }
    // If no email was provided throw an error
    else {
      res.status(400).render('website/user/reset_password', {
        errors: errors.mapped(),
        data,
      });
    }
  } catch (error) {
    res.error(error);
  }

  async function initPasswordReset(email: string) {
    const resettingKey = generateKey();

    req.session.user.isResetting = true;
    req.session.user.resettingKey = resettingKey;

    setTimeout(() => {
      delete req.session.user.isResetting;
      delete req.session.user.resettingKey;
    }, 30 * 60 * 1000); // 30 minutes

    const emailSent = await mailer.render(
      'reset_password',
      {
        to: email,
        subject: 'Kettlebell Wiki password reset',
      },
      {
        resettingKey,
      },
    );

    if (emailSent == true) {
      res.render('website/user/reset_password/success');
    } else {
      res.status(500).render('website/user/reset_password/fail');
    }
  }
});

router.get('/change-password', ensurePasswordResetting, [
  query('key').trim().custom(validators.key),
], (req: Request, res: Response) => {

  const data = matchedData(req);

  if (isReqValid(req)) {
    if (data.key === req.session.user.resettingKey) {
      res.render('website/user/change_password', {
        errors: {},
        data: {
          resettingKey: data.key,
        },
      });
    } else {
      res.status(400).render('errors/400');
    }
  } else {
    res.status(400).render('errors/400');
  }
});

router.post('/change-password', ensurePasswordResetting, [
  body('password', 'Invalid password').trim().custom(validators.password),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);

  if (isReqValid(req)) {
    const passwordChanged = await UserService.changePassword(
      req.session.user.id,
      data.password
    );

    if (passwordChanged) {
      delete req.session.user.resettingKey;
      delete req.session.user.isResetting;

      // Delete session so user must login again
      req.session.destroy((error) => {
        if (error) {
          print.error(`cannot destroy session of host [${req.ip}]`);
        } else {
          print(`session of host [${req.ip}] has been destroyed`);
        }
      });

      res.render('website/user/change_password/success');
    } else {
      res.status(500).render('website/user/change_password/success');
    }

  } else {
    res.status(400).render('website/user/change_password', {
      errors: errors.mapped(),
      data,
    });
  }
});

router.get('/validate', ensureAccountValidation, [
  query('key').trim().custom(validators.key),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (isReqValid(req)) {
      const match = data.key === req.session.user.validationKey;
      const isValidated = await UserService.validate(req.session.user.id);

      if (match && isValidated) {

        req.session.user.isValidated = true;
        delete req.session.user.validationKey;

        res.render('website/user/validate', { key: data.key });

      } else {
        res.status(400).render('errors/400');
      }
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/validation-needed', ensureAccountValidation, (req: Request, res: Response) => {
  res.render('website/user/validation_needed');
});

export default router;