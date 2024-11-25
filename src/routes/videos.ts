import { Router, Request, Response } from 'express';
import { ensureAuth } from '../middleware/auth';
import { ensurePaymentOrFreeVideo } from '../middleware/payment';
import * as VideoService from '../services/video';
import * as UserService from '../services/user';
import ServiceError from '../model/ServiceError';
import { query, validationResult, matchedData } from 'express-validator';

const router = Router();

router.get('/', ensureAuth, [
  query('page').optional().trim().isInt({ min: 0 }).toInt(),
], async (req: Request, res: Response) => {

  const errors = validationResult(req);
  const data = matchedData(req);

  try {
    if (errors.isEmpty()) {
      const pageIndex = data.page || 0;
      const videos = await VideoService.getRandomVideos(20);
      
      res.render('website/videos', {
        videos,
        currentPageIndex: pageIndex,
      });
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }
});

router.get('/:id', ensurePaymentOrFreeVideo, async (req: Request, res: Response) => {
  try {
    const videoId = parseInt(req.params.id);

    if (!isNaN(videoId)) {
      const video = await VideoService.getVideo(videoId);
      const relatedVideos = await VideoService.getRelatedVideos(videoId, 0, 12);
      if (req.session?.user?.id != null) {
        await UserService.addVideoToUserHistory(req.session.user.id, videoId);
      }
      res.render('website/videos/video', { video, relatedVideos });
    } else {
      throw new ServiceError(404);
    }
  } catch (error) {
    res.error(error);
  }
});

export default router;