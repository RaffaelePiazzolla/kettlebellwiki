import { Router, Request, Response } from 'express';

const router = Router();

router.get('/disclaimer', (req: Request, res: Response) => {
  res.render('website/service_terms/disclaimer');
});

router.get('/privacy-policy', (req: Request, res: Response) => {
  res.render('website/service_terms/privacy_policy');
});

router.get('/terms-of-use-agreement', (req: Request, res: Response) => {
  res.render('website/service_terms/terms_of_use_agreement');
});

export default router;