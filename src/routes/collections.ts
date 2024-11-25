import { Router, Request, Response } from 'express';
import { ensureAuth } from '../middleware/auth';
import ServiceError from '../model/ServiceError';
import * as CollectionService from '../services/collection';

const router = Router();

router.get('/', ensureAuth, async (req: Request, res: Response) => {
  try {
    const collections = await CollectionService.getRandomCollections(100);
    res.render('website/collections', { collections });
  } catch (error) {
    res.error(error);
  }
});

router.get('/:id', ensureAuth, async (req: Request, res: Response) => {
  try {
    const collectionId = parseInt(req.params.id);

    if (!isNaN(collectionId)) {
      const collection = await CollectionService.getCollection(collectionId);
      res.render('website/collections/collection', { collection });
    } else {
      throw new ServiceError(404, `Invalid collection id ${req.params.id}`);
    }

  } catch (error) {
    res.error(error);
  }
});

export default router;