import main from '../routes/main';
import user from '../routes/user';
import videos from '../routes/videos';
import search from '../routes/search';
import ebooks from '../routes/ebooks';
import purchase from '../routes/purchase';
import collections from '../routes/collections';
import serviceTerms from '../routes/service_terms';
import apiUser from '../routes/api/user';
import { Application } from 'express';
import { initSearch } from '../services/search';

export default async function initRoutes(app: Application) {
  // Website routes
  app.use('/', main);
  app.use('/user', user);
  app.use('/videos', videos);
  app.use('/search', search);
  await initSearch();
  app.use('/ebooks', ebooks);
  app.use('/purchase', purchase);
  app.use('/collections', collections);
  app.use('/service-terms', serviceTerms);

  // API
  app.use('/api/user', apiUser);
};