import { Router, Request, Response } from 'express';
import { body, query, validationResult, matchedData } from 'express-validator';
import { isReqValid, generateKey } from '../utils';
import * as UserService from '../services/user';
import * as validators from '../utils/validators';
import { ensureAnonymous, ensureAdmin, ensureAuthWithoutValidation } from '../middleware/auth';
import ServiceError from '../model/ServiceError';
import * as mailer from '../services/mailer';
import * as VideoService from '../services/video';
import print from '../utils/print';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('website/index');
});

router.get('/sign-in', ensureAnonymous, (req: Request, res: Response) => {
  res.render('website/sign_in', {
    errors: {},
    data: {},
  });
});

router.post('/sign-in', ensureAnonymous, [
  body('name', 'Invalid name').trim().custom(validators.humanName),
  body('surname', 'Invalid surname').trim().custom(validators.humanName),
  body('email', 'Invalid email').trim().escape().isEmail().not().custom(validators.existingEmail),
  body('password', 'Invalid password').trim().custom(validators.password),
  body('phone', 'Invalid phone number').trim().optional().custom(validators.phone).customSanitizer(validators.phoneSanitizer),
  body('country', 'Invalid country').trim().isISO31661Alpha2(),
  body('gender', 'Invalid gender').trim().custom(validators.gender),
  body('policy', 'You must check this in order to sign in').equals('on'),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);
  console.log(`host [${req.ip}] tryed to sign-in:`, data, '\nwidth the following errors:', errors.array());

  try {
    if (isReqValid(req)) {
      const id = await UserService.signIn(data as any);
      const validationKey = generateKey();
      req.session.user = { id, validationKey };

      mailer.render(
        'new_user',
        {
          to: 'info@ptlarosa.fitness',
          subject: 'A new user signed in',
        },
        {
          user: {
            name: data.name,
            surname: data.surname,
            email: data.email,
            phone: data.phone ?? '-',
            gender: data.gender,
            country: data.country,
          },
        },
      ).catch(() => print.error);

      const emailSent = await mailer.render(
        'confirm_sign_in',
        {
          to: data.email,
          subject: 'Confirm your account on Kettlebell Wiki',
        },
        {
          user: {
            name: data.name,
            surname: data.surname,
          },
          validationKey,
        },
      );

      if (emailSent) {
        res.render('website/user/validation_needed');
        print(`host [${req.ip}] signed in as '${data.email}'`);
      } else {
        res.status(400).render('errors/500');
      }

    } else {
      res.status(400).render('website/sign_in', {
        errors: errors.mapped(),
        data,
      });
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/login', ensureAnonymous, [
  query('redirect').optional().trim().custom(validators.redirectUrl),
], (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);

  res.status(data.redirect ? 403 : 200).render('website/login', {
    redirect: data.redirect ? encodeURI(data.redirect) : undefined,
    matches: null,
    errors: {},
    data: {},
  });
});

router.post('/login', ensureAnonymous, [
  body('email', 'Invalid email').trim().escape().isEmail().custom(validators.existingEmail),
  body('password', 'Invalid password').trim().custom(validators.password),
  query('redirect').optional().trim().custom(validators.redirectUrl),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);

  print(`host [${req.ip}] POSTed at '/login' as '${data.email}'`);

  try {
    if (isReqValid(req)) {
      const id = await UserService.login(data.email, data.password);
      const isValidated = await UserService.isValidated(id);
      const isAdmin = await UserService.isAdmin(id);
      req.session.user = { id, isValidated, isAdmin };

      print(`host [${req.ip}] logged in as '${data.email}'`);

      if (data.redirect) {
        res.redirect(decodeURI(data.redirect));
      } else {
        res.redirect('user/dashboard');
      }
    } else {
      throw new ServiceError(400);
    }
  } catch (error) {
    if (error?.code?.between(400, 499)) {
      res.status(error.code).render('website/login', {
        redirect: data.redirect ? encodeURI(data.redirect) : undefined,
        errors: errors.mapped(),
        matches: false,
        data,
      });
    } else {
      res.error(error);
    }
  }
});

router.get('/trial', async (req: Request, res: Response) => {
  try {
    const videos = await VideoService.getFreeVideos();
    res.render('website/trial', { videos });
  } catch (error) {
    res.error(error);
  }
});

router.get('/privacy-policy', (req: Request, res: Response) => {
  res.render('website/privacy_policy');
});

export default router;