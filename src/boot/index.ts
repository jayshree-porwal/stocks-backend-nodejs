import { Application } from 'express';
import cors from './cors';

import requestLogger from './req-logger';
import cronJob from '../cron-job';

import indexRouter from '../routes';
import verdictRouter from '../routes/verdict';
import stockReversalRouter from '../routes/stock-reversal';

export default async (app: Application) => {
  // enable cors
  cors(app);

  app.use(requestLogger);

  // routes
  app.use('/', indexRouter);
  app.use('/verdict', verdictRouter);
  app.use('/v1/stock-reversal', stockReversalRouter);


  // start cron process
  cronJob();
};
