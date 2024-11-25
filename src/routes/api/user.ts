import { Router, Request, Response } from 'express';
import { ensureAuth } from '../../middleware/auth';
import * as UserService from '../../services/user';

const router = Router();

router.delete('/history', ensureAuth.api, async (req: Request, res: Response) => {
  await UserService.deleteHistory(req.session.user.id);
  res.json({ msg: 'history successfully deleted' });
});

export default router;