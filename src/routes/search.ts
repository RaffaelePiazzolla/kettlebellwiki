import { Router, Request, Response } from 'express';
import * as VideoService from '../services/video';
import * as CollectionService from '../services/collection';
import { query, validationResult, matchedData } from 'express-validator';
import { isReqValid } from '../utils';
import Video from '../model/Video';
import Collection from '../model/Collection';
import ServiceError from '../model/ServiceError';
import { ensureAuth } from '../middleware/auth';
import * as SearchService from '../services/search';

const router = Router();

router.get('/', ensureAuth, [
  query('q').optional().trim().isLength({ min: 1, max: 100 }),
  query('page').optional().trim().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {

  const limit = 10;
  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (errors.isEmpty()) {
      const pageIndex = data.page || 0;
      let videos: Video[], collections: Collection[];
      
      if (data.q) {
        videos = await SearchService.searchVideos(data.q, pageIndex * limit, limit);
        collections = await SearchService.searchCollection(data.q, pageIndex * limit, limit);
      } else {
        videos = await VideoService.getRandomVideos(20);
        collections = await CollectionService.getRandomCollections(20);
      }

      if (videos.length !== 0 || pageIndex == 0) {
        res.render('website/search', {
          videos,
          collections,
          query: data.q,
          currentPageIndex: pageIndex,
        });
      } else {
        res.redirect(`/search?q=${data.q}&page=0`);
      }
    } else {
      if (errors.mapped().limit) {
        res.redirect(`/search/videos?q=${data.q}`);
      } else {
        res.redirect('/');
      }
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/videos', ensureAuth, [
  query('q').trim().isLength({ min: 1, max: 100 }),
  query('page').optional().trim().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {

  const limit = 10;
  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (isReqValid(req)) {
      const pageIndex = data.page || 0;
      const videos = await SearchService.searchVideos(data.q, pageIndex * limit, limit);
      
      if (videos.length !== 0 || pageIndex == 0) {
        res.render('website/search/videos', {
          videos,
          query: data.q,
          currentPageIndex: pageIndex,
        });
      } else {
        res.redirect(`/search/videos?q=${data.q}&page=0`);
      }
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/collections', ensureAuth, [
  query('q').trim().isLength({ min: 1, max: 100 }),
  query('page').optional().trim().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {

  const limit = 10;
  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (isReqValid(req)) {
      const pageIndex = data.page || 0;
      const collections = await SearchService.searchCollection(data.q, pageIndex * limit, limit);
      
      if (collections.length !== 0 || pageIndex == 0) {
        res.render('website/search/collections', {
          collections,
          query: data.q,
          currentPageIndex: pageIndex,
        });
      } else {
        res.redirect(`/search/collections?q=${data.q}&page=0`);
      }
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }  
});

export default router;