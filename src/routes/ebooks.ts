import { Router, Request, Response } from 'express';
import { ensureAuth } from '../middleware/auth';
import { promises as fs} from 'fs';
import path from 'path';
import print from '../utils/print';

const router = Router();

router.get('/', ensureAuth, (req: Request, res: Response) => {
  res.render('website/ebooks');
});

router.get('/kettlebell-is-the-way.pdf', ensureAuth, async (req: Request, res: Response) => {
  try {
    const pdfPath = path.join(
      require.main.path,
      'private',
      'kettlebell_is_the_way.pdf',
    );
    const pdf = await fs.readFile(pdfPath);
    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    print.error(error);
    res.status(500).send('An error occured while trying to serve this file');
  }
});

export default router;